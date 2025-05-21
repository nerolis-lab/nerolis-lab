import type { Static } from '@sinclair/typebox';
import { FriendDAO } from '@src/database/dao/friend/friend-dao.js';
import { NotificationDAO } from '@src/database/dao/notification/notification-dao.js';
import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { DatabaseInsertError } from '@src/domain/error/database/database-error.js';
import type { Filter } from '@src/utils/database-utils/find-filter.js';
import { inArray, like } from '@src/utils/database-utils/find-filter.js';
import type { BaseUser, GetFriendsResponse } from 'sleepapi-common';
import { NotificationType, uuid, SleepAPIError } from 'sleepapi-common';

// Define custom error classes
export class UserNotFoundError extends SleepAPIError {
  constructor(message: string) {
    super('UserNotFoundError', 404, message);
  }
}

export class CannotRemoveSelfError extends SleepAPIError {
  constructor(message: string) {
    super('CannotRemoveSelfError', 400, message);
  }
}

export class FriendshipNotFoundError extends SleepAPIError {
  constructor(message: string) {
    super('FriendshipNotFoundError', 404, message);
  }
}

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

  public async removeFriend(user: DBUser, friendCodeToRemove: string) {
    console.log(`User [${user.id}] attempting to remove friend with code [${friendCodeToRemove}]`);

    let friendToRemove: DBUser;
    try {
      friendToRemove = await UserDAO.get({ friend_code: friendCodeToRemove });
    } catch (e) {
      // Assuming UserDAO.get() throws DatabaseNotFoundError if not found,
      // which is a reasonable assumption based on AbstractDAO
      console.error(
        `Error finding user with friend code [${friendCodeToRemove}]: ${e instanceof Error ? e.message : e}`
      );
      // Let the original error propagate or throw a custom one
      // For now, let's throw a more specific UserNotFoundError
      throw new UserNotFoundError(`User with friend code [${friendCodeToRemove}] not found.`);
    }

    if (friendToRemove.id === user.id) {
      const message = `User [${user.id}] cannot remove themselves.`;
      console.error(message);
      throw new CannotRemoveSelfError(message);
    }

    const deleteFilter: Filter<Static<typeof FriendDAO.schema>> = {
      some: {
        fk_user1_id: user.id,
        fk_user2_id: friendToRemove.id
      },
      // Knex 'orWhere' equivalent for the second condition
      // This is a simplified representation. The actual implementation in AbstractDAO #createQuery
      // handles 'some' by ORing conditions. We need to ensure our filter reflects that.
      // The filter should be: (fk_user1_id = user.id AND fk_user2_id = friendToRemove.id) OR (fk_user1_id = friendToRemove.id AND fk_user2_id = user.id)
      // The current 'some' in AbstractDAO seems to only work for OR conditions on the same field or different fields but not complex AND/OR like this.
      // Let's try deleting twice, once for each combination, or refine the filter if possible.
      // For now, we'll try a more direct approach with two separate delete attempts or a more complex filter.
      // The AbstractDAO's `delete` method takes a single filter.
      // We need to construct a filter that represents the OR condition for the two pair combinations.
      // This is tricky with the current Filter type.
      // Let's try deleting the first combination, and if 0 rows affected, try the second.
    };

    // Attempt to delete (user.id, friendToRemove.id)
    let deletedCount = await FriendDAO.delete({
      fk_user1_id: user.id,
      fk_user2_id: friendToRemove.id,
    });

    // If not found, attempt to delete (friendToRemove.id, user.id)
    if (deletedCount === 0) {
      deletedCount = await FriendDAO.delete({
        fk_user1_id: friendToRemove.id,
        fk_user2_id: user.id,
      });
    }

    if (deletedCount === 0) {
      const message = `Friendship not found between user [${user.id}] and user [${friendToRemove.id}].`;
      console.warn(message);
      throw new FriendshipNotFoundError(message);
    }

    console.log(`Successfully removed friendship between user [${user.id}] and user [${friendToRemove.id}]. Deleted records: ${deletedCount}`);
    // No explicit return value needed, or return void/boolean
  }
}

export const FriendService = new FriendServiceImpl();
