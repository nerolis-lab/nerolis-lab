import { Roles } from '../../../types/user/roles';
import type { User } from '../../../types/user/user';

export function user(attrs?: Partial<User>): User {
  return {
    name: 'Test Name',
    external_id: '123',
    role: Roles.Default,
    friend_code: 'ABC123',
    avatar: 'default',
    ...attrs
  };
}
