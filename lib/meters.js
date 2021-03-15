"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _ = window._;
var React = window.React;
var GCD = 2500;
var LIMIT_BREAK = "Limit Break";
var YOU = "YOU";
var View = {
  Damage: "Damage",
  Healing: "Healing",
  Tanking: "Tanking",
  Uptime: "Uptime",
  Deaths: "Deaths"
};

var options = function (search) {
  var options = {};

  if (search[0] === "?") {
    search.slice(1).split("&").map(function (pair) {
      return pair.split("=");
    }).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          k = _ref2[0],
          v = _ref2[1];

      options[k] = v;
    });
  }

  return {
    you: options.you || YOU,
    debug: "debug" in options || false
  };
}(document.location.search); // helper to functionally set a key in an object by returning a new copy


var fset = function fset(obj, key, value) {
  return _.defaults(_defineProperty({}, key, value), obj);
};

var formatName = function formatName(name) {
  if (name == YOU) {
    return options.you.replace(/_/g, " ");
  } else {
    return name;
  }
};

var formatEncounter = function formatEncounter(enc) {
  return "".concat(enc.title, " (").concat(enc.duration, ")");
};

var formatNumber = function formatNumber(number) {
  number = parseFloat(number);

  if (number >= 1000000) {
    return (number / 1000000).toFixed(2) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(2) + "K";
  }

  return number.toFixed(2);
};

var formatPercent = function formatPercent(number) {
  return "".concat((number * 100).toFixed(0), "%");
};

var formatSpan = function formatSpan(ms) {
  var seconds = ms / 1000;
  var min = Math.floor(seconds / 60);
  var sec = (Math.abs(seconds) % 60).toFixed(0);
  return "".concat(min, ":").concat(("0" + sec).slice(-2));
};

var CombatantCompact = /*#__PURE__*/function (_React$Component) {
  _inherits(CombatantCompact, _React$Component);

  var _super = _createSuper(CombatantCompact);

  function CombatantCompact() {
    _classCallCheck(this, CombatantCompact);

    return _super.apply(this, arguments);
  }

  _createClass(CombatantCompact, [{
    key: "render",
    value: function render() {
      var width = Math.min(100, parseInt(this.props.total / this.props.max * 100)) + "%";
      return this.props.perSecond === "---" ? null : /*#__PURE__*/React.createElement("li", {
        className: "row ".concat(this.props.actor, " ").concat(this.props.isSelf ? "self" : "")
      }, /*#__PURE__*/React.createElement("div", {
        className: "bar",
        style: {
          width: width
        }
      }), /*#__PURE__*/React.createElement("div", {
        className: "text-overlay"
      }, /*#__PURE__*/React.createElement("div", {
        className: "stats"
      }, /*#__PURE__*/React.createElement("span", {
        className: "total"
      }, this.props.format(this.props.total)), this.props.note ? /*#__PURE__*/React.createElement("span", {
        className: "note"
      }, "[", this.props.note, "]") : null, this.props.extra.length > 0 ? "(".concat(this.props.extra.join(", "), ")") : null), /*#__PURE__*/React.createElement("div", {
        className: "info"
      }, /*#__PURE__*/React.createElement("span", {
        className: "icon job-icon"
      }), /*#__PURE__*/React.createElement("span", {
        className: "rank"
      }, this.props.rank, "."), /*#__PURE__*/React.createElement("span", {
        className: "character-name"
      }, formatName(this.props.characterName)), /*#__PURE__*/React.createElement("span", {
        className: "character-job"
      }, this.props.job))));
    }
  }]);

  return CombatantCompact;
}(React.Component);

var Stats = /*#__PURE__*/function (_React$Component2) {
  _inherits(Stats, _React$Component2);

  var _super2 = _createSuper(Stats);

  function Stats(props) {
    var _this;

    _classCallCheck(this, Stats);

    _this = _super2.call(this, props);
    _this.state = {
      group: true
    };
    return _this;
  }

  _createClass(Stats, [{
    key: "toggleSource",
    value: function toggleSource() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !this.state.group;
      this.setState({
        group: value
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var self = this.props.self;
      var dataSource = this.state.group || !self ? this.props.encounter : self;

      var Stat = function Stat(props) {
        return props.value && (!props.self || !_this2.state.group) ? /*#__PURE__*/React.createElement("div", {
          className: "cell"
        }, /*#__PURE__*/React.createElement("span", {
          className: "label ff-header"
        }, props.label), /*#__PURE__*/React.createElement("span", {
          className: "value ff-text"
        }, props.value)) : null;
      };

      return /*#__PURE__*/React.createElement("div", {
        className: "extra-details"
      }, /*#__PURE__*/React.createElement("div", {
        className: "data-set-view-switcher clearfix",
        onClick: function onClick() {
          return _this2.toggleSource();
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "data-set-option ".concat(this.state.group ? "active" : "")
      }, "G"), /*#__PURE__*/React.createElement("span", {
        className: "data-set-option ".concat(!this.state.group ? "active" : "")
      }, "I")), /*#__PURE__*/React.createElement("div", {
        className: "extra-row damage"
      }, /*#__PURE__*/React.createElement(Stat, {
        label: "Damage",
        value: "".concat(formatNumber(dataSource.damage), " (").concat(formatNumber(dataSource.encdps), ")")
      }), /*#__PURE__*/React.createElement(Stat, {
        label: "Max",
        value: dataSource.maxhit
      }), /*#__PURE__*/React.createElement(Stat, {
        self: true,
        label: "Crit%",
        value: self === null || self === void 0 ? void 0 : self["crithit%"]
      }), /*#__PURE__*/React.createElement(Stat, {
        self: true,
        label: "Direct%",
        value: self === null || self === void 0 ? void 0 : self.DirectHitPct
      }), /*#__PURE__*/React.createElement(Stat, {
        self: true,
        label: "DirectCrit%",
        value: self === null || self === void 0 ? void 0 : self.CritDirectHitPct
      })), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("div", {
        className: "extra-row healing"
      }, /*#__PURE__*/React.createElement(Stat, {
        label: "Heals",
        value: "".concat(formatNumber(dataSource.healed), " (").concat(formatNumber(dataSource.enchps), ")")
      }), /*#__PURE__*/React.createElement(Stat, {
        label: "Max",
        value: dataSource.maxheal
      }), /*#__PURE__*/React.createElement(Stat, {
        self: true,
        label: "Crit%",
        value: self === null || self === void 0 ? void 0 : self["critheal%"]
      })));
    }
  }]);

  return Stats;
}(React.Component);

var Header = /*#__PURE__*/function (_React$Component3) {
  _inherits(Header, _React$Component3);

  var _super3 = _createSuper(Header);

  function Header(props) {
    var _this3;

    _classCallCheck(this, Header);

    _this3 = _super3.call(this, props);
    _this3.state = {
      expanded: false,
      showEncountersList: false
    };
    return _this3;
  }

  _createClass(Header, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      // Will need to add a null check here if we are swapping betwen self and
      // group. Possibly more null checks as well.
      if (nextProps.encounter.encdps === "---") {
        return false;
      }

      return true;
    }
  }, {
    key: "toggleStats",
    value: function toggleStats() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !this.state.expanded;
      this.setState({
        expanded: value
      });
    } // Show dropdown for list of encounters

  }, {
    key: "toggleEncounterMenu",
    value: function toggleEncounterMenu() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !this.state.showEncountersList;
      this.setState({
        showEncountersList: value
      });
    }
  }, {
    key: "onSelectEncounter",
    value: function onSelectEncounter(index) {
      this.toggleEncounterMenu(false);
      this.props.onSelectEncounter(index);
    }
  }, {
    key: "render",
    value: function render() {
      var _View$Damage$View$Hea,
          _this4 = this;

      var encounter = this.props.encounter;
      var currentViewSummary = (_View$Damage$View$Hea = {}, _defineProperty(_View$Damage$View$Hea, View.Damage, "Damage (".concat(formatNumber(encounter.encdps), " dps)")), _defineProperty(_View$Damage$View$Hea, View.Healing, "Healing (".concat(formatNumber(encounter.enchps), " hps)")), _defineProperty(_View$Damage$View$Hea, View.Tanking, "Damage Taken"), _defineProperty(_View$Damage$View$Hea, View.Uptime, "Uptime"), _defineProperty(_View$Damage$View$Hea, View.Deaths, "Deaths (".concat(encounter.deaths, " total)")), _View$Damage$View$Hea)[this.props.currentView];
      return /*#__PURE__*/React.createElement("div", {
        className: "header view-color ".concat(this.props.currentView.toLowerCase())
      }, /*#__PURE__*/React.createElement("div", {
        className: "encounter-header"
      }, /*#__PURE__*/React.createElement("div", {
        className: "encounter-data ff-header"
      }, /*#__PURE__*/React.createElement("span", {
        className: "target-name dropdown-parent",
        onClick: function onClick() {
          return _this4.toggleEncounterMenu();
        }
      }, formatEncounter(encounter)), /*#__PURE__*/React.createElement("div", {
        className: "dropdown-menu encounters-list-dropdown ".concat(this.state.showEncountersList ? "" : "hidden")
      }, /*#__PURE__*/React.createElement("div", {
        className: "dropdown-menu-item target-name",
        onClick: function onClick() {
          return _this4.onSelectEncounter(null);
        }
      }, "Current Fight"), this.props.history.map(function (encounter, i) {
        return /*#__PURE__*/React.createElement("div", {
          key: i,
          className: "dropdown-menu-item target-name",
          onClick: function onClick() {
            return _this4.onSelectEncounter(i);
          }
        }, formatEncounter(encounter.Encounter));
      })), /*#__PURE__*/React.createElement("span", {
        className: "arrow ".concat(this.state.expanded ? "up" : "down"),
        onClick: function onClick() {
          return _this4.toggleStats();
        }
      })), /*#__PURE__*/React.createElement("div", {
        className: "ff-header header-right target-name",
        onClick: this.props.onViewChange
      }, currentViewSummary)), this.state.expanded ? /*#__PURE__*/React.createElement(Stats, {
        encounter: this.props.encounter,
        self: this.props.self
      }) : null);
    }
  }]);

  return Header;
}(React.Component);

var Combatants = /*#__PURE__*/function (_React$Component4) {
  _inherits(Combatants, _React$Component4);

  var _super4 = _createSuper(Combatants);

  function Combatants() {
    _classCallCheck(this, Combatants);

    return _super4.apply(this, arguments);
  }

  _createClass(Combatants, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      // if data is empty then don't re-render
      if (Object.getOwnPropertyNames(nextProps.combatants).length === 0) {
        return false;
      }

      return true;
    }
  }, {
    key: "render",
    value: function render() {
      var _this5 = this;

      var maxRows = 12;
      var max;

      var rows = _.take(this.props.combatants, maxRows).map(function (combatant, rank) {
        var _View$Damage$View$Hea2;

        var isSelf = combatant.name === YOU || combatant.name === "You";
        var actor = combatant.name === LIMIT_BREAK ? "lb" : combatant.Job.toLowerCase();

        var stats = _.merge({
          actor: actor,
          job: combatant.Job || "",
          characterName: combatant.name
        }, (_View$Damage$View$Hea2 = {}, _defineProperty(_View$Damage$View$Hea2, View.Damage, {
          format: formatNumber,
          total: combatant.damage,
          extra: [formatNumber(combatant.encdps), combatant["damage%"]]
        }), _defineProperty(_View$Damage$View$Hea2, View.Healing, {
          format: formatNumber,
          total: combatant.healed,
          note: combatant.OverHealPct,
          extra: [formatNumber(combatant.enchps), combatant["healed%"]]
        }), _defineProperty(_View$Damage$View$Hea2, View.Tanking, {
          format: formatNumber,
          total: combatant.damagetaken,
          extra: [combatant.ParryPct, combatant.BlockPct]
        }), _defineProperty(_View$Damage$View$Hea2, View.Uptime, {
          format: formatSpan,
          total: combatant.uptime,
          extra: [formatPercent(combatant["uptime%"])]
        }), _defineProperty(_View$Damage$View$Hea2, View.Deaths, {
          format: _.identity,
          total: combatant.deaths,
          extra: []
        }), _View$Damage$View$Hea2)[_this5.props.currentView]);

        max = max || stats.total;
        return /*#__PURE__*/React.createElement(CombatantCompact, _extends({
          rank: rank + 1,
          data: combatant,
          isSelf: isSelf,
          key: combatant.name,
          max: max
        }, stats));
      });

      return /*#__PURE__*/React.createElement("ul", {
        className: "combatants"
      }, rows);
    }
  }]);

  return Combatants;
}(React.Component);

var DamageMeter = /*#__PURE__*/function (_React$Component5) {
  _inherits(DamageMeter, _React$Component5);

  var _super5 = _createSuper(DamageMeter);

  function DamageMeter(props) {
    var _this6;

    _classCallCheck(this, DamageMeter);

    _this6 = _super5.call(this, props);
    _this6.state = {
      currentView: View.Damage
    };
    return _this6;
  }

  _createClass(DamageMeter, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      if (nextProps.data.Encounter.encdps === "---") {
        return false;
      }

      if (this.state.currentView !== nextState.currentView) {
        return true;
      }

      return true;
    }
  }, {
    key: "handleViewChange",
    value: function handleViewChange() {
      var views = Object.keys(View);
      var index = views.indexOf(this.state.currentView);
      this.setState({
        currentView: views[(index + 1) % views.length]
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _View$Damage$View$Hea3,
          _this7 = this;

      var encounter = this.props.data;
      var stat = (_View$Damage$View$Hea3 = {}, _defineProperty(_View$Damage$View$Hea3, View.Damage, "damage"), _defineProperty(_View$Damage$View$Hea3, View.Healing, "healed"), _defineProperty(_View$Damage$View$Hea3, View.Tanking, "damagetaken"), _defineProperty(_View$Damage$View$Hea3, View.Uptime, "uptime"), _defineProperty(_View$Damage$View$Hea3, View.Deaths, "deaths"), _View$Damage$View$Hea3)[this.state.currentView];
      var self = encounter.Combatant.YOU;

      var combatants = _.sortBy(_.filter(encounter.Combatant, function (d) {
        return parseInt(d[stat]) > 0;
      }), function (d) {
        return -parseInt(d[stat]);
      });

      return /*#__PURE__*/React.createElement("div", {
        className: "damage-meter"
      }, /*#__PURE__*/React.createElement(Header, {
        encounter: encounter.Encounter,
        history: this.props.history,
        self: self,
        onViewChange: function onViewChange() {
          return _this7.handleViewChange();
        },
        onSelectEncounter: this.props.onSelectEncounter,
        currentView: this.state.currentView
      }), /*#__PURE__*/React.createElement(Combatants, {
        currentView: this.state.currentView,
        combatants: combatants
      }), !options.debug ? null : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Debugger, {
        data: encounter
      })));
    }
  }]);

  return DamageMeter;
}(React.Component);

var Debugger = /*#__PURE__*/function (_React$Component6) {
  _inherits(Debugger, _React$Component6);

  var _super6 = _createSuper(Debugger);

  function Debugger(props) {
    _classCallCheck(this, Debugger);

    return _super6.call(this, props);
  }

  _createClass(Debugger, [{
    key: "render",
    value: function render() {
      var css = {
        overflowY: "scroll",
        maxHeight: "250px"
      };
      return /*#__PURE__*/React.createElement("pre", {
        style: css
      }, JSON.stringify(this.props.data, null, 2));
    }
  }]);

  return Debugger;
}(React.Component);

var App = /*#__PURE__*/function (_React$Component7) {
  _inherits(App, _React$Component7);

  var _super7 = _createSuper(App);

  function App(props) {
    var _this8;

    _classCallCheck(this, App);

    _this8 = _super7.call(this, props);
    _this8.state = {
      currentEncounter: null,
      history: [],
      selectedEncounter: null,
      actionTracking: {},
      serverTime: new Date(0)
    };
    return _this8;
  }

  _createClass(App, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this9 = this;

      document.addEventListener("onLogLine", function (e) {
        return _this9.onLogLine(e);
      });
      document.addEventListener("onOverlayDataUpdate", function (e) {
        return _this9.onOverlayDataUpdate(e);
      });
      document.addEventListener("onOverlayStateUpdate", function (e) {
        return _this9.onOverlayStateUpdate(e);
      });

      try {
        var stored = JSON.parse(localStorage.getItem(App.STORAGE_KEY));

        if (stored) {
          this.setState({
            currentEncounter: stored[0],
            history: stored
          });
        }
      } catch (ex) {
        console.error("Couldn't load state: ".concat(ex));
      }
    }
  }, {
    key: "onOverlayStateUpdate",
    value: function onOverlayStateUpdate(e) {
      if (!e.detail.isLocked) {
        document.documentElement.classList.add("resizable");
      } else {
        document.documentElement.classList.remove("resizable");
      }
    }
  }, {
    key: "onOverlayDataUpdate",
    value: function onOverlayDataUpdate(e) {
      var currentEncounter = e.detail;
      var history = this.state.history;
      var selectedEncounter = this.state.selectedEncounter;
      var actionTracking = this.state.actionTracking;

      var isActive = function isActive(enc) {
        return enc !== null && enc.isActive === "true";
      }; // Encounter started


      if (!isActive(this.state.currentEncounter) && isActive(currentEncounter)) {
        selectedEncounter = null;
        actionTracking = {};
      } // Mutates encounter


      this.embellish(currentEncounter, actionTracking); // Encounter ended

      if (isActive(this.state.currentEncounter) && !isActive(currentEncounter)) {
        history = [currentEncounter].concat(history).slice(0, 10);
        localStorage.setItem(App.STORAGE_KEY, JSON.stringify(history));
      }

      this.setState({
        currentEncounter: currentEncounter,
        history: history,
        selectedEncounter: selectedEncounter,
        actionTracking: actionTracking
      });
    }
  }, {
    key: "onLogLine",
    value: function onLogLine(e) {
      var _this10 = this;

      var _JSON$parse = JSON.parse(e.detail),
          _JSON$parse2 = _toArray(_JSON$parse),
          code = _JSON$parse2[0],
          timestamp = _JSON$parse2[1],
          message = _JSON$parse2.slice(2); // Sometimes the log lines go backwards in time, though I think this is
      // unlikely within a given code.


      var serverTime = Math.max(this.state.serverTime, new Date(timestamp));

      var getRecord = function getRecord(sourceName) {
        var _this10$state$actionT;

        return (_this10$state$actionT = _this10.state.actionTracking[sourceName]) !== null && _this10$state$actionT !== void 0 ? _this10$state$actionT : {
          castStart: null,
          lastCredit: new Date(0),
          uptime: 0
        };
      };

      var applyUpdate = function applyUpdate(sourceName, data) {
        return _this10.setState({
          serverTime: serverTime,
          actionTracking: fset(_this10.state.actionTracking, sourceName, data)
        });
      };

      if (code === "20") {
        // Start casting
        var _message = _slicedToArray(message, 2),
            _sourceID = _message[0],
            sourceName = _message[1];

        var data = fset(getRecord(sourceName), "castStart", serverTime);
        applyUpdate(sourceName, data);
      } else if (code === "23") {
        // Cancelled cast
        var _message2 = _slicedToArray(message, 2),
            _sourceID2 = _message2[0],
            _sourceName = _message2[1];

        var _data = fset(getRecord(_sourceName), "castStart", null);

        applyUpdate(_sourceName, _data);
      } else if (code === "21" || code === "22") {
        // Action used: if you were casting, you get credit for the duration of
        // that cast or `GCD`, whichever is greater. If you weren't casting, you
        // get `GCD` worth of uptime credited to you. In either case, if `GCD` has
        // not elapsed since your previous credit time, the next credit is reduced
        // so as not to double-credit. Example: if I use an action at time t then
        // another at t+1s, I would get 3.5s total uptime credit. This is a best
        // approximation with the information we have available.
        var _message3 = _slicedToArray(message, 2),
            _sourceID3 = _message3[0],
            _sourceName2 = _message3[1];

        var _getRecord = getRecord(_sourceName2),
            castStart = _getRecord.castStart,
            lastCredit = _getRecord.lastCredit,
            uptime = _getRecord.uptime;

        var wasCasting = castStart !== null;
        var uptimeCredit = wasCasting ? Math.max(GCD, serverTime - castStart) : GCD;
        var uptimeOvercredit = Math.max(0, GCD - (serverTime - lastCredit));
        applyUpdate(_sourceName2, {
          castStart: null,
          lastCredit: wasCasting ? castStart : serverTime,
          uptime: uptime + uptimeCredit - uptimeOvercredit
        });
      }
    }
  }, {
    key: "onSelectEncounter",
    value: function onSelectEncounter(index) {
      if (index >= 0) {
        this.setState({
          selectedEncounter: this.state.history[index]
        });
      } else {
        this.setState({
          selectedEncounter: null
        });
      }
    }
  }, {
    key: "embellish",
    value: function embellish(data, actionTracking) {
      // This won't work for "YOU" unless you specify your player name
      for (var name in data.Combatant) {
        var _actionTracking$sourc, _actionTracking$sourc2;

        var sourceName = formatName(name);
        var uptime = (_actionTracking$sourc = (_actionTracking$sourc2 = actionTracking[sourceName]) === null || _actionTracking$sourc2 === void 0 ? void 0 : _actionTracking$sourc2.uptime) !== null && _actionTracking$sourc !== void 0 ? _actionTracking$sourc : 0; // We're using ACT's notion of encounter here, which might trim downtime,
        // but that should be a good upper bound still.

        var encounterDuration = parseInt(data.Encounter.DURATION) * 1000;

        _.assign(data.Combatant[name], _defineProperty({
          uptime: uptime
        }, "uptime%", Math.min(1, uptime / encounterDuration)));
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this$state$selectedE,
          _this11 = this;

      return this.state.currentEncounter ? /*#__PURE__*/React.createElement(DamageMeter, {
        data: (_this$state$selectedE = this.state.selectedEncounter) !== null && _this$state$selectedE !== void 0 ? _this$state$selectedE : this.state.currentEncounter,
        history: this.state.history,
        onSelectEncounter: function onSelectEncounter(index) {
          return _this11.onSelectEncounter(index);
        }
      }) : /*#__PURE__*/React.createElement("h3", null, "Awaiting data.");
    }
  }]);

  return App;
}(React.Component);

_defineProperty(App, "STORAGE_KEY", "meters");

window.App = App;