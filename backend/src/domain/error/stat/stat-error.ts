import { SleepAPIError } from '@src/domain/error/sleepapi-error.js';

export class EnergyError extends SleepAPIError {}

export class LevelError extends SleepAPIError {}

export class NatureError extends SleepAPIError {}

export class SubskillError extends SleepAPIError {}

export class MainskillError extends SleepAPIError {}
