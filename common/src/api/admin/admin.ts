import type { Roles, User } from '../../domain/user';

export interface UpdateUserRequest {
  name: string;
  avatar: string;
  external_id: string;
  role: Roles;
}

export interface UsersResponse {
  users: User[];
}
