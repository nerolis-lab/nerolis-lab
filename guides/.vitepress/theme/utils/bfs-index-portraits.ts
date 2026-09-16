// Bundle portraits with the wiki so standalone development and production use the same assets.
const portraits = import.meta.glob<string>(
  [
    '../../../../frontend/public/images/avatar/portrait/*.png',
    '!../../../../frontend/public/images/avatar/portrait/*_shiny.png'
  ],
  { eager: true, query: '?url', import: 'default' }
);

export function bfsPokemonPortrait(name: string): string | undefined {
  return portraits[`../../../../frontend/public/images/avatar/portrait/${name.toLowerCase()}.png`];
}
