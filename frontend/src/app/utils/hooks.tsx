import React, { useEffect, useRef } from "react";

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

export { useOutsideClick, useDocumentTitle };
