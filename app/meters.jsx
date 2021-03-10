const _ = window._;
const React = window.React;

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

const formatSpan = (seconds) => {
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
            <span className="job-icon"></span>
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

        const uptime = parseInt(combatant.DURATION);

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
              note: combatant["OverHealPct"],
              extra: [formatNumber(combatant.enchps), combatant["healed%"]],
            },
            [View.Tanking]: {
              format: formatNumber,
              total: combatant.damagetaken,
              extra: [combatant.ParryPct, combatant.BlockPct],
            },
            [View.Uptime]: {
              format: formatSpan,
              total: uptime,
              extra: [formatPercent(max ? uptime / max : 1.0)],
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
    if (nextProps.parseData.Encounter.encdps === "---") {
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
    const encounter = this.props.selectedEncounter
      ? this.props.selectedEncounter
      : this.props.parseData;

    const stat = {
      [View.Damage]: "damage",
      [View.Healing]: "healed",
      [View.Tanking]: "damagetaken",
      [View.Uptime]: "DURATION",
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
      parseData: null,
      history: [],
      selectedEncounter: null,
    };
  }

  componentDidMount() {
    document.addEventListener("onOverlayDataUpdate", (e) =>
      this.onOverlayDataUpdate(e)
    );
    document.addEventListener("onOverlayStateUpdate", (e) =>
      this.onOverlayStateUpdate(e)
    );

    try {
      const stored = JSON.parse(localStorage.getItem(App.STORAGE_KEY));
      if (stored) {
        this.setState({ parseData: stored[0], history: stored });
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
    const parseData = e.detail;
    let history = this.state.history;
    let selectedEncounter = this.state.selectedEncounter;

    // Encounter started
    if (
      this.state.parseData?.Encounter.title !== "Encounter" &&
      parseData.Encounter.title == "Encounter"
    ) {
      selectedEncounter = null;
    }

    // Encounter ended
    if (
      this.state.parseData?.Encounter.title === "Encounter" &&
      parseData.Encounter.title !== "Encounter"
    ) {
      history = [
        {
          Encounter: parseData.Encounter,
          Combatant: parseData.Combatant,
        },
      ]
        .concat(history)
        .slice(0, 10);

      localStorage.setItem(App.STORAGE_KEY, JSON.stringify(history));
    }

    this.setState({ parseData, history, selectedEncounter });
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

  render() {
    return this.state.parseData ? (
      <DamageMeter
        parseData={this.state.parseData}
        history={this.state.history}
        selectedEncounter={this.state.selectedEncounter}
        onSelectEncounter={(index) => this.onSelectEncounter(index)}
      />
    ) : (
      <h3>Awaiting data.</h3>
    );
  }
}

window.App = App;
