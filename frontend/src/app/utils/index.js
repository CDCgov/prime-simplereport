export const displayFullName = (first, middle, last) => {
  return `${first || "?"} ${middle || ""} ${last || "?"}`.replace(/ +/g, " ");
};

export const isLocalHost = () =>
  Boolean(window.location.hostname === "localhost");

export const showNotification = (toast, children) => {
  // first, remove any toasts that are currently being rendered.
  // removing a toast takes an animation time. Default is ~500ms.
  toast.dismiss();

  // if there is an existing toast, it will be animating away while the new toast is added
  // this makes it ugly (try commenting out the setTimeout part
  // to prevent this, add a 500ms delay to all toasts
  // downside: there is a delay if there isn't an existing toast.
  setTimeout(() => {
    toast(children);
  }, 500);
};

const BASECOLOR = "#006699";
/**
 * given a guid for a user return a consistent pseudo-random color for them
 * The color is "close" to the base color.
 * @param userIdGuid {string}  guid format 'a1cbde06-6aab-58c9-8n21-7da5331efad1'
 * @param basecolor {string}   color format '#a1a1a1'
 * @returns {string}    color format '#a1a1a1'
 */
export const getStaffColor = (userIdGuid, basecolor = BASECOLOR) => {
  // no userid? just return base color
  if (userIdGuid.length === 0 || basecolor.length === 0) {
    return basecolor || BASECOLOR;
  }
  // helper functions for readability
  const rgbToHex = (r, g, b) =>
    "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

  const hexToRgb = (hex) =>
    hex
      .replace(
        /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
        (m, r, g, b) => "#" + r + r + g + g + b + b
      )
      .substring(1)
      .match(/.{2}/g)
      .map((x) => parseInt(x, 16));

  // guid parts: [timestamp-computerid-unique-fixed]
  const uniqueidstr = userIdGuid.split("-")[0];
  const rgbrnd = [
    parseInt(uniqueidstr.substr(0, 2), 16),
    parseInt(uniqueidstr.substr(2, 2), 16),
    parseInt(uniqueidstr.substr(4, 2), 16),
  ];
  // convert base color to RGB for proximity
  const rgb = hexToRgb(basecolor);
  const newrgb = rgb.map((c, ii) => Math.round((c + rgbrnd[ii]) / 2));
  const result = rgbToHex(newrgb[0], newrgb[1], newrgb[2]);
  console.log(`staff color is ${result} for id=${userIdGuid}`);
  return result;
};
