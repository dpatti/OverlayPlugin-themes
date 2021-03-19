const _ = window._;
const React = window.React;

const GCD = 2500;

const LIMIT_BREAK = "Limit Break";
const YOU = "YOU";

const View = {
  Damage: "Damage",
  Healing: "Healing",
  Tanking: "Tanking",
  Uptime: "Uptime",
  Deaths: "Deaths",
};

const options = ((search) => {
  let options = {};

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
    you: options.you || YOU,
    debug: "debug" in options || false,
  };
})(document.location.search);

// helper to functionally set a key in an object by returning a new copy
const fset = (obj, key, value) => _.defaults({ [key]: value }, obj);

const formatName = (name) => {
  if (name == YOU) {
    return options.you.replace(/_/g, " ");
  } else {
    return name;
  }
};

const formatEncounter = (enc) => `${enc.title} (${enc.duration})`;

const formatNumber = (number) => {
  number = parseFloat(number);

  if (number >= 1000000) {
    return (number / 1000000).toFixed(2) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(2) + "K";
  }

  return number.toFixed(2);
};

const formatPercent = (number) => `${(number * 100).toFixed(0)}%`;

const formatSpan = (ms) => {
  const seconds = ms / 1000;
  const min = Math.floor(seconds / 60);
  const sec = (Math.abs(seconds) % 60).toFixed(0);
  return `${min}:${("0" + sec).slice(-2)}`;
};

class CombatantCompact extends React.Component {
  render() {
    const width =
      Math.min(100, parseInt((this.props.total / this.props.max) * 100)) + "%";

    return this.props.perSecond === "---" ? null : (
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

class Stats extends React.Component {
  constructor(props) {
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

    const Stat = (props) =>
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
            value={`${formatNumber(dataSource.damage)} (${formatNumber(
              dataSource.encdps
            )})`}
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
            value={`${formatNumber(dataSource.healed)} (${formatNumber(
              dataSource.enchps
            )})`}
          />
          <Stat label="Max" value={dataSource.maxheal} />
          <Stat self label="Crit%" value={self?.["critheal%"]} />
        </div>
      </div>
    );
  }
}

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      showEncountersList: false,
    };
  }

  shouldComponentUpdate(nextProps) {
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

  onSelectEncounter(index) {
    this.toggleEncounterMenu(false);
    this.props.onSelectEncounter(index);
  }

  render() {
    const encounter = this.props.encounter;

    const currentViewSummary = {
      [View.Damage]: `Damage (${formatNumber(encounter.encdps)} dps)`,
      [View.Healing]: `Healing (${formatNumber(encounter.enchps)} hps)`,
      [View.Tanking]: `Damage Taken`,
      [View.Uptime]: `Uptime`,
      [View.Deaths]: `Deaths (${encounter.deaths} total)`,
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

class Combatants extends React.Component {
  shouldComponentUpdate(nextProps) {
    // if data is empty then don't re-render
    if (Object.getOwnPropertyNames(nextProps.combatants).length === 0) {
      return false;
    }

    return true;
  }

  render() {
    const maxRows = 12;
    let max;

    const rows = _.take(this.props.combatants, maxRows).map(
      (combatant, rank) => {
        const isSelf = combatant.name === YOU || combatant.name === "You";
        const actor =
          combatant.name === LIMIT_BREAK ? "lb" : combatant.Job.toLowerCase();

        const stats = _.merge(
          {
            actor,
            job: combatant.Job || "",
            characterName: combatant.name,
          },
          {
            [View.Damage]: {
              format: formatNumber,
              total: combatant.damage,
              extra: [formatNumber(combatant.encdps), combatant["damage%"]],
            },
            [View.Healing]: {
              format: formatNumber,
              total: combatant.healed,
              note: combatant.OverHealPct,
              extra: [formatNumber(combatant.enchps), combatant["healed%"]],
            },
            [View.Tanking]: {
              format: formatNumber,
              total: combatant.damagetaken,
              extra: [combatant.ParryPct, combatant.BlockPct],
            },
            [View.Uptime]: {
              format: formatSpan,
              total: combatant.uptime,
              extra: [formatPercent(combatant["uptime%"])],
            },
            [View.Deaths]: {
              format: _.identity,
              total: combatant.deaths,
              extra: [],
            },
          }[this.props.currentView]
        );

        max = max || stats.total;

        return (
          <CombatantCompact
            rank={rank + 1}
            data={combatant}
            isSelf={isSelf}
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

class DamageMeter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentView: View.Damage,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.data.Encounter.encdps === "---") {
      return false;
    }

    if (this.state.currentView !== nextState.currentView) {
      return true;
    }

    return true;
  }

  handleViewChange() {
    const views = Object.keys(View);
    const index = views.indexOf(this.state.currentView);

    this.setState({
      currentView: views[(index + 1) % views.length],
    });
  }

  render() {
    const encounter = this.props.data;

    const stat = {
      [View.Damage]: "damage",
      [View.Healing]: "healed",
      [View.Tanking]: "damagetaken",
      [View.Uptime]: "uptime",
      [View.Deaths]: "deaths",
    }[this.state.currentView];

    const self = encounter.Combatant.YOU;

    const combatants = _.sortBy(
      _.filter(encounter.Combatant, (d) => parseInt(d[stat]) > 0),
      (d) => -parseInt(d[stat])
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

class Debugger extends React.Component {
  constructor(props) {
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

class App extends React.Component {
  static STORAGE_KEY = "meters";

  constructor(props) {
    super(props);
    this.state = {
      currentEncounter: null,
      history: [],
      selectedEncounter: null,
      actionTracking: {},
      serverTime: new Date(0),
    };
  }

  componentDidMount() {
    document.addEventListener("onLogLine", (e) => this.onLogLine(e));
    document.addEventListener("onOverlayDataUpdate", (e) =>
      this.onOverlayDataUpdate(e)
    );
    document.addEventListener("onOverlayStateUpdate", (e) =>
      this.onOverlayStateUpdate(e)
    );

    try {
      const stored = JSON.parse(localStorage.getItem(App.STORAGE_KEY));
      if (stored) {
        this.setState({ currentEncounter: stored[0], history: stored });
      }
    } catch (ex) {
      console.error(`Couldn't load state: ${ex}`);
    }
  }

  onOverlayStateUpdate(e) {
    if (!e.detail.isLocked) {
      document.documentElement.classList.add("resizable");
    } else {
      document.documentElement.classList.remove("resizable");
    }
  }

  onOverlayDataUpdate(e) {
    const currentEncounter = e.detail;
    let history = this.state.history;
    let selectedEncounter = this.state.selectedEncounter;
    let actionTracking = this.state.actionTracking;

    const isActive = (enc) => enc !== null && enc.isActive === "true";

    // Encounter started
    if (!isActive(this.state.currentEncounter) && isActive(currentEncounter)) {
      selectedEncounter = null;
      actionTracking = {};
    }

    // Mutates encounter
    this.embellish(currentEncounter, actionTracking);

    // Encounter ended
    if (isActive(this.state.currentEncounter) && !isActive(currentEncounter)) {
      history = [currentEncounter].concat(history).slice(0, 10);

      localStorage.setItem(App.STORAGE_KEY, JSON.stringify(history));
    }

    this.setState({
      currentEncounter,
      history,
      selectedEncounter,
      actionTracking,
    });
  }

  onLogLine(e) {
    const [code, timestamp, ...message] = JSON.parse(e.detail);
    // Sometimes the log lines go backwards in time, though I think this is
    // unlikely within a given code.
    const serverTime = Math.max(this.state.serverTime, new Date(timestamp));

    const getRecord = (sourceName) =>
      this.state.actionTracking[sourceName] ?? {
        castStart: null,
        lastCredit: new Date(0),
        uptime: 0,
      };

    const applyUpdate = (sourceName, data) =>
      this.setState({
        serverTime,
        actionTracking: fset(this.state.actionTracking, sourceName, data),
      });

    if (code === "20") {
      // Start casting
      const [_sourceID, sourceName] = message;
      const data = fset(getRecord(sourceName), "castStart", serverTime);
      applyUpdate(sourceName, data);
    } else if (code === "23") {
      // Cancelled cast
      const [_sourceID, sourceName] = message;
      const data = fset(getRecord(sourceName), "castStart", null);
      applyUpdate(sourceName, data);
    } else if (code === "21" || code === "22") {
      // Action used
      const [_sourceID, sourceName] = message;
      const { castStart, lastCredit, uptime } = getRecord(sourceName);

      // If you were casting, you get credit for the duration of that cast or
      // `GCD`, whichever is greater. If you weren't casting, you get `GCD`
      // worth of uptime credited to you. In both cases, we can't tell how much
      // your GCD is due to spell/skill speed.
      const wasCasting = castStart !== null;
      const uptimeCredit = wasCasting
        ? Math.max(GCD, serverTime - castStart)
        : GCD;
      const creditTime = wasCasting ? castStart : serverTime;

      // However, in either case, if `GCD` has not elapsed between the two
      // credit times, the next credit is reduced so as not to double-credit.
      // Example: if I use an action at time t then another at t+1s, I would get
      // 3.5s total uptime credit. Another example: if I cast two 2s spells back
      // to back, I will get 4.5s of credit. This is a best approximation with
      // the information we have available.
      const uptimeOvercredit = Math.max(0, GCD - (creditTime - lastCredit));

      applyUpdate(sourceName, {
        castStart: null,
        lastCredit: creditTime,
        uptime: uptime + uptimeCredit - uptimeOvercredit,
      });
    }
  }

  onSelectEncounter(index) {
    if (index >= 0) {
      this.setState({
        selectedEncounter: this.state.history[index],
      });
    } else {
      this.setState({
        selectedEncounter: null,
      });
    }
  }

  embellish(data, actionTracking) {
    // This won't work for "YOU" unless you specify your player name
    for (let name in data.Combatant) {
      let sourceName = formatName(name);
      let uptime = actionTracking[sourceName]?.uptime ?? 0;
      // We're using ACT's notion of encounter here, which might trim downtime,
      // but that should be a good upper bound still.
      let encounterDuration = parseInt(data.Encounter.DURATION) * 1000;

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
      />
    ) : (
      <h3>Awaiting data.</h3>
    );
  }
}

window.App = App;
