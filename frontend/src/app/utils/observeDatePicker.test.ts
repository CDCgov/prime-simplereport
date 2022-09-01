import { observeDatePicker } from "./observeDatePicker";

describe("observe date picker", () => {
  describe("sets state", () => {
    const expectedSelector = '[testId="testId"]';
    let mockElement: HTMLDivElement;
    beforeEach(() => {
      mockElement = document.createElement("div");
      jest.clearAllMocks();
    });

    it("to true when element found and hidden is changed to false", async () => {
      mockElement.hidden = true;
      jest.spyOn(document, "querySelector").mockImplementation((selector) => {
        expect(selector).toEqual(expectedSelector);
        return mockElement;
      });

      let mutationObserverCallCounter = 0;
      observeDatePicker(expectedSelector, (val: boolean) => {
        expect(val).toEqual(true);
        mutationObserverCallCounter++;
      });
      mockElement.hidden = false;

      // need to wait for the counter to be set
      await new Promise((res) => setTimeout(res));
      expect(document.querySelector).toBeCalledWith(expectedSelector);
      expect(document.querySelector).toBeCalledTimes(1);
      expect(mutationObserverCallCounter).toEqual(1);
    });

    it("to false when element found and hidden added", async () => {
      jest.spyOn(document, "querySelector").mockImplementation((selector) => {
        expect(selector).toEqual(expectedSelector);
        return mockElement;
      });

      let mutationObserverCallCounter = 0;
      observeDatePicker(expectedSelector, (val: boolean) => {
        expect(val).toEqual(false);
        mutationObserverCallCounter++;
      });
      mockElement.hidden = true;

      // need to wait for the counter to be set
      await new Promise((res) => setTimeout(res));
      expect(document.querySelector).toBeCalledWith(expectedSelector);
      expect(document.querySelector).toBeCalledTimes(1);
      expect(mutationObserverCallCounter).toEqual(1);
    });
  });
  it("re runs when element not found", () => {
    jest.spyOn(document, "querySelector").mockImplementation((selector) => {
      expect(selector).toEqual("something");
      return null;
    });
    jest.spyOn(window, "setTimeout");

    const stateFunc = (val: boolean) => val;
    observeDatePicker("something", stateFunc);

    expect(window.setTimeout).toBeCalledWith(
      observeDatePicker,
      500,
      "something",
      stateFunc
    );
  });
});
