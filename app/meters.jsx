/* global _ */
const LIMIT_BREAK = "Limit Break";
const YOU = "YOU";

const View = {
  Damage: "Damage",
  Healing: "Healing",
  Tanking: "Tanking",
  Deaths: "Deaths",
};

const React = window.React;

const options = ((search) => {
  let options = {};

  if (search[0] === "?") {
    search
      .slice(1)
      .split(",")
      .map((pair) => pair.split("="))
      .forEach(([k, v]) => {
        options[k] = v;
      });
  }

  return {
    you: options.you || YOU,
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
  number = parseFloat(number, 10);

  if (number >= 1000000) {
    return (number / 1000000).toFixed(2) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(2) + "K";
  } else if (number % 1 == 0) {
    // A bit of a hack for deaths so that they don't show as 1.00
    return number;
  }

  return number.toFixed(2);
};

class CombatantCompact extends React.Component {
  static defaultProps = {
    onClick() {},
  };

  render() {
    const width =
      Math.min(100, parseInt((this.props.total / this.props.max) * 100, 10)) +
      "%";

    return this.props.perSecond === "---" ? null : (
      <li
        className={
          "row " + this.props.actor + (this.props.isSelf ? " self" : "")
        }
        onClick={this.props.onClick}
      >
        <div className="bar" style={{ width: width }} />
        <div className="text-overlay">
          <div className="stats">
            <span className="total">{formatNumber(this.props.total)}</span>
            {this.props.additional ? (
              <span className="additional">[{this.props.additional}]</span>
            ) : null}
            {this.props.perSecond !== null
              ? `(${this.props.perSecond}, ${this.props.percentage})`
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

class Header extends React.Component {
  static defaultProps = {
    encounter: {},
    onViewChange() {},
    onSelectEncounter() {},
    onExtraDetailsClick() {},
  };

  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      group: true,
      showEncountersList: false,
    };
  }

  shouldComponentUpdate(nextProps) {
    // Will need to add a null check here if we are swapping betwen self and group.
    // Possibly more null checks as well.
    if (nextProps.encounter.encdps === "---") {
      return false;
    }
    return true;
  }

  toggleExtraDetails(e) {
    this.props.onExtraDetailsClick(e);

    this.setState({
      expanded: !this.state.expanded,
    });
  }

  // Show dropdown for list of encounters
  toggleEncounterMenu() {
    this.setState({
      showEncountersList: !this.state.showEncountersList,
    });
  }

  // Toggle between group and indidivual stats.
  toggleStats() {
    this.setState({
      group: !this.state.group,
    });
  }

  onSelectEncounter(index) {
    this.setState({ showEncountersList: false });
    this.props.onSelectEncounter(index);
  }

  render() {
    const data = this.props.data;
    const encounter = this.props.encounter;
    const self = data[YOU];

    // This is the switcher for Toggling group info or self info
    let DataSource = this.state.group ? encounter : self;
    if (self == undefined) {
      DataSource = encounter;
    }
    // Calculate the direct hit % based off of the combatant list. This is not efficient and needs to be removed
    // Once the encounter object is fixed to properly include this info.
    let datalength = 0;
    let DirectHitPct = 0;
    let CritDirectHitPct = 0;
    if (this.state.group) {
      if (data !== undefined) {
        for (let x in data) {
          if (!Object.prototype.hasOwnProperty.call(data, x)) continue;
          DirectHitPct += parseFloat(
            data[x].DirectHitPct.substring(0, data[x].DirectHitPct.length - 1)
          );
          CritDirectHitPct += parseFloat(
            data[x].CritDirectHitPct.substring(
              0,
              data[x].CritDirectHitPct.length - 1
            )
          );
          datalength++;
        }
        if (DirectHitPct > 0) {
          DirectHitPct = parseFloat(DirectHitPct / datalength);
        }
        if (CritDirectHitPct > 0) {
          CritDirectHitPct = parseFloat(CritDirectHitPct / datalength);
        }
      }
    } else {
      if (self != undefined) {
        DirectHitPct = self.DirectHitPct;
        CritDirectHitPct = self.CritDirectHitPct;
      }
    }

    const currentViewSummary = {
      [View.Damage]: `Damage (${formatNumber(encounter.encdps)} dps)`,
      [View.Healing]: `Healing (${formatNumber(encounter.enchps)} hps)`,
      [View.Tanking]: `Damage Taken`,
      [View.Deaths]: `Deaths (${encounter.deaths} total)`,
    }[this.props.currentView];

    return (
      <div
        className={`header view-color ${this.props.currentView.toLowerCase()} ${
          this.state.expanded ? "" : "collapsed"
        }`}
      >
        <div className="encounter-header">
          <div className="encounter-data ff-header">
            <span
              className="target-name dropdown-parent"
              onClick={this.toggleEncounterMenu.bind(this)}
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
              onClick={this.toggleExtraDetails.bind(this)}
            />
          </div>

          <div
            className={`ff-header target-name`}
            style={{ float: "right", cursor: "pointer" }}
            onClick={this.props.onViewChange}
          >
            {currentViewSummary}
          </div>
        </div>
        <div className="extra-details">
          {this.props.currentView == View.Damage ? (
            <div
              className="data-set-view-switcher clearfix"
              onClick={this.toggleStats.bind(this)}
            >
              <span
                className={`data-set-option ${
                  this.state.group ? "active" : ""
                }`}
              >
                G
              </span>
              <span
                className={`data-set-option ${
                  !this.state.group ? "active" : ""
                }`}
              >
                I
              </span>
            </div>
          ) : null}
          <div className="extra-row damage">
            <div className="cell">
              <span className="label ff-header">Damage</span>
              <span className="value ff-text">
                {`${formatNumber(DataSource.damage)} (${formatNumber(
                  DataSource.encdps
                )})`}
              </span>
            </div>

            <div className="cell">
              <span className="label ff-header">Max</span>
              <span className="value ff-text">{DataSource.maxhit}</span>
            </div>
          </div>
          <div className="extra-row damage">
            {/* crithit is not being calculated properly in the Encounter object so instead we are calcing it on the fly*/}
            <div className="cell">
              <span className="label ff-header">Crit%</span>
              <span className="value ff-text">
                {formatNumber(
                  parseFloat((DataSource.crithits / DataSource.hits) * 100)
                ) + "%"}
              </span>
            </div>
            <div className="cell">
              <span className="label ff-header">Misses</span>
              <span className="value ff-text">{encounter.misses}</span>
            </div>
            {/* DirectHitPct coming from the Encounter object is missing so we are calcing above */}
            <div className="cell">
              <span className="label ff-header">Direct%</span>
              <span className="value ff-text">
                {formatNumber(DirectHitPct) + "%"}
              </span>
            </div>
            {/* CritDirectHitPct coming from the Encounter object is missing so we are calcing above */}
            <div className="cell">
              <span className="label ff-header">DirectCrit%</span>
              <span className="value ff-text">
                {formatNumber(CritDirectHitPct) + "%"}
              </span>
            </div>
          </div>
          <div className="extra-row healing">
            <div className="cell">
              <span className="label ff-header">Heals</span>
              <span className="value ff-text">
                {`${formatNumber(DataSource.healed)} (${formatNumber(
                  DataSource.enchps
                )})`}
              </span>
            </div>
            {/* Overlay plugin is not returning correct heal values  */}
            <div className="cell">
              <span className="label ff-header">Crit%</span>
              <span className="value ff-text">{DataSource["critheal%"]}</span>
            </div>
            <div className="cell">
              <span className="label ff-header">Max</span>
              <span className="value ff-text">{DataSource.maxheal}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class Combatants extends React.Component {
  static defaultProps = {
    onClick() {},
  };

  shouldComponentUpdate(nextProps) {
    // if data is empty then don't re-render
    if (Object.getOwnPropertyNames(nextProps.data).length === 0) {
      return false;
    }

    return true;
  }

  render() {
    const maxRows = 12;
    let max;

    const rows = _.take(this.props.data, maxRows).map((combatant, rank) => {
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
            total: combatant.damage,
            perSecond: formatNumber(combatant.encdps),
            percentage: combatant["damage%"],
          },
          [View.Healing]: {
            total: combatant.healed,
            additional: combatant["OverHealPct"],
            perSecond: formatNumber(combatant.enchps),
            percentage: combatant["healed%"],
          },
          [View.Tanking]: {
            total: combatant.damagetaken,
            perSecond: combatant.ParryPct,
            percentage: combatant.BlockPct,
          },
          [View.Deaths]: {
            total: combatant.deaths,
            perSecond: null,
            percentage: null,
          },
        }[this.props.currentView]
      );

      max = max || stats.total;

      return (
        <CombatantCompact
          onClick={this.props.onClick}
          rank={rank + 1}
          data={combatant}
          isSelf={isSelf}
          key={combatant.name}
          max={max}
          {...stats}
        />
      );
    });

    return <ul className="combatants">{rows}</ul>;
  }
}

class DamageMeter extends React.Component {
  static defaultProps = {
    parseData: {},
    noJobColors: false,
  };

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

  handleCombatRowClick() {}

  handleViewChange() {
    const views = Object.keys(View);
    const index = views.indexOf(this.state.currentView);

    this.setState({
      currentView: views[(index + 1) % views.length],
    });
  }

  render() {
    const debug = false;
    let data, encounterData;

    if (this.props.selectedEncounter) {
      data = this.props.selectedEncounter.Combatant;
      encounterData = this.props.selectedEncounter.Encounter;
    } else {
      data = this.props.parseData.Combatant;
      encounterData = this.props.parseData.Encounter;
    }

    const stat = {
      [View.Damage]: "damage",
      [View.Healing]: "healed",
      [View.Tanking]: "damagetaken",
      [View.Deaths]: "deaths",
    }[this.state.currentView];

    data = _.sortBy(
      _.filter(data, (d) => parseInt(d[stat]) > 0),
      (d) => -parseInt(d[stat])
    );

    return (
      <div className="damage-meter">
        <Header
          encounter={encounterData}
          history={this.props.history}
          data={data}
          onViewChange={this.handleViewChange.bind(this)}
          onSelectEncounter={this.props.onSelectEncounter}
          currentView={this.state.currentView}
        />
        <Combatants
          currentView={this.state.currentView}
          onClick={this.handleCombatRowClick}
          data={data}
        />
        {!debug ? null : (
          <div>
            <Debugger data={this.props.parseData} />
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
    document.addEventListener(
      "onOverlayDataUpdate",
      this.onOverlayDataUpdate.bind(this)
    );
    document.addEventListener(
      "onOverlayStateUpdate",
      this.onOverlayStateUpdate.bind(this)
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
