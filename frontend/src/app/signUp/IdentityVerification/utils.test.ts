import {
  getAnswerKey,
  toOptions,
  initAnswers,
  answersToArray,
  isValidBirthdate,
  personalDetailsSchema,
} from "./utils";

describe("utils", () => {
  describe("getAnswerKey", () => {
    it("adds one to the index", () => {
      expect(getAnswerKey(0)).toContain("answer1");
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
      expect(answers["answer1"]).toBeNull();
    });
    it("sets the second answer to null", () => {
      expect(answers["answer2"]).toBeNull();
    });
    it("sets the third answer to null", () => {
      expect(answers["answer3"]).toBeNull();
    });
  });
  describe("answersToArray", () => {
    const answers: Answers = {
      answer3: "5",
      answer1: "2",
      answer2: "3",
    };
    const answersArray = answersToArray(answers);
    it("correctly sets the first value", () => {
      expect(answersArray[0]).toBe(parseInt(answers["answer1"]));
    });
    it("correctly sets the second value", () => {
      expect(answersArray[1]).toBe(parseInt(answers["answer2"]));
    });
    it("correctly sets the third value", () => {
      expect(answersArray[2]).toBe(parseInt(answers["answer3"]));
    });
  });
  describe("isValidBirthdate", () => {
    it("finds a date before 1900 invalid", () => {
      expect(isValidBirthdate("1872-08-07")).toBe(false);
    });
    it("finds a date after today invalid", () => {
      expect(isValidBirthdate("2172-08-07")).toBe(false);
    });
    it("finds 1/2 invalid", () => {
      expect(isValidBirthdate("196-01-02")).toBe(false);
    });
    it("finds 13/13/2000 invalid", () => {
      expect(isValidBirthdate("2000-13-13")).toBe(false);
    });
    it("finds 10/31/1957 valid", () => {
      expect(isValidBirthdate("1957-10-31")).toBe(true);
    });
  });
  describe("schema validation", () => {
    let person: IdentityVerificationRequest;
    beforeEach(() => {
      person = {
        firstName: "Emmi",
        lastName: "Felipinho",
        dateOfBirth: "01/02/2003",
        email: "emmi@example.com",
        phoneNumber: "313-555-1234",
        streetAddress1: "123 D'onte rd",
        streetAddress2: "Bldg #4 Apt. # 5",
        city: "Akiachak",
        state: "AK",
        zip: "99551",
        orgExternalId: "9999",
      };
    });
    it("should be a valid person", async () => {
      const validatedPerson = await personalDetailsSchema.validate(person);
      expect(validatedPerson).toEqual(person);
    });
    it("should be invalid street address", async () => {
      person.streetAddress1 = "000 + main st";
      await expect(personalDetailsSchema.validate(person)).rejects.toThrow(
        "A valid street address is required"
      );
    });
    it("should be invalid street address", async () => {
      person.streetAddress2 = "Bldg#4, APT. #5";
      await expect(personalDetailsSchema.validate(person)).rejects.toThrow(
        "Street 2 contains invalid symbols"
      );
    });
  });
});
