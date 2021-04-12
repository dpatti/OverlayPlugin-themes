import _ from "lodash";
import { Option, SerializedUnstable, Span, fset } from "./util";

export interface Activity {
  readonly castStart: Option<Date>;
  readonly lastCredit: Date;
  readonly uptime: Span;
  readonly revives: number;
}

export interface LogData {
  readonly encounterStart: Date;
  readonly lastServerTime: Date;
  readonly activity: {
    readonly [name: string]: Activity;
  };
}

export const LogData = {
  startNew({ encounterStart }: { encounterStart: Date }): LogData {
    return {
      encounterStart,
      lastServerTime: encounterStart,
      activity: {},
    };
  },

  load(raw: SerializedUnstable<LogData>): LogData {
    return {
      encounterStart: new Date(raw.encounterStart ?? 0),
      lastServerTime: new Date(raw.lastServerTime ?? 0),
      activity: _.mapValues(raw.activity, (activity) => ({
        castStart:
          activity?.castStart != null ? new Date(activity.castStart) : null,
        lastCredit: new Date(activity?.lastCredit ?? 0),
        uptime: activity?.uptime ?? 0,
        revives: activity?.revives ?? 0,
      })),
    };
  },

  encounterDuration(t: LogData) {
    return Date.diff(t.lastServerTime, t.encounterStart);
  },

  updateTime(t: LogData, serverTime: Date): LogData {
    return fset(t, { lastServerTime: serverTime });
  },

  updateActivity(
    t: LogData,
    sourceName: string,
    f: (_: Activity) => Activity
  ): LogData {
    const record = t.activity[sourceName] ?? {
      castStart: null,
      lastCredit: new Date(0),
      uptime: 0,
      revives: 0,
    };

    return fset(t, {
      activity: fset(t.activity, { [sourceName]: f(record) }),
    });
  },
};
