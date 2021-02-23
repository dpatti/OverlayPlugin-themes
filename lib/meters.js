"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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

/* global _ */
var LIMIT_BREAK = "Limit Break";
var YOU = "YOU";
var React = window.React;

var options = function (search) {
  var options = {};

  if (search[0] === "?") {
    search.slice(1).split(",").map(function (pair) {
      return pair.split("=");
    }).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          k = _ref2[0],
          v = _ref2[1];

      options[k] = v;
    });
  }

  return {
    you: options.you || YOU
  };
}(document.location.search);

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
  number = parseFloat(number, 10);

  if (number >= 1000000) {
    return (number / 1000000).toFixed(2) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(2) + "K";
  }

  return number.toFixed(2);
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
      var width = Math.min(100, parseInt(this.props.total / this.props.max * 100, 10)) + "%";
      return this.props.perSecond === "---" ? null : /*#__PURE__*/React.createElement("li", {
        className: "row " + this.props.actor + (this.props.isSelf ? " self" : ""),
        onClick: this.props.onClick
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
      }, this.props.totalFormatted), this.props.additional ? /*#__PURE__*/React.createElement("span", {
        className: "additional"
      }, "[", this.props.additional, "]") : null, "(", /*#__PURE__*/React.createElement("span", {
        className: "ps"
      }, this.props.perSecond, ","), /*#__PURE__*/React.createElement("span", {
        className: "percent"
      }, this.props.percentage), ")"), /*#__PURE__*/React.createElement("div", {
        className: "info"
      }, /*#__PURE__*/React.createElement("span", {
        className: "job-icon"
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

_defineProperty(CombatantCompact, "defaultProps", {
  onClick: function onClick() {}
});

var Header = /*#__PURE__*/function (_React$Component2) {
  _inherits(Header, _React$Component2);

  var _super2 = _createSuper(Header);

  function Header(props) {
    var _this;

    _classCallCheck(this, Header);

    _this = _super2.call(this, props);
    _this.state = {
      expanded: false,
      group: true,
      showEncountersList: false
    };
    return _this;
  }

  _createClass(Header, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      // Will need to add a null check here if we are swapping betwen self and group.
      // Possibly more null checks as well.
      if (nextProps.encounter.encdps === "---") {
        return false;
      }

      return true;
    }
  }, {
    key: "handleExtraDetails",
    value: function handleExtraDetails(e) {
      this.props.onExtraDetailsClick(e);
      this.setState({
        expanded: !this.state.expanded
      });
    } // Show dropdown for list of encounters

  }, {
    key: "handleEncounterClick",
    value: function handleEncounterClick() {
      this.setState({
        showEncountersList: !this.state.showEncountersList
      });
    } // Toggle between group and indidivual stats.

  }, {
    key: "handleToggleStats",
    value: function handleToggleStats() {
      this.setState({
        group: !this.state.group
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var data = this.props.data;
      var encounter = this.props.encounter;
      var self = data[YOU]; // This is the switcher for Toggling group info or self info

      var DataSource = this.state.group ? encounter : self;

      if (self == undefined) {
        DataSource = encounter;
      } // Calculate the direct hit % based off of the combatant list. This is not efficient and needs to be removed
      // Once the encounter object is fixed to properly include this info.


      var datalength = 0;
      var DirectHitPct = 0;
      var CritDirectHitPct = 0;

      if (this.state.group) {
        if (data !== undefined) {
          for (var x in data) {
            if (!Object.prototype.hasOwnProperty.call(data, x)) continue;
            DirectHitPct += parseFloat(data[x].DirectHitPct.substring(0, data[x].DirectHitPct.length - 1));
            CritDirectHitPct += parseFloat(data[x].CritDirectHitPct.substring(0, data[x].CritDirectHitPct.length - 1));
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

      var currentViewSummary = {
        Damage: "Damage (".concat(formatNumber(encounter.encdps), " dps)"),
        Healing: "Healing (".concat(formatNumber(encounter.enchps), " hps)"),
        Tanking: "Damage Taken"
      }[this.props.currentView];
      return /*#__PURE__*/React.createElement("div", {
        className: "header view-color ".concat(this.props.currentView.toLowerCase(), " ").concat(this.state.expanded ? "" : "collapsed")
      }, /*#__PURE__*/React.createElement("div", {
        className: "encounter-header"
      }, /*#__PURE__*/React.createElement("div", {
        className: "encounter-data ff-header"
      }, /*#__PURE__*/React.createElement("span", {
        className: "target-name dropdown-parent",
        onClick: this.handleEncounterClick.bind(this)
      }, formatEncounter(encounter), /*#__PURE__*/React.createElement("div", {
        className: "dropdown-menu encounters-list-dropdown ".concat(this.state.showEncountersList ? "" : "hidden")
      }, /*#__PURE__*/React.createElement("div", {
        className: "dropdown-menu-item",
        onClick: this.props.onSelectEncounter.bind(this, null)
      }, "Current Fight"), this.props.history.map(function (encounter, i) {
        return /*#__PURE__*/React.createElement("div", {
          key: i,
          className: "dropdown-menu-item",
          onClick: _this2.props.onSelectEncounter.bind(_this2, i)
        }, formatEncounter(encounter.Encounter));
      }))), /*#__PURE__*/React.createElement("span", {
        className: "arrow ".concat(this.state.expanded ? "up" : "down"),
        onClick: this.handleExtraDetails.bind(this)
      })), /*#__PURE__*/React.createElement("div", {
        className: "ff-header",
        style: {
          "float": "right",
          cursor: "pointer"
        },
        onClick: this.props.onViewChange
      }, currentViewSummary)), /*#__PURE__*/React.createElement("div", {
        className: "extra-details"
      }, this.props.currentView == "Damage" ? /*#__PURE__*/React.createElement("div", {
        className: "data-set-view-switcher clearfix",
        onClick: this.handleToggleStats.bind(this)
      }, /*#__PURE__*/React.createElement("span", {
        className: "data-set-option ".concat(this.state.group ? "active" : "")
      }, "G"), /*#__PURE__*/React.createElement("span", {
        className: "data-set-option ".concat(!this.state.group ? "active" : "")
      }, "I")) : null, /*#__PURE__*/React.createElement("div", {
        className: "extra-row damage"
      }, /*#__PURE__*/React.createElement("div", {
        className: "cell"
      }, /*#__PURE__*/React.createElement("span", {
        className: "label ff-header"
      }, "Damage"), /*#__PURE__*/React.createElement("span", {
        className: "value ff-text"
      }, "".concat(formatNumber(DataSource.damage), " (").concat(formatNumber(DataSource.encdps), ")"))), /*#__PURE__*/React.createElement("div", {
        className: "cell"
      }, /*#__PURE__*/React.createElement("span", {
        className: "label ff-header"
      }, "Max"), /*#__PURE__*/React.createElement("span", {
        className: "value ff-text"
      }, DataSource.maxhit))), /*#__PURE__*/React.createElement("div", {
        className: "extra-row damage"
      }, /*#__PURE__*/React.createElement("div", {
        className: "cell"
      }, /*#__PURE__*/React.createElement("span", {
        className: "label ff-header"
      }, "Crit%"), /*#__PURE__*/React.createElement("span", {
        className: "value ff-text"
      }, formatNumber(parseFloat(DataSource.crithits / DataSource.hits * 100)) + "%")), /*#__PURE__*/React.createElement("div", {
        className: "cell"
      }, /*#__PURE__*/React.createElement("span", {
        className: "label ff-header"
      }, "Misses"), /*#__PURE__*/React.createElement("span", {
        className: "value ff-text"
      }, encounter.misses)), /*#__PURE__*/React.createElement("div", {
        className: "cell"
      }, /*#__PURE__*/React.createElement("span", {
        className: "label ff-header"
      }, "Direct%"), /*#__PURE__*/React.createElement("span", {
        className: "value ff-text"
      }, formatNumber(DirectHitPct) + "%")), /*#__PURE__*/React.createElement("div", {
        className: "cell"
      }, /*#__PURE__*/React.createElement("span", {
        className: "label ff-header"
      }, "DirectCrit%"), /*#__PURE__*/React.createElement("span", {
        className: "value ff-text"
      }, formatNumber(CritDirectHitPct) + "%"))), /*#__PURE__*/React.createElement("div", {
        className: "extra-row healing"
      }, /*#__PURE__*/React.createElement("div", {
        className: "cell"
      }, /*#__PURE__*/React.createElement("span", {
        className: "label ff-header"
      }, "Heals"), /*#__PURE__*/React.createElement("span", {
        className: "value ff-text"
      }, "".concat(formatNumber(DataSource.healed), " (").concat(formatNumber(DataSource.enchps), ")"))), /*#__PURE__*/React.createElement("div", {
        className: "cell"
      }, /*#__PURE__*/React.createElement("span", {
        className: "label ff-header"
      }, "Crit%"), /*#__PURE__*/React.createElement("span", {
        className: "value ff-text"
      }, DataSource["critheal%"])), /*#__PURE__*/React.createElement("div", {
        className: "cell"
      }, /*#__PURE__*/React.createElement("span", {
        className: "label ff-header"
      }, "Max"), /*#__PURE__*/React.createElement("span", {
        className: "value ff-text"
      }, DataSource.maxheal)))));
    }
  }]);

  return Header;
}(React.Component);

_defineProperty(Header, "defaultProps", {
  encounter: {},
  onViewChange: function onViewChange() {},
  onSelectEncounter: function onSelectEncounter() {},
  onExtraDetailsClick: function onExtraDetailsClick() {}
});

var Combatants = /*#__PURE__*/function (_React$Component3) {
  _inherits(Combatants, _React$Component3);

  var _super3 = _createSuper(Combatants);

  function Combatants() {
    _classCallCheck(this, Combatants);

    return _super3.apply(this, arguments);
  }

  _createClass(Combatants, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      // if data is empty then don't re-render
      if (Object.getOwnPropertyNames(nextProps.data).length === 0) {
        return false;
      }

      return true;
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var maxRows = 12;
      var maxdps = false;

      var rows = _.take(this.props.data, maxRows).map(function (combatant, rank) {
        var stats;
        var isSelf = combatant.name === YOU || combatant.name === "You";
        var actor = combatant.name === LIMIT_BREAK ? "lb" : combatant.Job.toLowerCase();

        if (_this3.props.currentView === "Healing") {
          if (!maxdps) {
            maxdps = parseFloat(combatant.healed);
          }

          stats = {
            actor: actor,
            job: combatant.Job || "",
            characterName: combatant.name,
            total: combatant.healed,
            totalFormatted: formatNumber(combatant.healed),
            perSecond: formatNumber(combatant.enchps),
            additional: combatant["OverHealPct"],
            percentage: combatant["healed%"]
          };
        } else if (_this3.props.currentView === "Tanking") {
          if (!maxdps) {
            maxdps = parseFloat(combatant.damagetaken);
          }

          stats = {
            actor: actor,
            job: combatant.Job || "",
            characterName: combatant.name,
            total: combatant.damagetaken,
            totalFormatted: formatNumber(combatant.damagetaken),
            perSecond: combatant.ParryPct,
            percentage: combatant.BlockPct
          };
        } else {
          if (!maxdps) {
            maxdps = parseFloat(combatant.damage);
          }

          stats = {
            actor: actor,
            job: combatant.Job || "",
            characterName: combatant.name,
            total: combatant.damage,
            totalFormatted: formatNumber(combatant.damage),
            perSecond: formatNumber(combatant.encdps),
            percentage: combatant["damage%"]
          };
        }

        return /*#__PURE__*/React.createElement(CombatantCompact, _extends({
          onClick: _this3.props.onClick,
          encounterDamage: _this3.props.encounterDamage,
          rank: rank + 1,
          data: combatant,
          isSelf: isSelf,
          key: combatant.name,
          max: maxdps
        }, stats));
      });

      return /*#__PURE__*/React.createElement("ul", {
        className: "combatants"
      }, rows);
    }
  }]);

  return Combatants;
}(React.Component);

_defineProperty(Combatants, "defaultProps", {
  onClick: function onClick() {}
});

var DamageMeter = /*#__PURE__*/function (_React$Component4) {
  _inherits(DamageMeter, _React$Component4);

  var _super4 = _createSuper(DamageMeter);

  function DamageMeter(props) {
    var _this4;

    _classCallCheck(this, DamageMeter);

    _this4 = _super4.call(this, props);
    _this4.state = {
      currentViewIndex: 0
    };
    return _this4;
  }

  _createClass(DamageMeter, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      if (nextProps.parseData.Encounter.encdps === "---") {
        return false;
      }

      if (this.state.currentViewIndex !== nextState.currentViewIndex) {
        return true;
      }

      return true;
    }
  }, {
    key: "handleCombatRowClick",
    value: function handleCombatRowClick() {}
  }, {
    key: "handleViewChange",
    value: function handleViewChange() {
      var index = this.state.currentViewIndex;

      if (index > this.props.chartViews.length - 2) {
        index = 0;
      } else {
        index++;
      }

      this.setState({
        currentViewIndex: index
      });
    }
  }, {
    key: "render",
    value: function render() {
      var debug = false;
      var data, encounterData;

      if (this.props.selectedEncounter) {
        data = this.props.selectedEncounter.Combatant;
        encounterData = this.props.selectedEncounter.Encounter;
      } else {
        data = this.props.parseData.Combatant;
        encounterData = this.props.parseData.Encounter;
      }

      var stat = {
        0: "damage",
        1: "healed",
        2: "damagetaken"
      }[this.state.currentViewIndex];
      data = _.sortBy(_.filter(data, function (d) {
        return parseInt(d[stat]) > 0;
      }), function (d) {
        return -parseInt(d[stat]);
      });
      return /*#__PURE__*/React.createElement("div", {
        className: "damage-meter"
      }, /*#__PURE__*/React.createElement(Header, {
        encounter: encounterData,
        history: this.props.history,
        data: data,
        onViewChange: this.handleViewChange.bind(this),
        onSelectEncounter: this.props.onSelectEncounter,
        currentView: this.props.chartViews[this.state.currentViewIndex]
      }), /*#__PURE__*/React.createElement(Combatants, {
        currentView: this.props.chartViews[this.state.currentViewIndex],
        onClick: this.handleCombatRowClick,
        data: data,
        encounterDamage: encounterData.damage
      }), !debug ? null : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Debugger, {
        data: this.props.parseData
      })));
    }
  }]);

  return DamageMeter;
}(React.Component);

_defineProperty(DamageMeter, "defaultProps", {
  chartViews: ["Damage", "Healing", "Tanking"],
  parseData: {},
  noJobColors: false
});

var Debugger = /*#__PURE__*/function (_React$Component5) {
  _inherits(Debugger, _React$Component5);

  var _super5 = _createSuper(Debugger);

  function Debugger(props) {
    _classCallCheck(this, Debugger);

    return _super5.call(this, props);
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

var App = /*#__PURE__*/function (_React$Component6) {
  _inherits(App, _React$Component6);

  var _super6 = _createSuper(App);

  function App(props) {
    var _this5;

    _classCallCheck(this, App);

    _this5 = _super6.call(this, props);
    _this5.state = {
      parseData: null,
      history: [],
      selectedEncounter: null
    };
    return _this5;
  }

  _createClass(App, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      document.addEventListener("onOverlayDataUpdate", this.onOverlayDataUpdate.bind(this));
      document.addEventListener("onOverlayStateUpdate", this.onOverlayStateUpdate.bind(this));

      try {
        var stored = JSON.parse(localStorage.getItem(App.STORAGE_KEY));

        if (stored) {
          this.setState({
            parseData: stored[0],
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
      var _this$state$parseData, _this$state$parseData2;

      var parseData = e.detail;
      var history = this.state.history;
      var selectedEncounter = this.state.selectedEncounter; // Encounter started

      if (((_this$state$parseData = this.state.parseData) === null || _this$state$parseData === void 0 ? void 0 : _this$state$parseData.Encounter.title) !== "Encounter" && parseData.Encounter.title == "Encounter") {
        selectedEncounter = null;
      } // Encounter ended


      if (((_this$state$parseData2 = this.state.parseData) === null || _this$state$parseData2 === void 0 ? void 0 : _this$state$parseData2.Encounter.title) === "Encounter" && parseData.Encounter.title !== "Encounter") {
        history = [{
          Encounter: parseData.Encounter,
          Combatant: parseData.Combatant
        }].concat(history).slice(0, 10);
        localStorage.setItem(App.STORAGE_KEY, JSON.stringify(history));
      }

      this.setState({
        parseData: parseData,
        history: history,
        selectedEncounter: selectedEncounter
      });
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
    key: "render",
    value: function render() {
      var _this6 = this;

      return this.state.parseData ? /*#__PURE__*/React.createElement(DamageMeter, {
        parseData: this.state.parseData,
        history: this.state.history,
        selectedEncounter: this.state.selectedEncounter,
        onSelectEncounter: function onSelectEncounter(index) {
          return _this6.onSelectEncounter(index);
        }
      }) : /*#__PURE__*/React.createElement("h3", null, "Awaiting data.");
    }
  }]);

  return App;
}(React.Component);

_defineProperty(App, "STORAGE_KEY", "meters");

window.App = App;
