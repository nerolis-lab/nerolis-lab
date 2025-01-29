import type { BaseUser } from '../../domain/user';

export interface GetFriendsResponse {
  friends: BaseUser[];
}
