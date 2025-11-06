import { AMBER, CYAN, GREENGRASS, LAPIS, POWER_PLANT, SNOWDROP, TAUPE } from '.';
import {
  BELUE,
  BLUK,
  CHERI,
  CHESTO,
  DURIN,
  FIGY,
  GREPA,
  LEPPA,
  LUM,
  MAGO,
  ORAN,
  PAMTRE,
  PECHA,
  PERSIM,
  RAWST,
  SITRUS,
  WIKI,
  YACHE
} from '../../berry/berries';
import { ISLANDS } from './islands';

describe('ISLANDS', () => {
  it('CYAN island shall have the correct properties', () => {
    expect(CYAN.name).toBe('Cyan Beach');
    expect(CYAN.berries).toEqual([ORAN, PAMTRE, PECHA]);
  });

  it('TAUPE island shall have the correct properties', () => {
    expect(TAUPE.name).toBe('Taupe Hollow');
    expect(TAUPE.berries).toEqual([FIGY, LEPPA, SITRUS]);
  });

  it('SNOWDROP island shall have the correct properties', () => {
    expect(SNOWDROP.name).toBe('Snowdrop Tundra');
    expect(SNOWDROP.berries).toEqual([PERSIM, RAWST, WIKI]);
  });

  it('LAPIS island shall have the correct properties', () => {
    expect(LAPIS.name).toBe('Lapis Lakeside');
    expect(LAPIS.berries).toEqual([CHERI, DURIN, MAGO]);
  });

  it('POWER_PLANT island shall have the correct properties', () => {
    expect(POWER_PLANT.name).toBe('Old Gold Power Plant');
    expect(POWER_PLANT.berries).toEqual([BELUE, BLUK, GREPA]);
  });

  it('AMBER island shall have the correct properties', () => {
    expect(AMBER.name).toBe('Amber Canyon');
    expect(AMBER.berries).toEqual([CHESTO, LUM, YACHE]);
  });

  it('ISLANDS array shall contain all islands', () => {
    expect(ISLANDS).toHaveLength(7);
    expect(ISLANDS).toContain(GREENGRASS);
    expect(ISLANDS).toContain(CYAN);
    expect(ISLANDS).toContain(TAUPE);
    expect(ISLANDS).toContain(SNOWDROP);
    expect(ISLANDS).toContain(LAPIS);
    expect(ISLANDS).toContain(POWER_PLANT);
    expect(ISLANDS).toContain(AMBER);
  });
});
