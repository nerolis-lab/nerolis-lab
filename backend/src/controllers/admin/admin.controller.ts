import { getUsers } from '@src/services/admin-service/admin-service.js';

export default class AdminController {
  public async getUsers() {
    return getUsers();
  }
}
