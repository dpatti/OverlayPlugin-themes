import _ from "lodash";
import { Option, Serialized, Struct, Span, fset } from "./util";

export interface Activity {
  readonly castStart: Option<Date>;
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

  static load(raw: Serialized<Struct<LogData>>): LogData {
    return new this({
      encounterStart: new Date(raw.encounterStart ?? 0),
      lastServerTime: new Date(raw.lastServerTime ?? 0),
      activity: _.mapValues(raw.activity, (activity) => ({
        castStart:
          activity?.castStart != null ? new Date(activity.castStart) : null,
        lastCredit: new Date(activity?.lastCredit ?? 0),
        uptime: activity?.uptime ?? 0,
        revives: activity?.revives ?? 0,
      })),
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
