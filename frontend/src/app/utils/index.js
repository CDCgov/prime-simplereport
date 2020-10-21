export const displayFullName = (first, middle, last) => {
  return `${first} ${middle} ${last}`.replace(/ +/g, " ");
};

export const isLocalHost = () =>
  Boolean(window.location.hostname === "localhost");
