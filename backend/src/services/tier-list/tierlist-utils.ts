export function createTierlistIndex(pokemon: string[]): Map<string, number> {
  const indexMap = new Map<string, number>();
  const uniquePokemon = new Set<string>();

  pokemon.forEach((entry) => {
    uniquePokemon.add(entry);
  });

  let newIndex = 0;
  pokemon.forEach((entry) => {
    if (uniquePokemon.has(entry)) {
      indexMap.set(entry, newIndex++);
      uniquePokemon.delete(entry);
    }
  });

  return indexMap;
}
