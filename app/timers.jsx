const _ = window._;
const React = window.React;
const Scope = { Friendly: 0, Enemy: 1 };
const Target = { Self: 0, Single: 1, Many: 2 };

const bound = (x, { min, max }) => Math.min(max, Math.max(min, x));

// Functional updating for maps
Map.prototype.update = function (key, f) {
  const x = f(this.get(key));
  return new Map(this).set(key, x);
};

const DATA0 = {
  // TEST ==================================================================
  [0x99]: {
    // Thunder III (test)
    duration: 24,
    cooldown: 2.5,
    scope: Scope.Enemy,
    targeting: Target.Single,
    job: "blm",
  },

  // DAMAGE ================================================================
  [0x8d2]: {
    // Trick Attack
    duration: 15,
    cooldown: 60,
    scope: Scope.Enemy,
    targeting: Target.Single,
    job: "nin",
  },
  [0x1d0c]: {
    // Chain Stratagem
    duration: 15,
    cooldown: 120,
    scope: Scope.Enemy,
    targeting: Target.Single,
    job: "sch",
  },
  [0x40a8]: {
    // Divination
    duration: 15,
    cooldown: 120,
    scope: Scope.Friendly,
    targeting: Target.Many,
    job: "ast",
  },

  [0x1ce4]: {
    // Brotherhood
    duration: 15,
    cooldown: 90,
    scope: Scope.Friendly,
    targeting: Target.Many,
    job: "mnk",
  },
  [0xde5]: {
    // Battle Litany
    duration: 20,
    cooldown: 180,
    scope: Scope.Friendly,
    targeting: Target.Many,
    job: "drg",
  },
  [0x3f44]: {
    // Technical Finish (Quadruple)
    duration: 20,
    cooldown: 120,
    scope: Scope.Friendly,
    targeting: Target.Many,
    job: "dnc",
  },

  // DEFENSIVE =============================================================
  [0x1d88]: {
    // Addle
    duration: 10,
    cooldown: 90,
    scope: Scope.Enemy,
    targeting: Target.Single,
    job: "blm",
  },
  [0x3e8c]: {
    // Shield Samba
    duration: 15,
    cooldown: 120,
    scope: Scope.Friendly,
    targeting: Target.Many,
    job: "dnc",
  },
  [0x3f18]: {
    // Superbolide
    duration: 8,
    cooldown: 360,
    scope: Scope.Friendly,
    targeting: Target.Self,
    job: "gnb",
  },
  [0x3f20]: {
    // Heart of Light
    duration: 15,
    cooldown: 90,
    scope: Scope.Friendly,
    targeting: Target.Many,
    job: "gnb",
  },

  // HEALING ===============================================================
};

const DEV = true;
const DATA = DEV
  ? DATA0
  : _.pick(DATA0, [0x8d2, 0x1d0c, 0x40a8, 0x1ce4, 0xde5, 0x3f44]);

class ActionIcon {
  static _cache = {};
  static _currentRequest = null;
  static _lastRequest = performance.now();

  static API_ROOT = "https://xivapi.com";
  // Max 8 per second
  static RATE = 1000 / 8;

  static get(actionID) {
    if (this._cache[actionID]) return this._cache[actionID];

    this.fetch(actionID);
  }

  static fetch(actionID) {
    if (
      this._currentRequest ||
      performance.now() - this._lastRequest < this.RATE
    )
      return;

    this._currentRequest = actionID;

    fetch(`${this.API_ROOT}/Action/${actionID}?columns=Icon`, {
      mode: "cors",
    })
      .then((res) => res.json())
      .then(({ Icon }) => {
        this._cache[actionID] = `${this.API_ROOT}/${Icon}`;
        this._currentRequest = null;
        this._lastRequest = performance.now();
      })
      .catch((_err) => {
        this._currentRequest = null;
        this._lastRequest = performance.now();
      });
  }
}

// Because we want to use these as keys in a `Map`, and because maps use strict
// comparison for keys, we have to keep a global store of them similar to how
// `Symbol("foo")` is different than `Symbol.for("foo")`. This feels a bit
// silly, but the only other solutions are keeping two nestings of maps for each
// key part or using the string representation and then having a function that
// parses the string back into a `TimerKey`.
class TimerKey {
  static store = {};

  static stringRepr(actionID, sourceID) {
    return `${actionID}|${sourceID}`;
  }

  static for(actionID, sourceID) {
    return (this.store[this.stringRepr(actionID, sourceID)] ??= new TimerKey(
      actionID,
      sourceID
    ));
  }

  constructor(actionID, sourceID) {
    this.actionID = actionID;
    this.sourceID = sourceID;
  }

  toString() {
    return TimerKey.stringRepr(this.actionID, this.sourceID);
  }
}

class Timer extends React.Component {
  render() {
    // FFXIV's buff timers use ceil(), so we do the same for consistency
    const seconds = Math.ceil(this.props.timer);
    const width =
      bound(this.props.percentage * 100, { min: 0, max: 100 }).toFixed(2) + "%";
    const iconStyle = this.props.icon
      ? { backgroundImage: `url(${this.props.icon})` }
      : null;

    return (
      <li
        className={`row ${this.props.state} ${this.props.job}`}
        onClick={() => this.props.dismiss()}
      >
        <div className="bar fast" style={{ width: width }} />
        <div className="text-overlay">
          <div className="stats">
            {seconds > 0 ? <span className="total">{seconds}s</span> : null}
          </div>
          <div className="info">
            <span className="icon" style={iconStyle}></span>
            <span className="character-name">
              {this.props.action}: {this.props.source}
            </span>
            {this.props.subText ? (
              <span className="subtext">{this.props.subText}</span>
            ) : null}
          </div>
        </div>
      </li>
    );
  }
}

class Timers extends React.Component {
  render() {
    // Here we're traversing through a map of keys that correspond to a single
    // timer identified by the unique (action, source) tuple. The values are a
    // mapping from targets to last event on that target. We're constructing a
    // single array of unsorted timers from that distilled data.
    const timers = Array.from(this.props.tracking.entries()).flatMap(
      ([key, targets]) => {
        const { duration, cooldown, targeting, job } = DATA[key.actionID];
        const events = Array.from(targets.entries());

        if (events.length === 0) {
          return [];
        } else {
          const [_target, event] = _.maxBy(events, ([_, { castAt }]) => castAt);
          const elapsed = (this.props.serverTime - event.castAt) / 1000;

          let state, timer, percentage;

          if (elapsed < duration) {
            state = "active";
            timer = Math.max(0, duration - elapsed);
            percentage = timer / duration;
          } else {
            state = "cooldown";
            timer = Math.max(0, cooldown - elapsed);
            percentage = elapsed / cooldown;
          }

          const subText =
            state === "active"
              ? targeting !== Target.Many
                ? event.target
                : null
              : null;

          const icon = ActionIcon.get(key.actionID);

          return {
            key,
            state,
            timer,
            percentage,
            icon,
            job,
            subText,
            ...event,
          };
        }
      }
    );

    const ranking = [
      ({ state }) => (state === "active" ? 0 : 1),
      ({ timer }) => timer,
    ];

    return (
      <div className="timers">
        {_.sortBy(timers, ...ranking).map((timer) => (
          <Timer
            key={timer.key.toString()}
            dismiss={() => this.props.dismissRow(timer.key)}
            {...timer}
          />
        ))}
      </div>
    );
  }
}

class App extends React.Component {
  static STORAGE_KEY = "timers";
  static TIME_RESOLUTION = 50;

  constructor(props) {
    super(props);
    this.state = {
      serverTime: new Date(0),
      lastClockUpdate: null,
      tracking: new Map(),
    };
  }

  componentDidMount() {
    document.addEventListener("onLogLine", (e) => this.onLogLine(e));
    document.addEventListener("onOverlayStateUpdate", (e) =>
      this.onOverlayStateUpdate(e)
    );

    // Because updates from the server are sometimes spotty, every time we do
    // change our time, we note what the local time is as well. This timer runs
    // constantly, pushing the clock forward by the difference in our local
    // time, which helps account for skew.
    setInterval(() => {
      if (this.state.lastClockUpdate) {
        const offset = performance.now() - this.state.lastClockUpdate;
        const simulatedTime = new Date(
          this.state.serverTime.getTime() + offset
        );
        this.advanceTime(simulatedTime);
      }
    }, App.TIME_RESOLUTION);
  }

  advanceTime(now) {
    // We only set a new now if it advances our clock enough
    if (now - this.state.serverTime > App.TIME_RESOLUTION) {
      this.setState({ serverTime: now, lastClockUpdate: performance.now() });
    }
  }

  onOverlayStateUpdate(e) {
    if (!e.detail.isLocked) {
      document.documentElement.classList.add("resizable");
    } else {
      document.documentElement.classList.remove("resizable");
    }
  }

  onCast(sourceID, sourceName, actionID, actionName, targetID, targetName) {
    actionID = parseInt(actionID, 16);
    if (actionID in DATA) {
      const payload = {
        source: sourceName,
        action: actionName,
        target: targetName,
        castAt: this.state.serverTime,
      };
      const key = TimerKey.for(actionID, sourceID);
      const tracking = this.state.tracking.update(key, (targets) =>
        (targets ?? new Map()).update(targetID, (_) => payload)
      );
      this.setState({ tracking });
    }
  }

  onLogLine(e) {
    const [code, timestamp, ...message] = JSON.parse(e.detail);

    const now = new Date(timestamp);
    this.advanceTime(now);

    const handler = {
      21: () => this.onCast(...message),
      22: () => this.onCast(...message),
    }[code];

    if (handler) handler();
  }

  dismissRow(key) {
    this.setState({
      tracking: this.state.tracking.update(key, (_) => new Map()),
    });
  }

  render() {
    return (
      <Timers
        dismissRow={(key) => this.dismissRow(key)}
        serverTime={this.state.serverTime}
        tracking={this.state.tracking}
      />
    );
  }
}

window.App = App;
