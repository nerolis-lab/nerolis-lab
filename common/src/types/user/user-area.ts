import type { IslandInstance, IslandShortName } from '../../types/island/island';

// TODO: bring back when backend responds with island
export type AreaInstances = Record<IslandShortName, IslandInstance>;
export interface UpsertAreaBonusRequest {
  area: IslandShortName;
  bonus: number;
}
// export type GetAreasResponse = AreaInstances;
export type GetAreaBonusesResponse = Partial<Record<IslandShortName, number>>;
