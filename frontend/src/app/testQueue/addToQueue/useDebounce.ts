import { useState, useEffect } from "react";

type Options<T> = {
  debounceTime: number;
  runIf?: (value: T) => boolean;
};

export function useDebounce<T>(
  initialValue: T,
  { debounceTime, runIf }: Options<T>
): [T, T, React.Dispatch<T>] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (!runIf || runIf(value)) {
        setDebouncedValue(value);
      }
    }, debounceTime);
    return () => {
      clearTimeout(debounce);
    };
  }, [value, debounceTime, runIf]);

  return [debouncedValue, value, setValue];
}

export const useDebouncedEffect = (
  effect: () => void,
  deps: any[],
  delay: number
) => {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || []), delay]);
};
