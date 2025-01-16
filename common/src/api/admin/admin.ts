import type { Roles } from '../../domain';

export interface User {
  external_id: string;
  name: string;
  avatar?: string;
  role: Roles;
  last_login?: string;
  updated_at?: string;
  created_at?: string;
}

export interface UpdateUserRequest {
  name: string;
  avatar: string;
  external_id: string;
  role: Roles;
}

export interface UsersResponse {
  users: User[];
}
