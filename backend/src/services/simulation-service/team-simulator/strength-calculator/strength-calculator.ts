import type { BerrySet, Island, MemberProduction, MemberStrength, TeamSettingsExt } from 'sleepapi-common';
import { berryPowerForLevel } from 'sleepapi-common';

export class StrengthCalculator {
  public calculateStrength(params: {
    settings: TeamSettingsExt;
    produceWithoutSkill: MemberProduction['produceWithoutSkill'];
    produceFromSkill: MemberProduction['produceFromSkill'];
    skillValue: MemberProduction['skillValue'];
    areaBonus?: number;
  }): MemberStrength {
    const { settings, produceWithoutSkill, produceFromSkill, skillValue } = params;
    const appliedAreaBonus = params.areaBonus ?? settings.island.areaBonus ?? 0;

    const berryStrength = this.calculateBerryStrength({
      berries: produceWithoutSkill.berries,
      island: settings.island,
      areaBonus: appliedAreaBonus
    });

    const skillStrength = this.calculateSkillStrength({
      produceFromSkill,
      skillValue,
      island: settings.island,
      areaBonus: appliedAreaBonus
    });

    return {
      berries: berryStrength,
      skill: skillStrength
    };
  }

  private calculateBerryStrength(params: {
    berries: BerrySet[];
    island: Island;
    areaBonus: number;
  }): MemberStrength['berries'] {
    const { berries, island, areaBonus } = params;

    let totalBase = 0;
    let totalFavored = 0;
    let totalIslandBonus = 0;

    for (const producedBerry of berries) {
      const isFavored = island.berries.some((b) => b.name === producedBerry.berry.name);
      const favoredMultiplier = isFavored ? 2 : 1;
      const power = berryPowerForLevel(producedBerry.berry, producedBerry.level);

      const baseStrength = producedBerry.amount * power;
      const favoredStrength = baseStrength * (favoredMultiplier - 1);
      const islandBonusStrength = (baseStrength + favoredStrength) * (areaBonus / 100);

      totalBase += baseStrength;
      totalFavored += favoredStrength;
      totalIslandBonus += islandBonusStrength;
    }

    return {
      total: Math.floor(totalBase + totalFavored + totalIslandBonus),
      breakdown: {
        base: Math.floor(totalBase),
        favored: Math.floor(totalFavored),
        islandBonus: Math.floor(totalIslandBonus)
      }
    };
  }

  private calculateSkillStrength(params: {
    produceFromSkill: MemberProduction['produceFromSkill'];
    skillValue: MemberProduction['skillValue'];
    island: Island;
    areaBonus: number;
  }): MemberStrength['skill'] {
    const { produceFromSkill, skillValue, island, areaBonus } = params;

    // 1. Strength from berries produced by skills
    const skillBerryStrength = this.calculateBerryStrength({
      berries: produceFromSkill.berries,
      island,
      areaBonus
    });

    // 2. Strength from 'strength' unit skills
    const strengthSkillValue = skillValue['strength'] ?? { amountToSelf: 0, amountToTeam: 0 };
    const skillAmount = strengthSkillValue.amountToSelf + strengthSkillValue.amountToTeam;

    const skillBase = skillAmount;
    const skillIslandBonus = skillAmount * (areaBonus / 100);

    // Combine
    const totalBase = skillBerryStrength.breakdown.base + skillBerryStrength.breakdown.favored + skillBase;
    const totalIslandBonus = skillBerryStrength.breakdown.islandBonus + skillIslandBonus;

    return {
      total: Math.floor(totalBase + totalIslandBonus),
      breakdown: {
        base: Math.floor(totalBase),
        islandBonus: Math.floor(totalIslandBonus)
      }
    };
  }
}
