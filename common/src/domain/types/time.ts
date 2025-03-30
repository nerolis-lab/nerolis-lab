export interface Time {
  hour: number;
  minute: number;
  second: number;
}

export interface TimePeriod {
  start: Time;
  end: Time;
}

export interface MealTimes {
  breakfast?: Time;
  lunch?: Time;
  dinner?: Time;
}
