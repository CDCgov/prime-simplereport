import { useState } from "react";

// Use predictable id values in snapshots
const IS_TEST = process.env.NODE_ENV === "test";

// Global to track unique instance creations
let instanceCount = 0;

/**
 * @description Generate unique HTML IDs for elements
 * @returns Array of unique string IDs
 * @param prefix  general identifier prefix
 * @param numberOfIds Number of unique IDs to return in array
 */
export default function useUniqueIds(prefix: string, numberOfIds: number) {
  const [instance, setInstance] = useState(0);

  if (!instance) {
    // Component is mounting, set our unique instance
    setInstance(++instanceCount);
  }

  return Array(numberOfIds)
    .fill(`${prefix}-${IS_TEST ? "test" : instance || instanceCount}-`)
    .map((prefix, i) => prefix + (i + 1));
}
