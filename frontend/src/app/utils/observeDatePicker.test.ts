import { observeDatePicker } from "./observeDatePicker";

describe("observe date picker", () => {
  describe("sets state", () => {
    const expectedSelector = '[testId="testId"]';
    let mockElement: HTMLDivElement;
    beforeEach(() => {
      mockElement = document.createElement("div");
    });

    it("to true when element found and hidden is changed to false", () => {
      mockElement.hidden = true;
      jest.spyOn(document, "querySelector").mockImplementation((selector) => {
        expect(selector).toEqual(expectedSelector);
        return mockElement;
      });

      observeDatePicker(expectedSelector, (val: boolean) => {
        expect(val).toEqual(true);
      });
      mockElement.hidden = false;
    });

    it("to false when element found and hidden added", () => {
      jest.spyOn(document, "querySelector").mockImplementation((selector) => {
        expect(selector).toEqual(expectedSelector);
        return mockElement;
      });

      observeDatePicker(expectedSelector, (val: boolean) => {
        expect(val).toEqual(false);
      });
      mockElement.hidden = true;
    });
  });
});
