import type { Roles } from './roles';

export interface BaseUser {
  avatar?: string;
  friend_code: string;
  name: string;
}

export interface User extends BaseUser {
  external_id: string;
  role: Roles;
  last_login?: string;
  updated_at?: string;
  created_at?: string;
}
