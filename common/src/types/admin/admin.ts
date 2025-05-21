import type { Roles, User } from '../../types/user';

export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
  external_id?: string;
  role?: Roles;
  friend_code?: string;
}

export interface UsersResponse {
  users: User[];
}
