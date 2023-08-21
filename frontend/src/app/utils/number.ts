/**
 * Returns a number from a value typically appended to the url path
 * @param pageNumber a string or number
 * @returns number or undefined if NaN
 */
export const getNumberFromUrlPath = (pageNumber: string | number) => {
  if (typeof pageNumber === "string") {
    let parseIntVal = parseInt(pageNumber);
    return Number.isNaN(parseIntVal) ? undefined : parseIntVal;
  } else {
    return pageNumber;
  }
};
