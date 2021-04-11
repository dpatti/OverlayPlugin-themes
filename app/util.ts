import _ from "lodash";
import { UIEvent, UIEventHandler } from "react";

type NonMethodKeys<T> = ({
  [P in keyof T]: T[P] extends Function ? never : P;
} & { [x: string]: never })[keyof T];

export type Struct<T> = Pick<T, NonMethodKeys<T>>;
export type Dict = { [key: string]: string };

export type Percent = number;
export type Span = number;

// helper to functionally set a key in an object by returning a new copy
export const fset = <A, B>(obj: A, extensions: B): A & B =>
  _.defaults(extensions, obj);

// Because TypeScript DOM types don't support CustomEvents by default
export const addEventListener = <T>(
  name: string,
  f: (_: CustomEvent<T>) => void
) => {
  document.addEventListener(name, f as EventListener);
};

export const noBubble = (f: UIEventHandler) => (e: UIEvent) => {
  e.stopPropagation();
  f(e);
};

export const parseQuery = <T>(f: (_: Dict) => T): T => {
  const search = document.location.search;
  const query: Dict = {};

  if (search[0] === "?") {
    search
      .slice(1)
      .split("&")
      .map((pair) => pair.split("="))
      .forEach(([k, v]) => {
        query[k] = v;
      });
  }

  return f(query);
};

declare global {
  interface DateConstructor {
    diff(a: Date, b: Date): Span;
    max(a: Date, b: Date): Date;
  }

  interface Date {
    add(t: Span): Date;
  }
}

Date.diff = (a: Date, b: Date): Span => a.getTime() - b.getTime();
Date.max = (a: Date, b: Date): Date => (a > b ? new Date(a) : new Date(b));
Date.prototype.add = function (t: Span): Date {
  return new Date(this.getTime() + t);
};

declare global {
  interface Map<K, V> {
    update(key: K, f: (_: V | null) => V | null): Map<K, V>;
    filter(f: (_: V | null) => boolean): Map<K, V>;
  }
}

// Functional updating for maps
Map.prototype.update = function (key, f) {
  const x = f(this.get(key));
  return new Map(this).set(key, x);
};

// Functional filtering for maps
Map.prototype.filter = function (f) {
  const m = new Map();
  for (const [key, value] of this) {
    if (f(value)) m.set(key, value);
  }
  return m;
};

declare global {
  interface Number {
    bound(min: number, max: number): number;
  }
}

Number.prototype.bound = function (min, max) {
  return Math.min(max, Math.max(min, this.valueOf()));
};
