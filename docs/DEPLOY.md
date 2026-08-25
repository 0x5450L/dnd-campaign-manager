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

**The database is not addressable from the internet, and closing it cost nothing.** Its security group admits 5432 from exactly two sources: the security group attached to the ECS task, and a single `/32` for the operator's workstation, which is how migrations and the seed are applied. Neither source is an address range, and there is no rule an internet scanner can match.

The plan this replaced was a NAT instance and private subnets, about $5 a month and an afternoon of work. Its premise was that the task's address is neither stable nor published and therefore cannot be allowed, which is true, and its conclusion did not follow: a security group rule can name another security group as its source and needs no address at all. Private subnets answer a different question, namely what the container may reach on its way out, and here that traffic is wanted, since the app fetches SRD content from public APIs.

The cost of the cheap version is a coupling worth writing down. The rule points at the security group Express Mode created for this service, so recreating the service would leave the rule pointing at a group nothing belongs to. The deployment would then fail its readiness check rather than fail quietly, which is the failure mode to prefer, but the rule is the thing to fix first if that ever happens.

**The database connection is verified, not merely encrypted.** `sslmode=require` on its own encrypts the traffic and then accepts whatever certificate the other end presents: protection against listening, none against a man in the middle, which is worth closing even now that nothing outside the VPC can open a connection at all. The image ships Amazon's public RDS root certificates for `eu-north-1` in `server/certs`, the task definition points `DATABASE_CA_PATH` at them, and the configuration rewrites the connection string to `sslmode=verify-full` against that bundle. The bundle is a public file, so the deployment learns a path, not a password, and the secret is untouched.

Rewriting the string rather than handing TLS options to the driver is deliberate. `node-postgres` merges the parsed connection string over any options passed beside it, so an `sslmode` inside `DATABASE_URL` silently overrides an `ssl` object set in code. Keeping the parameter in the string it belongs to removes that ambiguity, and the unit tests assert that a weaker `sslmode` is replaced rather than appended.

**The health check does not touch the database.** `/api/health` reports that the process is up and answering. A health check that failed on a database outage would restart the container in a loop. A restart cannot fix a database, and it removes the one thing still able to serve the client an error page.

**Readiness is a separate endpoint with a separate consumer.** `/api/health/ready` runs `select 1` and answers `503` when it cannot. Nothing platform-side probes it, precisely so that a database outage cannot turn into a restart loop; the deployment workflow is its only caller. The split exists because liveness and readiness answer different questions, and the deploy needs the one liveness refuses to ask. It also names the AI provider the process actually resolved, reporting `misconfigured` rather than `gemini` when the key never arrived, and the deploy fails on anything but `gemini`. That field exists because the demo once ran for days on the mock generator: `AI_PROVIDER` unset falls back to mock when there is no key, which is the correct default for a checkout and the wrong one for production, and nothing outside the app said so. Production now sets `AI_PROVIDER=gemini` explicitly, so a missing key is a loud 503 from the generator instead of plausible placeholder prose. It is unauthenticated and costs one trivial query per call, which is the price of being reachable by a workflow that holds no credentials for the application. Its failure branch is the one part of this that no live environment can exercise on demand, so it is covered by a unit test that hands the route a database which refuses to answer.

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

**Connection secrets are plain environment variables.** `DATABASE_URL` and `JWT_SECRET` live in GitHub Secrets and are injected into the task definition by the deployment workflow, where they end up as plaintext readable by anyone holding `ecs:DescribeTaskDefinition`. The deploy action accepts a `secrets` input taking Secrets Manager or SSM Parameter Store ARNs instead, and moving to it is roughly twenty minutes of work.

It is deferred on purpose, because the threat it answers does not exist here. A secret store separates people who may run the service from people who may read its credentials, and this account has one operator. It does nothing against an attacker who already holds credentials for the account: that attacker calls `GetSecretValue`, or reads the environment of a running task, or replaces the image outright.

The part that does bite a single operator is that task-definition revisions are immutable and kept indefinitely, so every deployment leaves another copy of the current password in the account's history. Rotating the database password would not retract the old one; the retired value stays readable in older revisions until they are deregistered by hand. That is the reason this becomes worth doing the moment the credentials stop being disposable, rather than the moment a checklist mentions it.

**The AI key is not, and that is the line between the two.** `GEMINI_API_KEY` is injected through the deploy action's `secrets` input from an SSM Parameter Store `SecureString`, so the task definition holds the parameter's ARN and never the key itself. The reasoning above does not carry over to it, for two reasons. The database password and the signing key are disposable: they protect data the seed recreates in two minutes, they are reachable only from inside the VPC, and rotating them costs one deploy. A Gemini key is a credential for somebody else's billed account, it works from any machine on the internet, and a copy of it that leaks is spent by whoever holds it. The second reason is the one the trade-off above already names as the moment to move: task-definition revisions are immutable and kept indefinitely, so a plaintext key would leave a working copy of itself in every revision ever deployed, and rotating it would retract none of them.

Parameter Store rather than Secrets Manager because the standard tier is free and the rotation Secrets Manager sells cannot be automated against Google's key issuance anyway, which leaves the two products separated by cost alone at this size.

**The database has no backups.** Automated backups are switched off, so there is no point-in-time recovery. The only data here is the demo campaign, which the seed recreates in two minutes, and paying for backups of regenerable data would be theatre. Any real content would flip this immediately.

---

## Continuous deployment

`.github/workflows/ci.yml` runs typecheck, lint, unit tests, integration tests against a real Postgres, and a production build. On a push to `main`, and only if all of that passed, a second job builds the image, pushes it to ECR tagged with the short commit hash, and updates the Express service.

**No AWS credentials are stored in GitHub.** The workflow authenticates through OIDC: GitHub issues a signed token for the run, AWS trusts that issuer for this repository only, and hands back credentials that expire when the job ends. There is no access key to leak or to rotate.

**The service is pinned to the commit hash, never to `latest`.** This is what makes rollback real. Every deployment produces a distinct image tag and a distinct task-definition revision, so "go back to what was running yesterday" identifies something specific.

The workflow is also the single source of truth for the service configuration: port, health check path, CPU, memory, task count and environment variables are all declared there, not clicked into a console where nobody can review them.

**A green deploy job means a live service, not an accepted API call.** The deploy action returns once ECS has accepted the new task set, which is minutes before traffic actually moves, so a task that crashed on boot used to leave the run green while the old version kept serving. The last step of the job closes that gap. The image is stamped at build time with the short commit hash through a `BUILD_VERSION` build argument, both health endpoints report that stamp, and the job polls `/api/health/ready` until it reads the expected hash five times in a row, failing after fifteen minutes. Readiness rather than liveness, so that one poll settles both questions at once: this is the new build, and it can reach the database.

Five consecutive reads rather than one, because the canary routes 5% of traffic to the new version for the first three minutes: a single matching answer proves the new task exists, not that it took over. Fifteen minutes, because the canary and bake windows together run past six, and a task that is slow to become healthy should be reported as slow rather than as broken.

**Log retention is set by the workflow, not clicked once.** CloudWatch keeps log groups forever by default, so a demo quietly pays storage rent on debug output nobody will read. The final step of the deploy job puts a seven-day expiry on every log group whose name contains `dnd` and does not already have it. In CI rather than in the console because Express Mode recreates the log group when the service is recreated, and a one-time console setting would silently not survive that. The step needs `logs:DescribeLogGroups` and `logs:PutRetentionPolicy` on `github-actions-ecs-role`.

### Configuration

Repository variables (Settings, Secrets and variables, Actions, Variables):

| Name | Value |
| --- | --- |
| `AWS_ACCOUNT_ID` | the 12-digit account id |

Repository secrets, same page:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | full connection string; the TLS parameters are added by the application, not stored here |
| `JWT_SECRET` | the token signing key |

The AI key is deliberately not in this table. It lives in SSM Parameter Store, and the workflow passes only its ARN:

```powershell
aws ssm put-parameter `
  --name /dnd-campaign-manager/GEMINI_API_KEY `
  --type SecureString `
  --value "THE-KEY" `
  --region eu-north-1
```

The `deploy` IAM user cannot run this: its policy covers ECR and ECS and nothing else, which is the point of a deployment identity. Creating and rotating the parameter is an operator action, done from the console or with admin credentials, and the deployment identity is never given `ssm:PutParameter` — a workflow that can rewrite the secret it reads is a workflow that can exfiltrate it.

Rotating it later is the same command with `--overwrite`, and the next task to start picks up the new value; nothing in the repository or in any task definition changes. The execution role (`ecsTaskExecutionRole`, not the task role — the agent reads secrets before the container exists) needs `ssm:GetParameters` on `arn:aws:ssm:eu-north-1:<account>:parameter/dnd-campaign-manager/*`. A `SecureString` under the AWS-managed key needs no extra `kms:Decrypt` grant; a customer-managed key would.

The failure mode to know: a parameter the execution role cannot read makes the task fail to start rather than start without the key, which is the right way round.

Region, repository name, service name, cluster and the public application URL are plain `env` entries in the workflow, since none of them is sensitive.

---

## Runbook

### Deploy a new version

Merge to `main`. That is the whole procedure.

### Roll back

Open the Actions tab, find the last workflow run that deployed a good version, and re-run its deploy job. It rebuilds nothing: the image for that commit is already in ECR under its own tag, and the service is repointed at it.

A deployment that fails its health checks never needs this. The ECS circuit breaker reverts it automatically, and the canary means only 5% of traffic ever reached it. The verification step is what makes that visible: the reverted deployment leaves the old version live, the job never reads the new hash, and the run ends red.

### Deploy from a workstation

The fallback when CI is unavailable. It requires the `deploy` IAM user's credentials configured locally.

```powershell
docker build --platform linux/amd64 -t dnd-campaign-manager .

$sha = git rev-parse --short HEAD
$repo = "<account>.dkr.ecr.eu-north-1.amazonaws.com/dnd-campaign-manager"

docker tag dnd-campaign-manager:latest "${repo}:${sha}"
docker push "${repo}:${sha}"
```

Then point the service at that tag from the ECS console. Doing this bypasses every test in CI, which is the reason it is written down as an exception rather than as the normal path.

### Apply migrations

```powershell
$env:DATABASE_URL = "postgresql://postgres:PASSWORD@HOST:5432/dnd?sslmode=require"
npm run db:migrate:deploy -w server
```

This works because the database's security group holds a `/32` rule for the workstation. Home addresses change, and when this command hangs on connect rather than failing on credentials, that rule is the first thing to check: the console's `My IP` option rewrites it in one click.

Migrations are applied by Prisma's own engine, which reads `DATABASE_URL` exactly as given and does not pass through the application configuration. The `verify-full` rewrite therefore does not apply here, and the workstation connection is as verified as whatever the operator typed. An asymmetry worth knowing about rather than being surprised by.

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
2. The database in private subnets, so that one wrong security group rule cannot undo the isolation
3. Automated backups and a restore that has actually been rehearsed
4. A required reviewer on the `production` GitHub environment, so a merge is not by itself a deploy
5. Multi-AZ for the database, and more than one task for the service
