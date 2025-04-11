import { type Store } from 'pinia'

export type StoreMap = {
  [storeId: string]: Store
}

export interface Migration {
  version: number
  description: string
  up: (stores: StoreMap) => Promise<void> | void
  down?: (stores: StoreMap) => Promise<void> | void
}
