import { describe, expect, it } from 'vitest';
import { DreamShardMagnetS } from './dream-shard-magnet-s';

describe('DreamShardMagnetS', () => {
  it('should have correct basic properties', () => {
    expect(DreamShardMagnetS.name).toBe('Dream Shard Magnet S');
    expect(DreamShardMagnetS.description(1)).toBe('Obtain 240 Dream Shards.');
    expect(DreamShardMagnetS.RP).toEqual([880, 1251, 1726, 2383, 3290, 4546, 5843, 7303]);
    expect(DreamShardMagnetS.maxLevel).toBe(8);
  });

  it('should have dream shards activation', () => {
    expect(DreamShardMagnetS.activations).toHaveProperty('dreamShards');
    expect(DreamShardMagnetS.activations.dreamShards.unit).toBe('dream shards');
    expect(typeof DreamShardMagnetS.activations.dreamShards.amount).toBe('function');
  });

  it('should calculate correct activation amounts', () => {
    const level1Amount = DreamShardMagnetS.activations.dreamShards.amount(1);
    const level6Amount = DreamShardMagnetS.activations.dreamShards.amount(6);

    expect(level1Amount).toBe(240);
    expect(level6Amount).toBe(1260);
  });

  it('should have dream shards unit only', () => {
    expect(DreamShardMagnetS.hasUnit('dream shards')).toBe(true);
    expect(DreamShardMagnetS.hasUnit('energy')).toBe(false);
    expect(DreamShardMagnetS.hasUnit('berries')).toBe(false);
  });

  it('should have specific RP values', () => {
    expect(DreamShardMagnetS.getRPValue(1)).toBe(880);
    expect(DreamShardMagnetS.getRPValue(3)).toBe(1726);
    expect(DreamShardMagnetS.getRPValue(6)).toBe(4546);
  });
});
