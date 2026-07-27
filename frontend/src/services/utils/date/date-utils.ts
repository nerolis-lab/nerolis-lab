import { i18n } from '@/i18n'

class DateUtilsImpl {
  public formatDate(dateString: string): string {
    return i18n.global.d(new Date(dateString), 'short')
  }
}

export const DateUtils = new DateUtilsImpl()
