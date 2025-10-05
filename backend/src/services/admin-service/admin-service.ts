import { UserDAO } from '@src/database/dao/user/user/user-dao.js';

export async function getUsers() {
  const users = await UserDAO.findMultiple();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return { users: users.map(({ google_id, discord_id, patreon_id, ...rest }) => rest) };
}
