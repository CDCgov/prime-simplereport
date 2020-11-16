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
