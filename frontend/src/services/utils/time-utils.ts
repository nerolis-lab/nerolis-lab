import { MathUtils, type Time } from 'sleepapi-common'

class TimeUtilsImpl {
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

  public sleepScore(params: { bedtime: string; wakeup: string }) {
    const [bedHour, bedMinute] = params.bedtime.split(':').map(Number)
    const [wakeHour, wakeMinute] = params.wakeup.split(':').map(Number)

    const bedTime = new Date()
    bedTime.setHours(bedHour, bedMinute, 0, 0)

    const wakeTime = new Date()
    wakeTime.setHours(wakeHour, wakeMinute, 0, 0)

    if (wakeTime <= bedTime) {
      wakeTime.setDate(wakeTime.getDate() + 1)
    }

    const durationInMinutes = (wakeTime.getTime() - bedTime.getTime()) / (1000 * 60) // Duration in minutes
    const maxDurationInMinutes = 8.5 * 60 // 8.5 hours in minutes

    const score = Math.floor(Math.min(100, (durationInMinutes / maxDurationInMinutes) * 100))
    return score
  }
}

export const TimeUtils = new TimeUtilsImpl()
