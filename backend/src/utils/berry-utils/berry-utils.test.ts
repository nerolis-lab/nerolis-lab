import { getBerriesForFilter, getBerriesForIsland } from '@src/utils/berry-utils/berry-utils.js';
import { AMBER, berry, CYAN, LAPIS, POWER_PLANT, SNOWDROP, TAUPE } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('getBerriesForFilter', () => {
  it('shall default to all berries', () => {
    const islands = {
      cyan: false,
      taupe: false,
      snowdrop: false,
      lapis: false,
      powerplant: false,
      amber: false
    };
    expect(getBerriesForFilter(islands)).toEqual(berry.BERRIES);
  });

  it('shall return cyan berries for cyan filter', () => {
    const islands = {
      cyan: true,
      taupe: false,
      snowdrop: false,
      lapis: false,
      powerplant: false,
      amber: false
    };
    expect(getBerriesForFilter(islands)).toEqual(CYAN.berries);
  });

  it('shall return taupe berries for taupe filter', () => {
    const islands = {
      cyan: false,
      taupe: true,
      snowdrop: false,
      lapis: false,
      powerplant: false,
      amber: false
    };
    expect(getBerriesForFilter(islands)).toEqual(TAUPE.berries);
  });

  it('shall return snowdrop berries for snowdrop filter', () => {
    const islands = {
      cyan: false,
      taupe: false,
      snowdrop: true,
      lapis: false,
      powerplant: false,
      amber: false
    };
    expect(getBerriesForFilter(islands)).toEqual(SNOWDROP.berries);
  });

  it('shall return lapis berries for lapis filter', () => {
    const islands = {
      cyan: false,
      taupe: false,
      snowdrop: false,
      lapis: true,
      powerplant: false,
      amber: false
    };
    expect(getBerriesForFilter(islands)).toEqual(LAPIS.berries);
  });

  it('shall return power plant berries for powerplant filter', () => {
    const islands = {
      cyan: false,
      taupe: false,
      snowdrop: false,
      lapis: false,
      powerplant: true,
      amber: false
    };
    expect(getBerriesForFilter(islands)).toEqual(POWER_PLANT.berries);
  });

  it('shall return both cyan and taupe berries if both filters are passed', () => {
    const islands = {
      cyan: true,
      taupe: true,
      snowdrop: false,
      lapis: false,
      powerplant: false,
      amber: false
    };
    expect(getBerriesForFilter(islands)).toEqual([...CYAN.berries, ...TAUPE.berries]);
  });

  it('shall return amber berries for amber filter', () => {
    const islands = {
      cyan: false,
      taupe: false,
      snowdrop: false,
      lapis: false,
      powerplant: false,
      amber: true
    };
    expect(getBerriesForFilter(islands)).toEqual(AMBER.berries);
  });
});

describe('getBerriesForIsland', () => {
  it('shall default to all berries', () => {
    expect(getBerriesForIsland()).toEqual(berry.BERRIES);
  });

  it('shall return cyan berries for cyan filter', () => {
    expect(getBerriesForIsland(CYAN)).toEqual(CYAN.berries);
  });

  it('shall return taupe berries for taupe filter', () => {
    expect(getBerriesForIsland(TAUPE)).toEqual(TAUPE.berries);
  });

  it('shall return snowdrop berries for snowdrop filter', () => {
    expect(getBerriesForIsland(SNOWDROP)).toEqual(SNOWDROP.berries);
  });

  it('shall return lapis berries for lapis filter', () => {
    expect(getBerriesForIsland(LAPIS)).toEqual(LAPIS.berries);
  });

  it('shall return power plant berries for power plant filter', () => {
    expect(getBerriesForIsland(POWER_PLANT)).toEqual(POWER_PLANT.berries);
  });

  it('shall return amber berries for amber filter', () => {
    expect(getBerriesForIsland(AMBER)).toEqual(AMBER.berries);
  });
});
