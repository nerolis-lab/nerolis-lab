import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { FriendService } from '@src/services/friend-service/friend-service.js';

export default class FriendController {
  public async getFriends(user: DBUser) {
    return FriendService.getFriends(user);
  }

  public async sendRequest(user: DBUser, receiverCode: string) {
    return FriendService.sendRequest(user, receiverCode);
  }

  public async acceptRequest(user: DBUser, senderCode: string) {
    return FriendService.acceptRequest(user, senderCode);
  }

  public async declineRequest(user: DBUser, senderCode: string) {
    return FriendService.declineRequest(user, senderCode);
  }
}
