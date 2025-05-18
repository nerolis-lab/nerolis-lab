export interface UpsertRecipeLevelRequest {
  recipe: string;
  level: number;
}
export interface GetRecipeLevelsResponse {
  [recipe: string]: number;
}
