import _ from "lodash";
import React from "react";
import * as ACT from "./act";
import { Struct, Percent, Span, addEventListener, parseQuery } from "./util";

const GCD = 2500;

const LIMIT_BREAK = "Limit Break";
const YOU = "YOU";

interface Encounter {
  title: string;
  duration: Span;
  isActive: boolean;
  stats: {
    damage: {
      total: number;
      perSecond: number;
    };
    healing: {
      total: number;
      perSecond: number;
    };
    deaths: number;
  };

  combatants: Array<Combatant>;
  // XXX: Does logData belong here? It does not round-trip serialization at all.
  logData: LogData | null;
  raw: ACT.DataUpdate;
}

interface Combatant {
  name: string;
  job: string;
  isSelf: boolean;
  stats: {
    damage: {
      total: number;
      perSecond: number;
      relative: Percent;
      max: string;
      crit: Percent;
      directHit: Percent;
      critDirectHit: Percent;
    };
    healing: {
      total: number;
      perSecond: number;
      relative: Percent;
      max: string;
      overheal: Percent;
      crit: Percent;
    };
    tanking: {
      total: number;
      parry: Percent;
      block: Percent;
    };
    uptime: {
      total: Span;
      relative: Percent;
    };
    deaths: number;
  };
}

enum View {
  Damage = "Damage",
  Healing = "Healing",
  Tanking = "Tanking",
  Uptime = "Uptime",
  Deaths = "Deaths",
}

const options = parseQuery((options) => ({
  you: options.you?.replace(/_/g, " ") || YOU,
  debug: "debug" in options || false,
}));

// helper to functionally set a key in an object by returning a new copy
const fset = <A, B>(obj: A, extensions: B): A & B =>
  _.defaults(extensions, obj);

// When duration is 0, ACT sends the dps as the string "∞"
const parseRate = (s: string): number => {
  const n = parseFloat(s);
  if (Number.isNaN(n)) {
    return 0;
  } else {
    return n;
  }
};

const parsePercent = (s: string): number => {
  if (/^[0-9.]+%$/.test(s)) {
    return parseFloat(s.slice(0, -1)) / 100;
  } else {
    return parseFloat(s);
  }
};

const formatName = (name: string) => {
  if (name == YOU) {
    return options.you;
  } else {
    return name;
  }
};

const formatEncounter = (enc: Encounter) =>
  `${enc.title} (${formatSpan(enc.duration)})`;

const formatNumber = (n: number) => {
  if (n >= 1000000) {
    return (n / 1000000).toFixed(2) + "M";
  } else if (n >= 1000) {
    return (n / 1000).toFixed(2) + "K";
  }

  return n.toFixed(2);
};

const formatPercent = (n: number) => `${(n * 100).toFixed(0)}%`;

const formatSpan = (ms: number) => {
  const seconds = ms / 1000;
  const min = Math.floor(seconds / 60);
  const sec = (Math.abs(seconds) % 60).toFixed(0);
  return `${min}:${("0" + sec).slice(-2)}`;
};

interface CombatantCompactProps {
  total: number;
  max: number;
  actor: string;
  isSelf: boolean;
  format: (_: number) => string;
  note?: string;
  extra: Array<string>;
  rank: number;
  characterName: string;
  job: string;
}

class CombatantCompact extends React.PureComponent<CombatantCompactProps> {
  render() {
    const percent = this.props.total / this.props.max;
    const width = Math.min(100, percent * 100) + "%";

    return (
      <li
        className={`row ${this.props.actor} ${this.props.isSelf ? "self" : ""}`}
      >
        <div className="bar" style={{ width: width }} />
        <div className="text-overlay">
          <div className="stats">
            <span className="total">{this.props.format(this.props.total)}</span>
            {this.props.note ? (
              <span className="note">[{this.props.note}]</span>
            ) : null}
            {this.props.extra.length > 0
              ? `(${this.props.extra.join(", ")})`
              : null}
          </div>
          <div className="info">
            <span className="icon job-icon"></span>
            <span className="rank">{this.props.rank}.</span>
            <span className="character-name">
              {formatName(this.props.characterName)}
            </span>
            <span className="character-job">{this.props.job}</span>
          </div>
        </div>
      </li>
    );
  }
}

interface StatsProps {
  self: Combatant;
}

class Stats extends React.Component<StatsProps, {}> {
  render() {
    const { self } = this.props;

    const Stat: React.FunctionComponent<{
      label: string;
      value: string;
    }> = (props) =>
      props.value ? (
        <div className="cell">
          <span className="label ff-header">{props.label}</span>
          <span className="value ff-text">{props.value}</span>
        </div>
      ) : null;

    return (
      <div className="extra-details">
        <div className="extra-row damage">
          <Stat
            label="Damage"
            value={`${formatNumber(self.stats.damage.total)} (${formatNumber(
              self.stats.damage.perSecond
            )})`}
          />
          <Stat label="Max" value={self.stats.damage.max} />
          <Stat label="Crit%" value={formatPercent(self.stats.damage.crit)} />
          <Stat
            label="Direct%"
            value={formatPercent(self.stats.damage.directHit)}
          />
          <Stat
            label="DirectCrit%"
            value={formatPercent(self.stats.damage.critDirectHit)}
          />
        </div>
        <hr />
        <div className="extra-row healing">
          <Stat
            label="Heals"
            value={`${formatNumber(self.stats.healing.total)} (${formatNumber(
              self.stats.healing.perSecond
            )})`}
          />
          <Stat label="Max" value={self.stats.healing.max} />
          <Stat label="Crit%" value={formatPercent(self.stats.healing.crit)} />
        </div>
      </div>
    );
  }
}

interface HeaderProps {
  encounter: Encounter;
  onSelectEncounter: (index: number | null) => void;
  currentView: View;
  history: Array<Encounter>;
  onViewChange: () => void;
}

interface HeaderState {
  expanded: boolean;
  showEncountersList: boolean;
}

class Header extends React.Component<HeaderProps, HeaderState> {
  constructor(props: HeaderProps) {
    super(props);
    this.state = {
      expanded: false,
      showEncountersList: false,
    };
  }

  toggleStats(value = !this.state.expanded) {
    this.setState({
      expanded: value,
    });
  }

  // Show dropdown for list of encounters
  toggleEncounterMenu(value = !this.state.showEncountersList) {
    this.setState({
      showEncountersList: value,
    });
  }

  onSelectEncounter(index: number | null) {
    this.toggleEncounterMenu(false);
    this.props.onSelectEncounter(index);
  }

  render() {
    const encounter = this.props.encounter;

    const currentViewSummary = {
      [View.Damage]: `Damage (${formatNumber(
        encounter.stats.damage.perSecond
      )} dps)`,
      [View.Healing]: `Healing (${formatNumber(
        encounter.stats.healing.perSecond
      )} hps)`,
      [View.Tanking]: `Damage Taken`,
      [View.Uptime]: `Uptime`,
      [View.Deaths]: `Deaths (${encounter.stats.deaths} total)`,
    }[this.props.currentView];

    const self = _.find(encounter.combatants, ({ isSelf }) => isSelf) ?? null;

    return (
      <div
        className={`header view-color ${this.props.currentView.toLowerCase()}`}
      >
        <div className="encounter-header">
          <div className="encounter-data ff-header">
            <span
              className="target-name dropdown-parent"
              onClick={() => this.toggleEncounterMenu()}
            >
              {formatEncounter(encounter)}
            </span>
            <div
              className={`dropdown-menu encounters-list-dropdown ${
                this.state.showEncountersList ? "" : "hidden"
              }`}
            >
              <div
                className="dropdown-menu-item target-name"
                onClick={() => this.onSelectEncounter(null)}
              >
                Current Fight
              </div>
              {this.props.history.map((encounter, i) => (
                <div
                  key={i}
                  className="dropdown-menu-item target-name"
                  onClick={() => this.onSelectEncounter(i)}
                >
                  {formatEncounter(encounter)}
                </div>
              ))}
            </div>
            {self !== null ? (
              <span
                className={`arrow ${this.state.expanded ? "up" : "down"}`}
                onClick={() => this.toggleStats()}
              />
            ) : null}
          </div>
          <div
            className={`ff-header header-right target-name`}
            onClick={this.props.onViewChange}
          >
            {currentViewSummary}
          </div>
        </div>
        {this.state.expanded && self !== null ? <Stats self={self} /> : null}
      </div>
    );
  }
}

interface CombatantsProps {
  combatants: Array<Combatant>;
  currentView: View;
}

class Combatants extends React.Component<CombatantsProps> {
  shouldComponentUpdate(nextProps: CombatantsProps) {
    // if data is empty then don't re-render
    if (Object.getOwnPropertyNames(nextProps.combatants).length === 0) {
      return false;
    }

    return true;
  }

  render() {
    const maxRows = 12;
    let max: number;

    const rows = _.take(this.props.combatants, maxRows).map(
      (combatant, rank) => {
        const actor = combatant.name === LIMIT_BREAK ? "lb" : combatant.job;

        const stats = _.merge(
          {
            actor,
            // XXX: is job nullable?
            job: combatant.job || "",
            characterName: combatant.name,
            isSelf: combatant.isSelf,
          },
          {
            [View.Damage]: {
              format: formatNumber,
              total: combatant.stats.damage.total,
              extra: [
                formatNumber(combatant.stats.damage.perSecond),
                formatPercent(combatant.stats.damage.relative),
              ],
            },
            [View.Healing]: {
              format: formatNumber,
              total: combatant.stats.healing.total,
              note: `${formatPercent(combatant.stats.healing.overheal)} OH`,
              extra: [
                formatNumber(combatant.stats.healing.perSecond),
                formatPercent(combatant.stats.healing.relative),
              ],
            },
            [View.Tanking]: {
              format: formatNumber,
              total: combatant.stats.tanking.total,
              extra: [
                `${formatPercent(combatant.stats.tanking.parry)} parry`,
                `${formatPercent(combatant.stats.tanking.block)} block`,
              ],
            },
            [View.Uptime]: {
              format: formatSpan,
              total: combatant.stats.uptime.total,
              extra: [formatPercent(combatant.stats.uptime.relative)],
            },
            [View.Deaths]: {
              format: _.identity,
              total: combatant.stats.deaths,
              extra: [],
            },
          }[this.props.currentView]
        );

        max = max || stats.total;

        return (
          <CombatantCompact
            rank={rank + 1}
            key={combatant.name}
            max={max}
            {...stats}
          />
        );
      }
    );

    return <ul className="combatants">{rows}</ul>;
  }
}

interface DamageMeterProps {
  data: Encounter;
  playerName: string | null;
  history: Array<Encounter>;
  onSelectEncounter: (index: number | null) => void;
}

interface DamageMeterState {
  currentView: View;
}

class DamageMeter extends React.Component<DamageMeterProps, DamageMeterState> {
  constructor(props: DamageMeterProps) {
    super(props);
    this.state = {
      currentView: View.Damage,
    };
  }

  handleViewChange() {
    const views = Object.values(View);
    const index = views.indexOf(this.state.currentView);

    this.setState({
      currentView: views[(index + 1) % views.length],
    });
  }

  render() {
    const encounter = this.props.data;

    const stat = {
      [View.Damage]: (c: Combatant["stats"]) => c.damage.total,
      [View.Healing]: (c: Combatant["stats"]) => c.healing.total,
      [View.Tanking]: (c: Combatant["stats"]) => c.tanking.total,
      [View.Uptime]: (c: Combatant["stats"]) => c.uptime.total,
      [View.Deaths]: (c: Combatant["stats"]) => c.deaths,
    }[this.state.currentView];

    const combatants = _.sortBy(
      _.filter(encounter.combatants, (d) => stat(d.stats) > 0),
      (d) => -stat(d.stats)
    );

    return (
      <div className="damage-meter">
        <Header
          encounter={encounter}
          history={this.props.history}
          onViewChange={() => this.handleViewChange()}
          onSelectEncounter={this.props.onSelectEncounter}
          currentView={this.state.currentView}
        />
        <Combatants
          currentView={this.state.currentView}
          combatants={combatants}
        />
        {!options.debug ? null : (
          <div>
            <Debugger data={encounter} />
          </div>
        )}
      </div>
    );
  }
}

interface DebuggerProps {
  data: Encounter;
}

class Debugger extends React.PureComponent<DebuggerProps> {
  constructor(props: DebuggerProps) {
    super(props);
  }

  render() {
    const css: React.CSSProperties = {
      overflowY: "scroll",
      maxHeight: "250px",
    };
    return <pre style={css}>{JSON.stringify(this.props.data, null, 2)}</pre>;
  }
}

interface LogDataActivity {
  readonly castStart: Date | null;
  readonly lastCredit: Date;
  readonly uptime: Span;
}

class LogData {
  readonly encounterStart: Date;
  readonly lastServerTime: Date;
  readonly activity: {
    readonly [name: string]: LogDataActivity;
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

  updateActivity(
    sourceName: string,
    f: (_: LogDataActivity) => LogDataActivity
  ) {
    const record = this.activity[sourceName] ?? {
      castStart: null,
      lastCredit: new Date(0),
      uptime: 0,
    };

    return new LogData(
      fset(this, {
        activity: fset(this.activity, { [sourceName]: f(record) }),
      })
    );
  }
}

interface AppProps {}

interface AppState {
  playerName: string | null;
  currentEncounter: Encounter | null;
  history: Array<Encounter>;
  selectedEncounter: Encounter | null;
  rollingLogData: LogData | null;
  serverTime: Date;
  lastLogLine: number | null;
}

class App extends React.Component<AppProps, AppState> {
  static readonly HISTORY_KEY = "meters";
  static readonly PLAYER_NAME_KEY = "playerName";

  constructor(props: AppProps) {
    super(props);
    this.state = {
      playerName: null,
      currentEncounter: null,
      history: [],
      selectedEncounter: null,
      rollingLogData: null,
      serverTime: new Date(0),
      lastLogLine: null,
    };
  }

  componentDidMount() {
    addEventListener<ACT.LogLine>("onLogLine", (e) => this.onLogLine(e));
    addEventListener<ACT.DataUpdate>("onOverlayDataUpdate", (e) =>
      this.onOverlayDataUpdate(e)
    );
    addEventListener<ACT.StateUpdate>("onOverlayStateUpdate", (e) =>
      this.onOverlayStateUpdate(e)
    );

    const withLoad = (key: string, f: (_: string) => void) => {
      const value = localStorage.getItem(key);
      if (value) f(value);
    };

    withLoad(App.PLAYER_NAME_KEY, (playerName) => {
      this.setState({ playerName });
      // XXX: This is quite a hack, but `this.upgrade` depends on the
      // playerName, which we enqueue as a state update here, synchronously.
      Object.assign(this.state, { playerName });
    });

    withLoad(App.HISTORY_KEY, (payload) => {
      let history;

      try {
        history = JSON.parse(payload);
      } catch (ex) {
        console.error(`Couldn't load state: ${ex}`);
      }

      if (history) {
        history = _.map(history, (e) => this.upgrade(e));
        this.setState({ currentEncounter: history[0], history: history });
      }
    });
  }

  onOverlayStateUpdate(e: CustomEvent<ACT.StateUpdate>) {
    if (!e.detail.isLocked) {
      document.documentElement.classList.add("resizable");
    } else {
      document.documentElement.classList.remove("resizable");
    }
  }

  onOverlayDataUpdate(e: CustomEvent<ACT.DataUpdate>) {
    const update = e.detail;
    // Encounters without combatants can be nearby pulls in public areas that
    // you aren't involved in. Drop those updates unless they include someone.
    if (_.isEmpty(update.Combatant)) return;

    let { history } = this.state;

    const isActive = (enc?: ACT.DataUpdate | null) => enc?.isActive === "true";
    const duration = (enc?: ACT.DataUpdate | null) => enc?.Encounter.DURATION;

    // Encounter started
    if (!isActive(this.state.currentEncounter?.raw) && isActive(update)) {
      // XXX: lastLogLine / serverTime as null
      if (this.state.lastLogLine !== null && this.state.serverTime !== null) {
        const updateLag = performance.now() - this.state.lastLogLine;
        // XXX: I didn't realize that this doesn't take place immediately
        this.setState({
          selectedEncounter: null,
          rollingLogData: LogData.startNew({
            encounterStart: this.state.serverTime.add(updateLag),
          }),
        });
      }
    }

    // Only use our latest log data if the encounter's timer advanced. It's
    // possible that testing `isActive` is the right way to do this instead. The
    // idea is that if we get data updates after the encounter is over, the last
    // log data we applied is the most semantically correct one.
    const logData =
      duration(this.state.currentEncounter?.raw) === duration(update) &&
      this.state.currentEncounter?.logData != null
        ? this.state.currentEncounter.logData
        : this.state.rollingLogData;

    const encounter = this.parse(update, logData);

    // Encounter ended
    if (isActive(this.state.currentEncounter?.raw) && !isActive(update)) {
      history = [encounter].concat(history).slice(0, 10);

      localStorage.setItem(App.HISTORY_KEY, JSON.stringify(history));
    }

    this.setState({ currentEncounter: encounter, history });
  }

  setPlayerName(playerName: string | null) {
    if (playerName && playerName !== this.state.playerName) {
      localStorage.setItem(App.PLAYER_NAME_KEY, playerName);
      this.setState({ playerName });
    }
  }

  onLogLine(e: CustomEvent<ACT.LogLine>) {
    const [code, timestamp, ...message] = JSON.parse(e.detail);
    // Sometimes the log lines go backwards in time, though I think this is
    // impossible within the codes we use.
    const serverTime = Date.max(this.state.serverTime, new Date(timestamp));
    const lastLogLine = performance.now();

    const applyUpdate = (
      sourceName?: string,
      f?: (_: LogDataActivity) => LogDataActivity
    ) => {
      this.setState({ serverTime, lastLogLine });

      if (this.state.rollingLogData !== null) {
        let rollingLogData = this.state.rollingLogData.updateTime(serverTime);
        if (sourceName !== undefined && f !== undefined) {
          rollingLogData = rollingLogData.updateActivity(sourceName, f);
        }
        this.setState({ rollingLogData });
      }
    };

    if (code === "02") {
      const [_playerID, playerName] = message;
      this.setPlayerName(playerName);
    } else if (code === "20") {
      // Start casting
      const [_sourceID, sourceName] = message;
      applyUpdate(sourceName, (data) => fset(data, { castStart: serverTime }));
    } else if (code === "23") {
      // Cancelled cast
      const [_sourceID, sourceName] = message;
      applyUpdate(sourceName, (data) => fset(data, { castStart: null }));
    } else if (code === "21" || code === "22") {
      // Action used
      const [_sourceID, sourceName] = message;
      applyUpdate(sourceName, ({ castStart, lastCredit, uptime }) => {
        // If you were casting, you get credit for the duration of that cast or
        // `GCD`, whichever is greater. If you weren't casting, you get `GCD`
        // worth of uptime credited to you. In both cases, we can't tell how much
        // your GCD is due to spell/skill speed.
        const [uptimeCredit, creditTime] =
          castStart !== null
            ? [Math.max(GCD, Date.diff(serverTime, castStart)), castStart]
            : [GCD, serverTime];

        // However, in either case, if `GCD` has not elapsed between the two
        // credit times, the next credit is reduced so as not to double-credit.
        // Example: if I use an action at time t then another at t+1s, I would get
        // 3.5s total uptime credit. Another example: if I cast two 2s spells back
        // to back, I will get 4.5s of credit. This is a best approximation with
        // the information we have available.
        const uptimeOvercredit = Math.max(
          0,
          GCD - Date.diff(creditTime, lastCredit)
        );

        return {
          castStart: null,
          lastCredit: creditTime,
          uptime: uptime + uptimeCredit - uptimeOvercredit,
        };
      });
    } else if (serverTime > this.state.serverTime) {
      applyUpdate();
    }
  }

  onSelectEncounter(index: number | null) {
    if (index && index >= 0) {
      this.setState({
        selectedEncounter: this.state.history[index],
      });
    } else {
      this.setState({
        selectedEncounter: null,
      });
    }
  }

  parse(data: ACT.DataUpdate, logData: LogData | null): Encounter {
    const { playerName } = this.state;

    // This is different from the encounter's notion of duration because ACT
    // may be configured to trim out periods of inactivity.
    const duration =
      logData?.encounterDuration() || parseInt(data.Encounter.DURATION);

    const combatants = _.map(data.Combatant, (combatant) => {
      const [name, isSelf] =
        playerName !== null &&
        (combatant.name === YOU || combatant.name === playerName)
          ? [playerName, true]
          : [combatant.name, false];

      const uptime = logData?.uptimeFor(name) || 0;

      return {
        name,
        job: combatant.Job.toLowerCase(),
        isSelf,
        stats: {
          damage: {
            total: parseInt(combatant.damage),
            perSecond: parseRate(combatant.encdps),
            relative: parsePercent(combatant["damage%"]),
            max: combatant.maxhit,
            crit: parsePercent(combatant["crithit%"]),
            directHit: parsePercent(combatant.DirectHitPct),
            critDirectHit: parsePercent(combatant.CritDirectHitPct),
          },
          healing: {
            total: parseInt(combatant.healed),
            perSecond: parseRate(combatant.enchps),
            relative: parsePercent(combatant["healed%"]),
            max: combatant.maxheal,
            overheal: parsePercent(combatant["OverHealPct"]),
            crit: parsePercent(combatant["critheal%"]),
          },
          tanking: {
            total: parseInt(combatant.damagetaken),
            parry: parsePercent(combatant.ParryPct),
            block: parsePercent(combatant.BlockPct),
          },
          uptime: {
            total: uptime,
            relative: Math.min(1, uptime / duration),
          },
          deaths: parseInt(combatant.deaths),
        },
      };
    });

    return {
      title: data.Encounter.title,
      duration,
      isActive: data.isActive === "true",
      stats: {
        damage: {
          total: parseInt(data.Encounter.damage),
          perSecond: parseRate(data.Encounter.encdps),
        },
        healing: {
          total: parseInt(data.Encounter.healed),
          perSecond: parseRate(data.Encounter.enchps),
        },
        deaths: parseInt(data.Encounter.deaths),
      },

      combatants,
      logData,
      raw: data,
    };
  }

  upgrade(data: object): Encounter {
    if ("Encounter" in data) {
      const update = data as any;

      const logData =
        update.logData != null
          ? new LogData({
              encounterStart: new Date(update.logData.encounterStart),
              lastServerTime: new Date(update.logData.lastServerTime),
              activity: _.mapValues(update.logData.activity, (activity) => ({
                castStart:
                  activity.castStart != null
                    ? new Date(activity.castStart)
                    : null,
                lastCredit: new Date(activity.castStart),
                uptime: activity.uptime,
              })),
            })
          : null;

      const encounter = this.parse(update, logData);

      return encounter;
    } else if ("stats" in data) {
      return data as Encounter;
    } else {
      throw Error("Can't upgrade history object");
    }
  }

  render() {
    return this.state.currentEncounter ? (
      <DamageMeter
        data={this.state.selectedEncounter ?? this.state.currentEncounter}
        history={this.state.history}
        onSelectEncounter={(index) => this.onSelectEncounter(index)}
        playerName={this.state.playerName}
      />
    ) : (
      <h3>Awaiting data.</h3>
    );
  }
}

export default App;
