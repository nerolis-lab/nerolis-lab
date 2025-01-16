import { UserDAO } from '@src/database/dao/user/user-dao.js';

export async function getUsers() {
  const users = await UserDAO.findMultiple();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return { users: users.map(({ sub, ...rest }) => rest) };
}
