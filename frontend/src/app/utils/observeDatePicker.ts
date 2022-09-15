export const observeDatePicker = (
  querySelector: string,
  setState: (val: boolean) => void
) => {
  try {
    const targetNode = document.querySelector(querySelector);
    if (!targetNode) {
      // try to find the target again if the page hasn't finished loading.
      window.setTimeout(observeDatePicker, 500, querySelector, setState);
      return;
    }
    const config = {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ["hidden"],
    };

    const callback = (mutationList: MutationRecord[]) => {
      // if old value is empty string, hidden attribute has been removed. Calendar is now visible.
      // if old value is null, hidden attribute is being added. Calendar is now invisible.
      const isModalActive = mutationList.some(
        (m) =>
          m.type === "attributes" &&
          m.oldValue === "" &&
          m.attributeName === "hidden"
      );
      setState(isModalActive);
    };
    const observer = new MutationObserver(callback);
    observer.observe(targetNode as Node, config);
  } catch (e) {}
};
