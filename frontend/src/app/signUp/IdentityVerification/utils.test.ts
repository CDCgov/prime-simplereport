import { getAnswerKey, toOptions, initAnswers } from "./utils";

describe("utils", () => {
  describe("getAnswerKey", () => {
    it("adds one to the index", () => {
      expect(getAnswerKey(0)).toContain("1");
    });
  });
  describe("toOptions", () => {
    const options = toOptions(["orange", "apple", "banana"]);
    it("creates the correct number of options", () => {
      expect(options.length).toBe(3);
    });
    it("correctly sets the first value", () => {
      expect(options[0].value).toBe("1");
    });
    it("correctly sets the second value", () => {
      expect(options[1].value).toBe("2");
    });
    it("correctly sets the third value", () => {
      expect(options[2].value).toBe("3");
    });
    it("correctly sets the first key", () => {
      expect(options[0].label).toBe("orange");
    });
    it("correctly sets the second key", () => {
      expect(options[1].label).toBe("apple");
    });
    it("correctly sets the third key", () => {
      expect(options[2].label).toBe("banana");
    });
  });
  describe("initAnswers", () => {
    const answers = initAnswers([{}, {}, {}] as Question[]);
    it("initializes the correct number of answers", () => {
      expect(Object.keys(answers).length).toBe(3);
    });
    it("sets the first answer to null", () => {
      expect(answers.outWalletAnswer1).toBeNull();
    });
    it("sets the second answer to null", () => {
      expect(answers.outWalletAnswer2).toBeNull();
    });
    it("sets the third answer to null", () => {
      expect(answers.outWalletAnswer3).toBeNull();
    });
  });
});
