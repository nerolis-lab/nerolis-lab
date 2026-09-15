---
title: Raptor Berry Finding S Index
fullTitle: Raptor Berry Finding S Index
author: VelocityRaptor22, CowTools
---

<script setup>
import { ref } from 'vue'
import RaptorBfsIndex from '../../.vitepress/theme/components/TierLists/RaptorBfsIndex.vue'

const ingredientFinderM = ref(true)
</script>

How much each Pokémon benefits from Berry Finding S, based on [u/VelocityRaptor22’s original BFS index](https://www.reddit.com/r/PokemonSleep/comments/1m9nnh3/bfs_value_on_nonberry_mons_numerically_indexed/).

<RaptorBfsIndex v-model:ingredient-finder-m="ingredientFinderM" />

## How the index is calculated

Skill and “All” specialists: `(864 / f) × (1 − i) × b`

Ingredient specialists: <code>{{ ingredientFinderM ? '(864 / f) × (1 − 1.36 × i) × b' : '(864 / f) × (1 − i) × b' }}</code>

Ingredient specialists are assumed to have the Ingredient Finding M subskill by default, which causes them to find ingredients rather than berries 36% more often.

`864` is the number of seconds in a day (86,400) divided by 100 to keep index scores compact.\
`f` is base helping frequency in seconds.\
`i` is base ingredient rate as a fraction.\
`b` is base berry strength.

Formula and chart concept by [u/VelocityRaptor22](https://www.reddit.com/r/PokemonSleep/comments/1m9nnh3/bfs_value_on_nonberry_mons_numerically_indexed/).
