export type Invite = {
  id: string;
  email: string | null;
  createdAt: Date;
  token: string;
  campaignId: string;
  status: string;
  expiresAt: Date;
}

export type GetInvitesResponse = {
  status: 'ok' | 'error';
  message: string;
  invites: Invite[];
}

export type RespondToInviteResponse = {
  status: 'ok' | 'error';
  message: string;
}

export type GetInviteByTokenResponse = {
  status: 'ok' | 'error';
  message: string;
  invite: Invite;
}

export type CreateInviteResponse = {
  status: 'ok' | 'error';
  message: string;
  response: {
    token: string;
    expiresAt: Date;
  }
}