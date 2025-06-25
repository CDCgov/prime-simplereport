import React, { useEffect, useRef, useReducer, useCallback } from "react";
import mergeWith from "lodash/mergeWith";

type PartialState<T> = {
  [P in keyof T]?: T[P] extends object ? PartialState<T[P]> : T[P];
};

const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  onClickOutside: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (ev: Event) => {
      if (ref.current && !ref.current.contains(ev.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener<"mousedown">("mousedown", handleClickOutside);
    document.addEventListener("focusin", handleClickOutside);
    return () => {
      document.removeEventListener<"mousedown">(
        "mousedown",
        handleClickOutside
      );
      document.removeEventListener("focusin", handleClickOutside);
    };
  }, [ref, onClickOutside]);
};

const useDocumentTitle = (title: string, retainOnUnmount = false) => {
  const defaultTitle = useRef<string>(document.title);

  useEffect(() => {
    document.title = title + " | SimpleReport";
  }, [title]);

  useEffect(() => {
    const defaultCurrentTitle = defaultTitle.current;

    return () => {
      if (!retainOnUnmount) {
        document.title = defaultCurrentTitle;
      }
    };
  }, [retainOnUnmount, title]);
};

function mergeWithCustomizer<T>(obj: unknown, src: unknown) {
  // disables deep merging for arrays
  return (Array.isArray(obj) ? src : undefined) as T;
}

function useMergeReducer<T extends object, A = any>(
  initialStateOrArg: T | A,
  init?: (arg: A) => T
) {
  const reducer = useCallback((state: T, patch: PartialState<T>) => {
    return mergeWith({}, state, patch, mergeWithCustomizer) as T;
  }, []);

  if (init) return useReducer(reducer, initialStateOrArg as A, init);
  return useReducer(reducer, initialStateOrArg as T);
}

export type { PartialState };
export { useOutsideClick, useDocumentTitle, useMergeReducer };
