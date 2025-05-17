import type { Roles } from '../../types/user/roles';
import type { GetAreaBonusesResponse } from './user-area';

export interface UserSettingsRequest {
  potSize: number;
}

export interface UserSettingsResponse {
  name: string;
  avatar: string;
  role: Roles;
  areaBonuses: GetAreaBonusesResponse;
  potSize: number;
  supporterSince: string | null;
}
