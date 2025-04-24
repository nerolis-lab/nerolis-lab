import { MathUtils, type Time } from 'sleepapi-common'

class TimeUtilsImpl {
  constructor() {
    this.formatTime = this.formatTime.bind(this)
    this.prettifyTime = this.prettifyTime.bind(this)
    this.prettifySeconds = this.prettifySeconds.bind(this)
    this.calculateDurationInMinutes = this.calculateDurationInMinutes.bind(this)
    this.sleepScore = this.sleepScore.bind(this)
    this.calculateSleepDuration = this.calculateSleepDuration.bind(this)
  }

  public formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    const hoursString = String(hours).padStart(2, '0')
    const minutesString = String(minutes).padStart(2, '0')
    const secondsString = String(remainingSeconds).padStart(2, '0')

    return `${hoursString}:${minutesString}:${secondsString}`
  }

  // TODO: exists in backend, should move to common
  public prettifyTime(time: Time) {
    const hourString = String(time.hour).padStart(2, '0')
    const minuteString = String(time.minute).padStart(2, '0')
    const secondString = String(MathUtils.round(time.second, 0)).padStart(2, '0')

    return `${hourString}:${minuteString}:${secondString}`
  }

  public prettifySeconds(frequency: number) {
    const hours = Math.floor(frequency / 3600)
      .toString()
      .padStart(2, '0')
    const minutes = Math.floor((frequency % 3600) / 60)
      .toString()
      .padStart(2, '0')
    const seconds = Math.round(frequency % 60)
      .toString()
      .padStart(2, '0')
    return `${hours !== '00' ? `${hours}h ` : ''}${minutes}m ${seconds}s`
  }

  public extractDate(isoString: string): string {
    const date = new Date(isoString)
    const userLocale = navigator.language || 'en-US'
    return new Intl.DateTimeFormat(userLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  private calculateDurationInMinutes(params: { bedtime: string; wakeup: string }): number {
    const [bedHour, bedMinute] = params.bedtime.split(':').map(Number)
    const [wakeHour, wakeMinute] = params.wakeup.split(':').map(Number)

    const bedTimeMinutes = bedHour * 60 + bedMinute
    const wakeTimeMinutes = wakeHour * 60 + wakeMinute

    // Calculate duration, handling the case where we cross midnight
    let durationInMinutes = wakeTimeMinutes - bedTimeMinutes
    if (durationInMinutes < 0) {
      durationInMinutes += 1440 // Add 24 hours worth of minutes
    }

    return durationInMinutes
  }

  public sleepScore(params: { bedtime: string; wakeup: string }) {
    const durationInMinutes = this.calculateDurationInMinutes(params)
    const maxDurationInMinutes = 510 // 8.5 hours in minutes
    return Math.min(100, Math.round((durationInMinutes / maxDurationInMinutes) * 100))
  }

  public calculateSleepDuration(params: { bedtime: string; wakeup: string }): string {
    const durationInMinutes = this.calculateDurationInMinutes(params)
    const hours = Math.floor(durationInMinutes / 60)
    const minutes = durationInMinutes % 60

    if (hours === 0) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
    }
    if (minutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
    }
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} and ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
  }
}

export const TimeUtils = new TimeUtilsImpl()
