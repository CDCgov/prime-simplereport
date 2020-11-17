import { useState } from "react";

// TODO: make some tests and get this from env
const IS_TEST_ENV = false;

// Global to track unique instance creations
let instanceCount = 0;

/**
 * @description Generate unique HTML IDs for elements
 * @returns Array of unique string IDs
 * @param testPrefix  Used in tests to prevent snapshot diffs
 * @param numberOfIds Number of unique IDs to return in array
 */
export default function useUniqueIds(testPrefix, numberOfIds) {
  const [instance, setInstance] = useState(0);

  if (!instance) {
    // Component is mounting, set our unique instance
    setInstance(++instanceCount);
  }

  return Array(numberOfIds)
    .fill("id-" + (IS_TEST_ENV ? testPrefix : instance || instanceCount) + "-")
    .map((prefix, i) => prefix + (i + 1));
}
