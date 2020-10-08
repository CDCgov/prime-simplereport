export const displayFullName = (first, middle, last) => {
  return `${first} ${middle} ${last}`;
};

export const isLocalHost = () =>
  Boolean(window.location.hostname === "localhost");
