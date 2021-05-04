import _ from "lodash";
import React from "react";
import * as ACT from "./act";
import {
  Dict,
  Option,
  Percent,
  RelativeTime,
  Span,
  addEventListener,
} from "./util";

interface CountdownProps {
  scale: Percent;
  duration: Span;
  elapsed: Span;
}

class Countdown extends React.Component<CountdownProps, {}> {
  render() {
    const remaining = Math.max(0, this.props.duration - this.props.elapsed);
    const width = ((remaining / this.props.duration) * 100).toFixed(2) + "%";
    const seconds = remaining / 1000;

    return (
      <ul className="countdown" style={{ fontSize: `${this.props.scale}em` }}>
        <li className="row">
          <div className="bar fast" style={{ width: width }} />
          <div className="text-overlay">
            <div className="stats">
              <span className="total">{seconds.toFixed(1)}s</span>
            </div>
            <div className="info">
              <span className="character-name">Countdown</span>
            </div>
          </div>
        </li>
      </ul>
    );
  }
}

interface AppProps {
  env: { scale: Percent };
}

interface AppState {
  now: RelativeTime;
  countdown: Option<{
    duration: Span;
    // Simply measured by `performance.now()`
    start: RelativeTime;
  }>;
}

class App extends React.Component<AppProps, AppState> {
  static TIME_RESOLUTION = 50;

  static env(query: Dict): AppProps["env"] {
    return { scale: parseFloat(query.scale) || 1 };
  }

  constructor(props: AppProps) {
    super(props);
    this.state = { now: performance.now(), countdown: null };
  }

  componentDidMount() {
    addEventListener<ACT.LogLine>("onLogLine", (e) => this.onLogLine(e));
    addEventListener<ACT.StateUpdate>("onOverlayStateUpdate", (e) =>
      this.onOverlayStateUpdate(e)
    );

    setInterval(() => {
      this.setState({ now: performance.now() });
    }, App.TIME_RESOLUTION);
  }

  onOverlayStateUpdate(e: CustomEvent<ACT.StateUpdate>) {
    if (!e.detail.isLocked) {
      document.documentElement.classList.add("resizable");
    } else {
      document.documentElement.classList.remove("resizable");
    }
  }

  onLogLine(e: CustomEvent<ACT.LogLine>) {
    // We intentionally don't use the timestamp here. It's always quite off
    // compared to other log messages, so we simply have to rely on the local
    // clock.
    const [code, _timestamp, ...message]: Array<string> = JSON.parse(e.detail);

    if (code === "00") {
      const [_0, source, text] = message;

      // We don't want chat messages
      if (source !== "") return;

      const match = (regex: RegExp, f: (_: RegExpMatchArray) => void) => {
        const m = text.match(regex);
        if (m) f(m);
      };

      match(/^Countdown canceled by .+$/, (_) => {
        this.setState({ countdown: null });
      });

      match(/^Engage!$/, (_) => {
        this.setState({ countdown: null });
      });

      match(/^Battle commencing in (\d+) seconds! \(.+\)$/, ([_, duration]) => {
        this.setState({
          countdown: {
            duration: parseInt(duration) * 1000,
            start: performance.now(),
          },
        });
      });
    }
  }

  render() {
    return this.state.countdown === null ? null : (
      <Countdown
        scale={this.props.env.scale}
        duration={this.state.countdown.duration}
        elapsed={this.state.now - this.state.countdown.start}
      />
    );
  }
}

export default App;
