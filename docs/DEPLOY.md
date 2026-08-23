# Deployment

The live demo runs on AWS in `eu-north-1`. This document describes what is deployed, why it is shaped this way, what it costs, and which compromises were taken knowingly.

---

## What runs where

```
browser
  │  HTTPS
  ▼
Application Load Balancer          TLS termination, health checks
  │  HTTP/1.1 :3001
  ▼
ECS Express Mode service           one Fargate task, 0.25 vCPU / 1 GB
  │  TLS :5432
  ▼
RDS PostgreSQL 18                  db.t4g.micro, single-AZ, 20 GiB
```

The image is built locally, pushed to **ECR**, and pulled from there by ECS. The container serves the API and the built client on the same origin and the same port, which is why there is no CORS configuration and no second deployment for the frontend.

---

## Why it is shaped this way

**One image, not two deployments.** The server hands out the built client itself. A separate static host would mean a second origin, which in turn means CORS and `SameSite=None` cookies, complexity bought for nothing at this size.

**Migrations are not run on container start.** They are applied deliberately from a workstation with `prisma migrate deploy`. Running them at boot means the schema changes at the moment a task happens to restart, including during an autoscaling event or a rollback, which is precisely when a schema change is least welcome.

**The health check does not touch the database.** `/api/health` reports that the process is up and answering. A health check that failed on a database outage would restart the container in a loop. A restart cannot fix a database, and it removes the one thing still able to serve the client an error page.

**Deploy strategy is canary with automatic rollback.** ECS Express Mode routes 5% of traffic to the new version for three minutes, then bakes for three more before retiring the old task set. A deployment whose tasks fail their health checks is reverted without intervention.

---

## Two lessons from putting Node behind a load balancer

Neither of these reproduces in local development, where the dev proxy sits between browser and server and kills nothing.

**Idle HTTP connections.** The balancer keeps connections to the target open and reuses them; its idle timeout is 60 seconds. Node closes an idle connection after 5. The gap is a race: the balancer sends a request into a connection Node is closing, and the client gets a `502` with nothing in the application logs, because the request never arrived. The server must outlive the balancer, so `keepAliveTimeout` is set above 60 seconds and `headersTimeout` above that.

**Idle SSE streams.** `/api/invites/stream` stays open with nothing to send until an invite arrives. To the balancer that is an idle connection, and it is cut at the same 60 seconds. The browser reports `ERR_HTTP2_PROTOCOL_ERROR` on a response that started with `200`. The stream now writes a `: heartbeat` comment every 30 seconds. The spec requires clients to ignore comment lines, so the traffic exists only to reset the timer. The WebSocket transport never had this problem because socket.io already sends its own pings.

Both are properties of proxies in general, not of AWS. Any nginx, Cloudflare or Kubernetes ingress in front of this app would surface the same two bugs.

---

## Cost

Approximate monthly figures for `eu-north-1`, at demo traffic:

| Component | ~USD / month |
| --- | --- |
| Fargate, 0.25 vCPU / 1 GB, always on | 10 |
| Application Load Balancer | 16 |
| RDS `db.t4g.micro` + 20 GiB gp2 | 15 |
| ECR, CloudWatch, egress | < 1 |

Both Fargate and the load balancer are billed by **time, not by requests**, so the bill is the same whether the demo has no visitors or fifty a day. Outbound traffic is free up to 100 GB per month across the account, which at a couple of megabytes per visit is not a constraint this project can reach.

The service is capped at **one task**. Autoscaling would let a traffic spike, or a crawler, multiply the compute bill, and a demo has nothing to gain from scaling out.

The load balancer is the largest single line. Moving to a single EC2 instance with a reverse proxy that obtains its own certificate would remove it, at the cost of managing the host.

---

## Known trade-offs

These are deliberate, and each one has a reason and a cost.

**The database is reachable from the internet.** Its security group allows `0.0.0.0/0` on 5432.

ECS Express Mode places the task in a public subnet with an address that is neither stable nor published, so it cannot be allowed by IP. The clean alternative, a private database plus a VPC-internal path, requires NAT for the container's own outbound traffic, because the app fetches SRD content from public APIs. A managed NAT Gateway costs about $35 a month, more than everything else here combined.

Mitigations: a 32-character random password, TLS required for every connection, and nothing but regenerable demo data in the database. The correct fix is a NAT instance on a `t4g.nano` at roughly $5 a month, which also lets the database go private. It is deferred, not forgotten.

**Connection secrets are plain environment variables.** `DATABASE_URL` and `JWT_SECRET` are stored as plaintext in the task definition, visible to anyone with console access to the account. AWS Secrets Manager references are supported by the same field and would be the right answer for a system with more than one operator.

**TLS to the database is encrypted but unverified.** The connection string uses `uselibpqcompat=true&sslmode=require`, which encrypts the traffic without validating the server certificate chain. Verification requires shipping the RDS CA bundle in the image and switching to `verify-full`. The exposure is a man-in-the-middle inside the AWS network. The fix is three lines and is queued behind getting the first deployment stable.

**Rollback is partial.** Images are tagged both with `latest` and with the short commit hash, so any previously deployed artifact can still be found by name. But the service points at `latest`, so every ECS task-definition revision looks identical and the built-in "roll back to the previous revision" has nothing to distinguish. A failed deployment is reverted automatically by the circuit breaker. A deployment that succeeds and then misbehaves currently has to be fixed forward. Pinning the service to the commit-hash tag closes this, and belongs with the CI/CD work.

---

## Runbook

### Deploy a new version

```powershell
npm run typecheck -w server
npm run test -w server

docker build --platform linux/amd64 -t dnd-campaign-manager .

$sha = git rev-parse --short HEAD
$repo = "<account>.dkr.ecr.eu-north-1.amazonaws.com/dnd-campaign-manager"

docker tag dnd-campaign-manager:latest "${repo}:${sha}"
docker tag dnd-campaign-manager:latest "${repo}:latest"
docker push "${repo}:${sha}"
docker push "${repo}:latest"

aws ecs update-service --cluster default --service dnd-campaign-manager --force-new-deployment --region eu-north-1
```

`--force-new-deployment` is required because the task definition refers to `:latest`, an unchanged string. Without it ECS sees nothing to do.

### Apply migrations

```powershell
$env:DATABASE_URL = "postgresql://postgres:PASSWORD@HOST:5432/dnd?uselibpqcompat=true&sslmode=require"
npm run db:migrate:deploy -w server
```

`migrate deploy` only applies migrations already committed to the repository and will never generate or reset anything. `migrate dev`, its development counterpart, may offer to drop the database and must never be pointed at this connection string.

### Reset the demo data

```powershell
npm run db:seed -w server
```

The container also reseeds on a timer (`DEMO_RESEED_HOURS`), skipping any tick while a socket is connected so it cannot wipe a session in progress.

### Tear down

Delete in this order: ECS Express service, ECR repository, RDS instance, then the security group. The RDS instance is the only resource that keeps costing money while idle. `Stop temporarily` pauses compute for up to seven days, after which AWS restarts it automatically.

---

## What would change for production

Roughly in order of how much each one matters:

1. Secrets in Secrets Manager rather than the task definition
2. A private database, reached through a NAT instance
3. `verify-full` TLS with the RDS CA bundle in the image
4. The service pinned to an immutable image tag, making rollback a one-click operation
5. Deployment moved into CI, so only reviewed and tested commits reach the registry
6. Automated backups and a restore that has actually been rehearsed
7. Multi-AZ for the database, and more than one task for the service
