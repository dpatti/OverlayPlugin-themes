import _ from "lodash";
import React from "react";

const GCD = 2500;

const LIMIT_BREAK = "Limit Break";
const YOU = "YOU";

type Span = number;

type NonMethodKeys<T> = ({
  [P in keyof T]: T[P] extends Function ? never : P;
} & { [x: string]: never })[keyof T];
type Struct<T> = Pick<T, NonMethodKeys<T>>;

interface StateUpdate {
  isLocked: boolean;
}

interface DataUpdate {
  Encounter: Encounter;
  Combatant: { [name: string]: Combatant };
  isActive: "true" | "false";
}

interface DataUpdateEmbellished extends DataUpdate {
  Encounter: EncounterEmbellished;
  Combatant: { [name: string]: CombatantEmbellished };
  logData: LogData | null;
}

type LogLine = string;

interface Encounter {
  title: string;
  duration: string;
  DURATION: string;
  damage: string;
  encdps: string;
  healed: string;
  enchps: string;
  deaths: string;
  maxhit: string;
  maxheal: string;
}

interface EncounterEmbellished extends Encounter {
  durationTotal: number;
}

interface Combatant {
  name: string;
  Job: string;
  ["crithit%"]: string;
  DirectHitPct: string;
  CritDirectHitPct: string;
  ["critheal%"]: string;
  damage: string;
  encdps: string;
  ["damage%"]: string;
  healed: string;
  enchps: string;
  ["healed%"]: string;
  OverHealPct: string;
  damagetaken: string;
  ParryPct: string;
  BlockPct: string;
  deaths: string;
  maxhit: string;
  maxheal: string;
}

interface CombatantEmbellished extends Combatant {
  uptime: number;
  ["uptime%"]: number;
  isSelf: boolean;
}

enum View {
  Damage = "Damage",
  Healing = "Healing",
  Tanking = "Tanking",
  Uptime = "Uptime",
  Deaths = "Deaths",
}

const options = ((search) => {
  type dict = { [key: string]: string };

  let options: dict = {};

  if (search[0] === "?") {
    search
      .slice(1)
      .split("&")
      .map((pair) => pair.split("="))
      .forEach(([k, v]) => {
        options[k] = v;
      });
  }

  return {
    you: options.you?.replace(/_/g, " ") || YOU,
    debug: "debug" in options || false,
  };
})(document.location.search);

// helper to functionally set a key in an object by returning a new copy
const fset = <A, B>(obj: A, extensions: B): A & B =>
  _.defaults(extensions, obj);

const dateAdd = (a: Date, b: Span): Date => new Date(a.getTime() + b);
const dateDiff = (a: Date, b: Date): Span => a.getTime() - b.getTime();
const dateMax = (a: Date, b: Date): Date => (a > b ? new Date(a) : new Date(b));

// When duration is 0, ACT sends the dps as the string "∞"
const parseRate = (s: string): number => {
  let n = parseFloat(s);
  if (Number.isNaN(n)) {
    return 0;
  } else {
    return n;
  }
};

const formatName = (name: string) => {
  if (name == YOU) {
    return options.you;
  } else {
    return name;
  }
};

const formatEncounter = (enc: EncounterEmbellished) =>
  enc.durationTotal
    ? `${enc.title} (${formatSpan(enc.durationTotal)})`
    : `${enc.title} (${enc.duration})`;

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
  encounter: EncounterEmbellished;
  self: CombatantEmbellished;
}

interface StatsState {
  group: boolean;
}

class Stats extends React.Component<StatsProps, StatsState> {
  constructor(props: StatsProps) {
    super(props);
    this.state = {
      group: true,
    };
  }

  toggleSource(value = !this.state.group) {
    this.setState({
      group: value,
    });
  }

  render() {
    const self = this.props.self;
    const dataSource = this.state.group || !self ? this.props.encounter : self;

    const Stat: React.FunctionComponent<{
      label: string;
      value?: string;
      self?: boolean;
    }> = (props) =>
      props.value && (!props.self || !this.state.group) ? (
        <div className="cell">
          <span className="label ff-header">{props.label}</span>
          <span className="value ff-text">{props.value}</span>
        </div>
      ) : null;

    return (
      <div className="extra-details">
        <div
          className="data-set-view-switcher clearfix"
          onClick={() => this.toggleSource()}
        >
          <span
            className={`data-set-option ${this.state.group ? "active" : ""}`}
          >
            G
          </span>
          <span
            className={`data-set-option ${!this.state.group ? "active" : ""}`}
          >
            I
          </span>
        </div>
        <div className="extra-row damage">
          <Stat
            label="Damage"
            value={`${formatNumber(
              parseInt(dataSource.damage)
            )} (${formatNumber(parseRate(dataSource.encdps))})`}
          />
          <Stat label="Max" value={dataSource.maxhit} />
          <Stat self label="Crit%" value={self?.["crithit%"]} />
          <Stat self label="Direct%" value={self?.DirectHitPct} />
          <Stat self label="DirectCrit%" value={self?.CritDirectHitPct} />
        </div>
        <hr />
        <div className="extra-row healing">
          <Stat
            label="Heals"
            value={`${formatNumber(
              parseInt(dataSource.healed)
            )} (${formatNumber(parseRate(dataSource.enchps))})`}
          />
          <Stat label="Max" value={dataSource.maxheal} />
          <Stat self label="Crit%" value={self?.["critheal%"]} />
        </div>
      </div>
    );
  }
}

interface HeaderProps {
  encounter: EncounterEmbellished;
  onSelectEncounter: (index: number | null) => void;
  currentView: View;
  history: Array<DataUpdateEmbellished>;
  onViewChange: () => void;
  self: CombatantEmbellished;
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

  // XXX: Delete?
  shouldComponentUpdate(nextProps: HeaderProps) {
    // Will need to add a null check here if we are swapping betwen self and
    // group. Possibly more null checks as well.
    if (nextProps.encounter.encdps === "---") {
      return false;
    }
    return true;
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
        parseRate(encounter.encdps)
      )} dps)`,
      [View.Healing]: `Healing (${formatNumber(
        parseRate(encounter.enchps)
      )} hps)`,
      [View.Tanking]: `Damage Taken`,
      [View.Uptime]: `Uptime`,
      [View.Deaths]: `Deaths (${parseInt(encounter.deaths)} total)`,
    }[this.props.currentView];

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
                  {formatEncounter(encounter.Encounter)}
                </div>
              ))}
            </div>
            <span
              className={`arrow ${this.state.expanded ? "up" : "down"}`}
              onClick={() => this.toggleStats()}
            />
          </div>
          <div
            className={`ff-header header-right target-name`}
            onClick={this.props.onViewChange}
          >
            {currentViewSummary}
          </div>
        </div>
        {this.state.expanded ? (
          <Stats encounter={this.props.encounter} self={this.props.self} />
        ) : null}
      </div>
    );
  }
}

interface CombatantsProps {
  combatants: Array<CombatantEmbellished>;
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
        const actor =
          combatant.name === LIMIT_BREAK ? "lb" : combatant.Job.toLowerCase();

        const stats = _.merge(
          {
            actor,
            job: combatant.Job || "",
            characterName: combatant.name,
            isSelf: combatant.isSelf,
          },
          {
            [View.Damage]: {
              format: formatNumber,
              total: parseInt(combatant.damage),
              extra: [
                formatNumber(parseRate(combatant.encdps)),
                combatant["damage%"],
              ],
            },
            [View.Healing]: {
              format: formatNumber,
              total: parseInt(combatant.healed),
              note: `${combatant.OverHealPct} OH`,
              extra: [
                formatNumber(parseRate(combatant.enchps)),
                combatant["healed%"],
              ],
            },
            [View.Tanking]: {
              format: formatNumber,
              total: parseInt(combatant.damagetaken),
              extra: [
                `${combatant.ParryPct} parry`,
                `${combatant.BlockPct} block`,
              ],
            },
            [View.Uptime]: {
              format: formatSpan,
              total: combatant.uptime,
              extra: [formatPercent(combatant["uptime%"])],
            },
            [View.Deaths]: {
              format: _.identity,
              total: parseInt(combatant.deaths),
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
  data: DataUpdateEmbellished;
  playerName: string | null;
  history: Array<DataUpdateEmbellished>;
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

  shouldComponentUpdate(
    nextProps: DamageMeterProps,
    nextState: DamageMeterState
  ) {
    if (nextProps.data.Encounter.encdps === "---") {
      return false;
    }

    if (this.state.currentView !== nextState.currentView) {
      return true;
    }

    return true;
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
      [View.Damage]: (c: CombatantEmbellished) => parseInt(c.damage),
      [View.Healing]: (c: CombatantEmbellished) => parseInt(c.healed),
      [View.Tanking]: (c: CombatantEmbellished) => parseInt(c.damagetaken),
      [View.Uptime]: (c: CombatantEmbellished) => c.uptime,
      [View.Deaths]: (c: CombatantEmbellished) => parseInt(c.deaths),
    }[this.state.currentView];

    const self = encounter.Combatant[this.props.playerName ?? YOU];

    const combatants = _.sortBy(
      _.filter(encounter.Combatant, (d) => stat(d) > 0),
      (d) => -stat(d)
    );

    return (
      <div className="damage-meter">
        <Header
          encounter={encounter.Encounter}
          history={this.props.history}
          self={self}
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
  data: DataUpdateEmbellished;
}

class Debugger extends React.PureComponent<DebuggerProps> {
  constructor(props: DebuggerProps) {
    super(props);
  }

  render() {
    const css = {
      overflowY: "scroll",
      maxHeight: "250px",
    };
    return <pre style={css}>{JSON.stringify(this.props.data, null, 2)}</pre>;
  }
}

interface LogDataActivity {
  castStart: Date | null;
  lastCredit: Date;
  uptime: Span;
}

class LogData {
  encounterStart: Date;
  lastServerTime: Date;
  activity: {
    [name: string]: LogDataActivity;
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
    return dateDiff(this.lastServerTime, this.encounterStart);
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
  currentEncounter: DataUpdateEmbellished | null;
  history: Array<DataUpdateEmbellished>;
  selectedEncounter: DataUpdateEmbellished | null;
  rollingLogData: LogData | null;
  serverTime: Date;
  lastLogLine: number | null;
}

class App extends React.Component<AppProps, AppState> {
  static HISTORY_KEY = "meters";
  static PLAYER_NAME_KEY = "playerName";

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
    // Because TypeScript DOM types don't support CustomEvents by default
    const addEventListener = <T,>(
      name: string,
      f: (_: CustomEvent<T>) => void
    ) => {
      document.addEventListener(name, f.bind(this) as EventListener);
    };

    addEventListener("onLogLine", this.onLogLine);
    addEventListener("onOverlayDataUpdate", this.onOverlayDataUpdate);
    addEventListener("onOverlayStateUpdate", this.onOverlayStateUpdate);

    const withLoad = (key: string, f: (_: string) => void) => {
      const value = localStorage.getItem(key);
      if (value) f(value);
    };

    try {
      withLoad(App.PLAYER_NAME_KEY, (playerName) => {
        this.setState({ playerName });
      });

      withLoad(App.HISTORY_KEY, (payload) => {
        const history = JSON.parse(payload);
        if (history) {
          this.setState({ currentEncounter: history[0], history: history });
        }
      });
    } catch (ex) {
      console.error(`Couldn't load state: ${ex}`);
    }
  }

  onOverlayStateUpdate(e: CustomEvent<StateUpdate>) {
    if (!e.detail.isLocked) {
      document.documentElement.classList.add("resizable");
    } else {
      document.documentElement.classList.remove("resizable");
    }
  }

  onOverlayDataUpdate(e: CustomEvent<DataUpdate>) {
    const currentEncounter = e.detail;
    // Encounters without combatants can be nearby pulls in public areas that
    // you aren't involved in. Drop those updates unless they include someone.
    if (_.isEmpty(currentEncounter.Combatant)) return;

    let { history } = this.state;

    const isActive = (enc: DataUpdate | null) => enc?.isActive === "true";
    const duration = (enc: DataUpdate | null) => enc?.Encounter.DURATION;

    // Encounter started
    if (!isActive(this.state.currentEncounter) && isActive(currentEncounter)) {
      // XXX: lastLogLine / serverTime as null
      if (this.state.lastLogLine !== null && this.state.serverTime !== null) {
        const updateLag = performance.now() - this.state.lastLogLine;
        this.setState({
          selectedEncounter: null,
          rollingLogData: LogData.startNew({
            encounterStart: dateAdd(this.state.serverTime, updateLag),
          }),
        });
      }
    }

    // Only use our latest log data if the encounter's timer advanced. It's
    // possible that testing `isActive` is the right way to do this instead. The
    // idea is that if we get data updates after the encounter is over, the last
    // log data we applied is the most semantically correct one.
    const logData =
      duration(this.state.currentEncounter) === duration(currentEncounter) &&
      this.state.currentEncounter?.logData !== null
        ? // XXX: Extra null check implied by above
          (this.state.currentEncounter as DataUpdateEmbellished).logData
        : this.state.rollingLogData;

    // This could be null if you reloaded the overlay mid-combat.
    if (logData !== null) this.embellish(currentEncounter, logData);
    // XXX: mutation doesn't work well with types
    const embellishedEncounter = currentEncounter as DataUpdateEmbellished;

    // Encounter ended
    if (
      isActive(this.state.currentEncounter) &&
      !isActive(embellishedEncounter)
    ) {
      history = [embellishedEncounter].concat(history).slice(0, 10);

      localStorage.setItem(App.HISTORY_KEY, JSON.stringify(history));
    }

    this.setState({ currentEncounter: embellishedEncounter, history });
  }

  setPlayerName(playerName: string | null) {
    if (playerName && playerName !== this.state.playerName) {
      localStorage.setItem(App.PLAYER_NAME_KEY, playerName);
      this.setState({ playerName });
    }
  }

  onLogLine(e: CustomEvent<LogLine>) {
    const [code, timestamp, ...message] = JSON.parse(e.detail);
    // Sometimes the log lines go backwards in time, though I think this is
    // impossible within the codes we use.
    const serverTime = dateMax(this.state.serverTime, new Date(timestamp));
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
            ? [Math.max(GCD, dateDiff(serverTime, castStart)), castStart]
            : [GCD, serverTime];

        // However, in either case, if `GCD` has not elapsed between the two
        // credit times, the next credit is reduced so as not to double-credit.
        // Example: if I use an action at time t then another at t+1s, I would get
        // 3.5s total uptime credit. Another example: if I cast two 2s spells back
        // to back, I will get 4.5s of credit. This is a best approximation with
        // the information we have available.
        const uptimeOvercredit = Math.max(
          0,
          GCD - dateDiff(creditTime, lastCredit)
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

  embellish(dataUnembellished: DataUpdate, logData: LogData) {
    const { playerName } = this.state;
    // XXX: mutation doesn't work well with types
    let data = dataUnembellished as DataUpdateEmbellished;
    data.logData = logData;

    if (playerName && YOU in data.Combatant) {
      data.Combatant[YOU].isSelf = true;
      data.Combatant[YOU].name = playerName;
      data.Combatant[playerName] = data.Combatant[YOU];
      delete data.Combatant[YOU];
    }

    // This is different from the encounter's notion of duration because ACT
    // may be configured to trim out periods of inactivity.
    const encounterDuration = logData.encounterDuration();
    data.Encounter.durationTotal = encounterDuration;

    for (let name in data.Combatant) {
      let uptime = logData.uptimeFor(name);
      _.assign(data.Combatant[name], {
        uptime,
        ["uptime%"]: Math.min(1, uptime / encounterDuration),
      });
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
