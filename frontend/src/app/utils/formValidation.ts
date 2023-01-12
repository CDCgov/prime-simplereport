export const focusOnFirstInputWithError = (
  ignoreAriaHidden: boolean = false
) => {
  if (ignoreAriaHidden) {
    let elementsWithErrors = Array.from(
      document.querySelectorAll("[aria-invalid=true]")
    );
    (
      elementsWithErrors.find(
        (element) => element.getAttribute("aria-hidden") !== "true"
      ) as HTMLElement | null
    )?.focus();
  } else {
    let firstError = document.querySelector("[aria-invalid='true']");
    (firstError as HTMLElement)?.focus();
  }
};
