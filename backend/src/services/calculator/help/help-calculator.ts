/**
 * Copyright 2025 Neroli's Lab Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { energyFactorFromEnergy } from '@src/services/calculator/energy/energy-calculator.js';
import type { Pokemon, nature } from 'sleepapi-common';
import {
  MathUtils,
  calculateHelpSpeedSubskills,
  calculateRibbonFrequency,
  invertNatureFrequency
} from 'sleepapi-common';

export function calculateHelpSpeedBeforeEnergy(stats: {
  pokemon: Pokemon;
  level: number;
  nature: nature.Nature;
  subskills: Set<string>;
  teamHelpingBonus: number;
  ribbonLevel: number;
  camp: boolean;
}): number {
  const { pokemon, level, nature, subskills, teamHelpingBonus, ribbonLevel, camp } = stats;

  const helpSpeedSubskills = calculateHelpSpeedSubskills({ subskills, nrOfTeamHelpingBonus: teamHelpingBonus });
  const levelFactor = 1 - 0.002 * (level - 1);
  const natureFreq = invertNatureFrequency(nature);
  const ribbonFrequency = calculateRibbonFrequency(pokemon, ribbonLevel);
  const campBonus = camp ? 1.2 : 1;

  return Math.floor(
    (MathUtils.round(natureFreq * helpSpeedSubskills * levelFactor * ribbonFrequency, 4) * pokemon.frequency) /
      campBonus
  );
}

export function calculateFrequencyWithEnergy(helpSpeedInSeconds: number, energy: number) {
  return helpSpeedInSeconds * energyFactorFromEnergy(energy);
}
