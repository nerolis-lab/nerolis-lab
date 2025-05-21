import type { Static } from '@sinclair/typebox';
import { FriendDAO } from '@src/database/dao/friend/friend-dao.js';
import { NotificationDAO } from '@src/database/dao/notification/notification-dao.js';
import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { BadRequestError, ForbiddenError } from '@src/domain/error/api/api-error.js';
import { DatabaseInsertError } from '@src/domain/error/database/database-error.js';
import { PatreonProvider } from '@src/services/user-service/login-service/providers/patreon/patreon-provider.js';
import type { Filter } from '@src/utils/database-utils/find-filter.js';
import { inArray, like } from '@src/utils/database-utils/find-filter.js';
import type { BaseUser, GetFriendsResponse } from 'sleepapi-common';
import { NotificationType, Roles, uuid } from 'sleepapi-common';

class FriendServiceImpl {
  public async getFriends(user: DBUser): Promise<GetFriendsResponse> {
    const filter: Filter<Static<typeof FriendDAO.schema>> = {
      some: {
        fk_user1_id: like(`${user.id}`),
        fk_user2_id: like(`${user.id}`)
      }
    };

    const friendsRaw = await FriendDAO.findMultiple(filter);

    const friends: BaseUser[] = [];
    for (const friend of friendsRaw) {
      const friendId = friend.fk_user1_id === user.id ? friend.fk_user2_id : friend.fk_user1_id;
      const friendUser = await UserDAO.get({ id: friendId });
      friends.push({
        name: friendUser.name,
        friend_code: friendUser.friend_code,
        avatar: friendUser.avatar
      });
    }

    return { friends };
  }

  public async sendRequest(user: DBUser, receiverCode: string) {
    const receiver = await UserDAO.get({ friend_code: receiverCode });

    const maybeAlreadySent = await NotificationDAO.find({
      fk_sender_id: user.id,
      fk_receiver_id: receiver.id,
      template: NotificationType.FriendRequest
    });
    const maybeAlreadyFriends = await FriendDAO.find({
      fk_user1_id: inArray([user.id, receiver.id]),
      fk_user2_id: inArray([user.id, receiver.id])
    });

    if (maybeAlreadySent || maybeAlreadyFriends) {
      throw new DatabaseInsertError('Users already connected');
    } else {
      return NotificationDAO.insert({
        fk_receiver_id: receiver.id,
        fk_sender_id: user.id,
        template: NotificationType.FriendRequest,
        external_id: uuid.v4()
      });
    }
  }

  public async acceptRequest(user: DBUser, senderCode: string) {
    const sender = await UserDAO.get({ friend_code: senderCode });
    await NotificationDAO.delete({
      fk_sender_id: sender.id,
      fk_receiver_id: user.id,
      template: NotificationType.FriendRequest
    });

    const maybeAlreadyFriends = await FriendDAO.find({
      fk_user1_id: inArray([user.id, sender.id]),
      fk_user2_id: inArray([user.id, sender.id])
    });
    if (!maybeAlreadyFriends) {
      return await FriendDAO.insert({
        fk_user1_id: sender.id,
        fk_user2_id: user.id
      });
    } else throw new DatabaseInsertError('Users already connected');
  }

  public async declineRequest(user: DBUser, senderCode: string) {
    const sender = await UserDAO.get({ friend_code: senderCode });
    await NotificationDAO.delete({
      fk_sender_id: sender.id,
      fk_receiver_id: user.id,
      template: NotificationType.FriendRequest
    });
  }

  public async validateFriendCodeUpdate(user: DBUser, newFriendCode: string) {
    logger.info(`User ${user.name} updating friend code to ${newFriendCode}`);
    if (newFriendCode.length !== 6 || !/^[A-Z0-9]{6}$/.test(newFriendCode)) {
      throw new BadRequestError('Invalid friend code format. Must be 6 characters, A-Z, 0-9.');
    }

    if (!user.patreon_id) {
      throw new ForbiddenError('Patreon account not linked. Supporter status cannot be verified.');
    }

    const patreonInfo = await PatreonProvider.isSupporter({
      patreon_id: user.patreon_id,
      previousRole: user.role
    });
    if (patreonInfo.role !== Roles.Supporter && patreonInfo.role !== Roles.Admin) {
      throw new ForbiddenError('User is not a Patreon supporter.');
    }
  }
}

export const FriendService = new FriendServiceImpl();
