import { useState, useEffect, useRef, LegacyRef } from "react";

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

  const handleClickOutside = (event: Event) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsComponentVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    document.addEventListener("focusin", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
      document.removeEventListener("focusin", handleClickOutside, true);
    };
  });
  return { ref, isComponentVisible, setIsComponentVisible };
};

export default useComponentVisible;
