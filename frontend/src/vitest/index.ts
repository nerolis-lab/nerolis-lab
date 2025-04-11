export * from './setup'

import { commonMocks } from 'sleepapi-common'
import * as frontendMocks from './mocks/index.js'

export const mocks = {
  ...commonMocks,
  ...frontendMocks
}
