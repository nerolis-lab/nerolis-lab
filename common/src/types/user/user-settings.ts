import type { Roles } from '../../types/user/roles';
import type { GetAreaBonusesResponse } from './user-area';

export interface UserSettingsRequest {
  potSize?: number;
  randomizeNicknames?: boolean;
}

export interface UserSettingsResponse {
  name: string;
  avatar: string;
  role: Roles;
  // islands: GetAreasResponse; // TODO: bring back when backend
  areaBonuses: GetAreaBonusesResponse;
  potSize: number;
  supporterSince: string | null;
  randomizeNicknames: boolean;
}
