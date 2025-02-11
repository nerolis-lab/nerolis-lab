import { config } from '@src/config/config.js';
import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { AuthorizationError } from '@src/domain/error/api/api-error.js';
import { generateFriendCode } from '@src/services/user-service/login-service/login-utils.js';
import type { TokenInfo } from 'google-auth-library';
import { OAuth2Client } from 'google-auth-library';
import type { LoginResponse, RefreshResponse, UpdateUserRequest } from 'sleepapi-common';
import { Roles, uuid } from 'sleepapi-common';

interface DecodedUserData {
  sub: string;
  email: string;
  given_name: string;
  picture: string;
}

export const client = new OAuth2Client({
  clientId: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  redirectUri: 'postmessage'
});

export async function signup(authorization_code: string): Promise<LoginResponse> {
  const { tokens } = await client.getToken({
    code: authorization_code,
    redirect_uri: 'postmessage'
  });

  if (!tokens.refresh_token || !tokens.access_token || !tokens.expiry_date) {
    throw new AuthorizationError(`Missing data in google getToken response. Response: [${JSON.stringify(tokens)}]`);
  }

  client.setCredentials({ access_token: tokens.access_token });

  const userinfo = await client.request<DecodedUserData>({
    url: 'https://www.googleapis.com/oauth2/v3/userinfo'
  });

  const existingUser =
    (await UserDAO.find({ sub: userinfo.data.sub })) ??
    (await UserDAO.insert({
      friend_code: generateFriendCode(),
      sub: userinfo.data.sub,
      external_id: uuid.v4(),
      name: 'New user',
      role: Roles.Default
    }));

  return {
    name: existingUser.name,
    avatar: existingUser.avatar,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
    email: userinfo.data.email,
    externalId: existingUser.external_id,
    role: existingUser.role
  };
}

export async function refresh(refresh_token: string): Promise<RefreshResponse> {
  client.setCredentials({ refresh_token });

  const { token } = await client.getAccessToken();
  const { expiry_date } = client.credentials;

  if (!token || !expiry_date) {
    throw new AuthorizationError('Failed to refresh access token');
  }

  return {
    access_token: token,
    expiry_date
  };
}

export async function verifyExistingUser(access_token: string) {
  client.setCredentials({ access_token });
  const response = await client.request<TokenInfo>({
    url: `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_token}`
  });
  const tokenInfo = response.data;

  if (tokenInfo.aud !== config.GOOGLE_CLIENT_ID) {
    throw new AuthorizationError('Token was not issued from this server');
  }

  return updateLastLogin(tokenInfo.sub);
}

export async function getUser(user: DBUser) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sub, ...rest } = await UserDAO.get({ id: user.id });
  return rest;
}

export async function verifyAdmin(access_token: string) {
  const user = await verifyExistingUser(access_token);
  if (user.role !== Roles.Admin) {
    throw new AuthorizationError('User is not an admin');
  }
  return user;
}

export async function updateLastLogin(inputSub?: string) {
  const user = await UserDAO.get({ sub: inputSub });
  return UserDAO.update({ ...user, last_login: new Date() });
}

export async function updateUser(user: DBUser, newSettings: Partial<UpdateUserRequest>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sub, ...rest } = await UserDAO.update({ ...user, ...newSettings });
  return rest;
}

export async function deleteUser(user: DBUser) {
  UserDAO.delete({ id: user.id });
}
