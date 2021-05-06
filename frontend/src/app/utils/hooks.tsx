import React, { useEffect } from "react";

const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  onClickOutside: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (ev: MouseEvent) => {
      if (ref.current && !ref.current.contains(ev.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener<"mousedown">("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener<"mousedown">(
        "mousedown",
        handleClickOutside
      );
    };
    // eslint-disable-next-line
  }, [ref]);
};

export { useOutsideClick };
