import {
  suggestionIsCloseEnough,
  isValidZipCodeForState,
  ZipCodeResult,
} from "./smartyStreets";

describe("smartStreets", () => {
  describe("smartyStreets.suggestionIsCloseEnough", () => {
    it("should not match substantial differences", () => {
      const original: Address = {
        street: "123 Wherever St",
        streetTwo: null,
        city: "Long Beach",
        state: "NY",
        zipCode: "11561",
      };
      const suggested: Address = {
        street: "456 Nowhere Pl",
        streetTwo: null,
        city: "Long Beach",
        state: "NY",
        zipCode: "11561",
      };
      expect(suggestionIsCloseEnough(original, suggested)).toBeFalsy();
    });

    it("should match zip codes with different last-fours", () => {
      const original: Address = {
        street: "123 Wherever St",
        streetTwo: null,
        city: "Long Beach",
        state: "NY",
        zipCode: "11561",
      };
      const suggested: Address = {
        ...original,
        zipCode: "11561-1234",
      };
      expect(suggestionIsCloseEnough(original, suggested)).toBeTruthy();
    });

    it("should match semantically same values with different capitalization", () => {
      const original: Address = {
        street: "123 WhErEvEr St",
        streetTwo: null,
        city: "LoNg BeAcH",
        state: "ny",
        zipCode: "11561",
      };
      const suggested: Address = {
        street: "123 Wherever St",
        streetTwo: null,
        city: "Long Beach",
        state: "NY",
        zipCode: "11561",
      };
      expect(suggestionIsCloseEnough(original, suggested)).toBeTruthy();
    });

    it("doesn't care about whitespace", () => {
      const original: Address = {
        street: "123WhereverSt",
        streetTwo: null,
        city: "LongBeach",
        state: "NY",
        zipCode: "11561",
      };
      const suggested: Address = {
        street: "123 Wherever St",
        streetTwo: null,
        city: "Long Beach",
        state: "NY",
        zipCode: "11561",
      };
      expect(suggestionIsCloseEnough(original, suggested)).toBeTruthy();
    });
  });

  describe("isValidZipCodeForState", () => {
    it("returns `true` on falsy input", () => {
      const result = undefined;

      const sut = isValidZipCodeForState("CA", result);

      expect(sut).toBe(true);
    });

    it("returns `false` if ZIP code is invalid", () => {
      const result: ZipCodeResult = {
        inputIndex: "0",
        valid: false,
        status: "invalid_zipcode",
        reason: "Invalid ZIP Code.",
        cities: [],
        zipcodes: [],
      };

      const sut = isValidZipCodeForState("CA", result);

      expect(sut).toBe(false);
    });

    it("returns `false` if ZIP code is not valid for state", () => {
      const result: ZipCodeResult = {
        inputIndex: "0",
        valid: true,
        cities: [
          {
            city: "Schenectady",
            stateAbbreviation: "NY",
            state: "New York",
            mailableCity: "true",
          },
        ],
        zipcodes: [
          {
            zipcode: "12345",
            zipcodeType: "U",
            defaultCity: "Schenectady",
            countyFips: "36093",
            countyName: "Schenectady",
            latitude: 42.82509,
            longitude: -73.87898,
            precision: "Zip5",
            stateAbbreviation: "NY",
            state: "New York",
            alternateCounties: [],
          },
        ],
      };

      const sut = isValidZipCodeForState("CA", result);

      expect(sut).toBe(false);
    });

    it("returns `true` if ZIP code is valid for state", () => {
      const result: ZipCodeResult = {
        inputIndex: "0",
        valid: true,
        cities: [
          {
            city: "Schenectady",
            stateAbbreviation: "NY",
            state: "New York",
            mailableCity: "true",
          },
        ],
        zipcodes: [
          {
            zipcode: "12345",
            zipcodeType: "U",
            defaultCity: "Schenectady",
            countyFips: "36093",
            countyName: "Schenectady",
            latitude: 42.82509,
            longitude: -73.87898,
            precision: "Zip5",
            stateAbbreviation: "NY",
            state: "New York",
            alternateCounties: [],
          },
        ],
      };

      const sut = isValidZipCodeForState("NY", result);

      expect(sut).toBe(true);
    });
  });
});
