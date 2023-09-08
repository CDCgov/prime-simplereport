import { useState, useRef, LegacyRef } from "react";

import { useOutsideClick } from "../utils/hooks";

/**
 * Dismiss div when click happens outside of it.
 * use like
 * const {
    ref: staffDefailsRef,
    isComponentVisible: staffDetailsVisible,
    setIsComponentVisible: setStaffDetailsVisible,
  } = useComponentVisible(false);
 *
 */

const useComponentVisible = (initialIsVisible: boolean) => {
  const [isComponentVisible, setIsComponentVisible] =
    useState(initialIsVisible);
  const ref: LegacyRef<HTMLDivElement> | null = useRef(null);

  useOutsideClick(ref, () => setIsComponentVisible(false));
  return { ref, isComponentVisible, setIsComponentVisible };
};

export default useComponentVisible;
