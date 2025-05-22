import type { Roles } from '../../domain/user/roles';
import type { GetAreaBonusesResponse } from './user-area';

export interface UserSettingsRequest {
  potSize: number;
  useRandomName?: boolean;
}

export interface UserSettingsResponse {
  name: string;
  avatar: string;
  role: Roles;
  areaBonuses: GetAreaBonusesResponse;
  potSize: number;
  supporterSince: string | null;
  useRandomName: boolean;
}
