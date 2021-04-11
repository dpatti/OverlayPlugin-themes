import { Struct, Span, fset } from "./util";

export interface Activity {
  readonly castStart: Date | null;
  readonly lastCredit: Date;
  readonly uptime: Span;
  readonly revives: number;
}

export class LogData {
  readonly encounterStart: Date;
  readonly lastServerTime: Date;
  readonly activity: {
    readonly [name: string]: Activity;
  };

  static startNew({ encounterStart }: { encounterStart: Date }) {
    return new this({
      encounterStart,
      lastServerTime: encounterStart,
      activity: {},
    });
  }

  constructor({ encounterStart, lastServerTime, activity }: Struct<LogData>) {
    this.encounterStart = encounterStart;
    this.lastServerTime = lastServerTime;
    this.activity = activity;
  }

  encounterDuration() {
    return Date.diff(this.lastServerTime, this.encounterStart);
  }

  uptimeFor(name: string) {
    return this.activity[name]?.uptime ?? 0;
  }

  updateTime(serverTime: Date) {
    return new LogData(fset(this, { lastServerTime: serverTime }));
  }

  updateActivity(sourceName: string, f: (_: Activity) => Activity) {
    const record = this.activity[sourceName] ?? {
      castStart: null,
      lastCredit: new Date(0),
      uptime: 0,
      revives: 0,
    };

    return new LogData(
      fset(this, {
        activity: fset(this.activity, { [sourceName]: f(record) }),
      })
    );
  }
}
