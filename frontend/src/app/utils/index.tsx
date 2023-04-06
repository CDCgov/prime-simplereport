export const displayFullName = (
  first: string | null | undefined,
  middle: string | null | undefined,
  last: string | null | undefined,
  lastFirst = true
) => {
  if (lastFirst) {
    return `${last || "?"}, ${first || "?"} ${middle || ""}`
      .replace(/ +/g, " ")
      .trim();
  }
  return `${first || "?"} ${middle || ""} ${last || "?"}`.replace(/ +/g, " ");
};

export const facilityDisplayName = (
  name: String,
  isDeleted: boolean = false
) => {
  return `${name}${isDeleted ? " (Archived)" : ""}`;
};

export const isLocalHost = () =>
  Boolean(window.location.hostname === "localhost");

export const isEmptyString = (input = "") => {
  return Boolean(input.trim().length === 0);
};

// Given an array of strings, returns a copy of the array with falsy and
// duplicate values removed
export const dedupeAndCompactStrings = (strings: string[]) => {
  return strings.reduce(function dedupeAndCompact(acc: string[], curr: string) {
    if (curr && !acc.includes(curr)) {
      acc.push(curr);
    }

    return acc;
  }, []);
};
