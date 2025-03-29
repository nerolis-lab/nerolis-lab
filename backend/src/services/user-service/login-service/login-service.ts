import { config } from '@src/config/config.js';
import { UserAreaDAO } from '@src/database/dao/user-area/user-area-dao.js';
import { UserSettingsDAO } from '@src/database/dao/user-settings/user-settings-dao.js';
import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { AuthorizationError } from '@src/domain/error/api/api-error.js';
import { generateFriendCode } from '@src/services/user-service/login-service/login-utils.js';
import type { Member as DiscordMember, TokenRequestResult as DiscordTokens, User as DiscordUser } from 'discord-oauth2';
import DiscordOauth2 from 'discord-oauth2';
import type { TokenInfo } from 'google-auth-library';
import { OAuth2Client as GoogleOauth2 } from 'google-auth-library';
import type {
  IslandShortName,
  LoginResponse,
  RefreshResponse,
  UpdateUserRequest,
  UserHeader,
  UserSettingsResponse
} from 'sleepapi-common';
import { AuthProvider, MAX_POT_SIZE, Roles, uuid } from 'sleepapi-common';

// Neroli's Lab Discord server ID
export const DISCORD_GUILD_ID = '1300099710996058252';
export const DISCORD_SUPPORTER_ID = '1329185999816757338';
export const DISCORD_SERVER_BOOSTER_ID = '1330928076133240957';
export const DISCORD_CORE_TEAM_ID = '1300099958757789758';

interface GoogleUserData {
  sub: string;
  email: string;
  given_name: string;
  picture: string;
}

export const googleClient = new GoogleOauth2({
  clientId: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  redirectUri: 'postmessage'
});

export let discordClient: DiscordOauth2 | undefined = undefined;
export function getDiscordClient(redirectUri?: string): DiscordOauth2 {
  if (!discordClient && redirectUri) {
    discordClient = new DiscordOauth2({
      clientId: config.DISCORD_CLIENT_ID,
      clientSecret: config.DISCORD_CLIENT_SECRET,
      redirectUri
    });
  }
  if (!discordClient) {
    throw new AuthorizationError('Discord client not initialized');
  }
  return discordClient;
}

export async function signup(body: {
  authorization_code: string;
  provider: AuthProvider;
  redirect_uri?: string;
  existingUser?: DBUser;
}): Promise<LoginResponse> {
  const { authorization_code, provider, redirect_uri, existingUser } = body;

  if (provider === 'google') {
    return signupWithGoogle(authorization_code, existingUser);
  } else if (provider === 'discord') {
    if (!redirect_uri) {
      throw new AuthorizationError('Redirect URI is required for Discord authentication');
    }
    return signupWithDiscord(authorization_code, redirect_uri);
  }

  throw new AuthorizationError(`Unsupported auth provider: ${provider}`);
}

// Currently doesn't revoke tokens as we don't store tokens for every provider
export async function unlink(provider: AuthProvider, user: DBUser) {
  const providerIsLinked = isProviderLinked(provider, user);
  if (!providerIsLinked) {
    throw new AuthorizationError(`No ${provider} account linked to this user`);
  }

  const linkedProviders = getLinkedProviders(user);
  if (linkedProviders.length <= 1) {
    throw new AuthorizationError('Cannot unlink the only authentication provider');
  }

  return await unlinkProviderFromUser(provider, user);
}

function isProviderLinked(provider: AuthProvider, user: DBUser): boolean {
  switch (provider) {
    case AuthProvider.Google:
      return !!user.sub;
    case AuthProvider.Discord:
      return !!user.discord_id;
    default:
      return false;
  }
}

async function unlinkProviderFromUser(provider: AuthProvider, user: DBUser): Promise<DBUser> {
  switch (provider) {
    case AuthProvider.Google:
      user.sub = undefined;
      break;
    case AuthProvider.Discord:
      user.discord_id = undefined;
      break;
    default:
      throw new AuthorizationError(`Unsupported auth provider: ${provider}`);
  }

  return await UserDAO.update(user);
}

function getLinkedProviders(user: DBUser): AuthProvider[] {
  const providers: AuthProvider[] = [];
  if (user.sub) {
    providers.push(AuthProvider.Google);
  }
  if (user.discord_id) {
    providers.push(AuthProvider.Discord);
  }
  return providers;
}

async function signupWithGoogle(authorization_code: string, preExistingUser?: DBUser): Promise<LoginResponse> {
  const { tokens } = await googleClient.getToken({
    code: authorization_code,
    redirect_uri: 'postmessage'
  });

  if (!tokens.refresh_token || !tokens.access_token || !tokens.expiry_date) {
    throw new AuthorizationError(`Missing data in google getToken response. Response: [${JSON.stringify(tokens)}]`);
  }

  googleClient.setCredentials({ access_token: tokens.access_token });

  const userinfo = await googleClient.request<GoogleUserData>({
    url: 'https://www.googleapis.com/oauth2/v3/userinfo'
  });

  let existingUser: DBUser;
  if (preExistingUser) {
    // user sent credentials from frontend, indicating they are already signed up, but with different provider
    existingUser = await UserDAO.update({ ...preExistingUser, sub: userinfo.data.sub });
  } else {
    // either first time signing up ever, or new device
    existingUser =
      (await UserDAO.find({ sub: userinfo.data.sub })) ??
      (await UserDAO.insert({
        friend_code: generateFriendCode(),
        sub: userinfo.data.sub,
        external_id: uuid.v4(),
        name: 'New user',
        role: Roles.Default
      }));
  }

  return {
    name: existingUser.name,
    avatar: existingUser.avatar,
    friendCode: existingUser.friend_code,
    auth: {
      activeProvider: AuthProvider.Google,
      tokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date
      },
      linkedProviders: {
        [AuthProvider.Google]: {
          linked: true,
          identifier: userinfo.data.email
        },
        [AuthProvider.Discord]: {
          linked: !!preExistingUser?.discord_id
        }
      }
    },
    externalId: existingUser.external_id,
    role: existingUser.role
  };
}

async function signupWithDiscord(
  authorization_code: string,
  redirect_uri: string,
  preExistingUser?: DBUser
): Promise<LoginResponse> {
  try {
    const oauth = getDiscordClient(redirect_uri);
    const tokenData: DiscordTokens = await oauth.tokenRequest({
      code: authorization_code,
      scope: 'identify guilds.members.read',
      grantType: 'authorization_code'
    });

    const { access_token, refresh_token, expires_in } = tokenData;

    if (!refresh_token || !access_token || !expires_in) {
      throw new AuthorizationError(`Missing data in Discord token response`);
    }

    const userData: DiscordUser = await oauth.getUser(access_token);

    let existingUser: DBUser;
    if (preExistingUser) {
      // user sent credentials from frontend, indicating they are already signed up, but with different provider
      existingUser = await UserDAO.update({ ...preExistingUser, discord_id: userData.id });
    } else {
      // either first time signing up ever, or new device
      existingUser =
        (await UserDAO.find({ discord_id: userData.id })) ??
        (await UserDAO.insert({
          friend_code: generateFriendCode(),
          discord_id: userData.id,
          external_id: uuid.v4(),
          name: 'New user',
          role: Roles.Default
        }));
    }

    const expiry_date = Date.now() + expires_in * 1000;

    return {
      name: existingUser.name,
      avatar: existingUser.avatar,
      friendCode: existingUser.friend_code,
      auth: {
        activeProvider: AuthProvider.Discord,
        tokens: {
          accessToken: access_token,
          expiryDate: expiry_date,
          refreshToken: refresh_token
        },
        linkedProviders: {
          [AuthProvider.Discord]: {
            linked: true,
            identifier: userData.username
          },
          [AuthProvider.Google]: {
            linked: !!preExistingUser?.sub
          }
        }
      },
      externalId: existingUser.external_id,
      role: existingUser.role
    };
  } catch {
    throw new AuthorizationError('Failed to authenticate with Discord');
  }
}

export async function refresh(body: {
  refresh_token: string;
  provider: AuthProvider;
  redirect_uri?: string;
}): Promise<RefreshResponse> {
  const { refresh_token, provider, redirect_uri } = body;

  if (provider === 'google') {
    return refreshGoogleToken(refresh_token);
  } else if (provider === 'discord') {
    if (!redirect_uri) {
      throw new AuthorizationError('Redirect URI is required for Discord authentication');
    }
    return refreshDiscordToken(refresh_token, redirect_uri);
  }

  throw new AuthorizationError(`Unsupported auth provider: ${provider}`);
}

async function refreshGoogleToken(refresh_token: string): Promise<RefreshResponse> {
  googleClient.setCredentials({ refresh_token });

  const { token } = await googleClient.getAccessToken();
  const { expiry_date } = googleClient.credentials;

  if (!token || !expiry_date) {
    throw new AuthorizationError('Failed to refresh Google access token');
  }

  return {
    access_token: token,
    expiry_date
  };
}

async function refreshDiscordToken(refresh_token: string, redirect_uri: string): Promise<RefreshResponse> {
  const tokenData: DiscordTokens = await getDiscordClient(redirect_uri).tokenRequest({
    refreshToken: refresh_token,
    grantType: 'refresh_token',
    scope: ['identify', 'email', 'guilds.members.read']
  });

  const { access_token, expires_in } = tokenData;

  if (!access_token || !expires_in) {
    throw new AuthorizationError('Missing data in Discord refresh token response');
  }

  // Calculate expiry date in milliseconds
  const expiry_date = Date.now() + expires_in * 1000;

  return {
    access_token,
    expiry_date
  };
}

export async function verifyExistingUser(userHeader: UserHeader): Promise<DBUser> {
  if (userHeader.Provider === 'google') {
    googleClient.setCredentials({ access_token: userHeader.Authorization });
    const response = await googleClient.request<TokenInfo>({
      url: `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${userHeader.Authorization}`
    });
    if (!response?.data?.sub) {
      throw new AuthorizationError('Missing sub in Google token info response');
    }

    return updateLastLogin(response.data.sub, userHeader.Provider);
  } else if (userHeader.Provider === 'discord') {
    const response = await getDiscordClient(userHeader.Redirect).getUser(userHeader.Authorization);
    return updateLastLogin(response.id, userHeader.Provider);
  } else throw new AuthorizationError(`Unsupported auth provider: ${userHeader.Provider}`);
}

export async function verifyAdmin(userHeader: UserHeader) {
  const user = await verifyExistingUser(userHeader);
  if (user.role !== Roles.Admin) {
    throw new AuthorizationError('User is not an admin');
  }
  return user;
}

export async function updateLastLogin(identifier: string, provider: AuthProvider): Promise<DBUser> {
  const user =
    provider === 'google' ? await UserDAO.get({ sub: identifier }) : await UserDAO.get({ discord_id: identifier });
  return UserDAO.update({ ...user, last_login: new Date() });
}

export async function updateUser(user: DBUser, newSettings: Partial<UpdateUserRequest>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sub, discord_id, ...rest } = await UserDAO.update({ ...user, ...newSettings });
  return rest;
}

export async function deleteUser(user: DBUser) {
  UserDAO.delete({ id: user.id });
}

export async function getUserSettings(user: DBUser, userHeader: UserHeader): Promise<UserSettingsResponse> {
  const areaBonusesRaw = await UserAreaDAO.findMultiple({ fk_user_id: user.id });

  const areaBonuses: Partial<Record<IslandShortName, number>> = {};
  for (const areaBonus of areaBonusesRaw) {
    areaBonuses[areaBonus.area] = areaBonus.bonus;
  }

  const userSettings = await UserSettingsDAO.find({ fk_user_id: user.id });
  const potSize = userSettings?.pot_size ?? MAX_POT_SIZE;

  try {
    // check if user should have supporter role
    const guildMember: DiscordMember = await getDiscordClient(userHeader.Redirect).getGuildMember(
      userHeader.Authorization,
      DISCORD_GUILD_ID
    );

    let shouldUpdateRole = false;
    if (guildMember.roles.includes(DISCORD_CORE_TEAM_ID)) {
      if (user.role !== Roles.Admin) {
        user.role = Roles.Admin;
        shouldUpdateRole = true;
      }
    } else if (guildMember.roles.some((role) => [DISCORD_SUPPORTER_ID, DISCORD_SERVER_BOOSTER_ID].includes(role))) {
      if (user.role !== Roles.Supporter) {
        user.role = Roles.Supporter;
        shouldUpdateRole = true;
      }
    } else if (user.role !== Roles.Default) {
      user.role = Roles.Default;
      shouldUpdateRole = true;
    }
    if (shouldUpdateRole) {
      await UserDAO.update(user);
    }
  } catch {
    // do nothing, user is not in the guild
  }

  return {
    name: user.name,
    avatar: user.avatar ?? 'default',
    role: user.role,
    areaBonuses,
    potSize
  };
}

export async function upsertUserSettings(user: DBUser, potSize: number) {
  await UserSettingsDAO.upsert({
    updated: { fk_user_id: user.id, pot_size: potSize },
    filter: { fk_user_id: user.id }
  });
  return;
}
