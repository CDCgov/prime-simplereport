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
  const [isComponentVisible, setIsComponentVisible] = useState(
    initialIsVisible
  );
  const ref: LegacyRef<HTMLDivElement> | null = useRef(null);

  const handleClickOutside = (event: any) => {
    console.log(event);
    if (ref.current && !ref.current.contains(event.target)) {
      console.log("handling outside click");
      setIsComponentVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  });
  return { ref, isComponentVisible, setIsComponentVisible };
};

export default useComponentVisible;
