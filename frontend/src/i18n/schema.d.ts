import type { MessageSchema } from '@/i18n'

// makes every useI18n() call site (and $t in templates) type-check t() keys
// against MessageSchema without passing generics at each call
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
}

export {}
