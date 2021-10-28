import TestResultDeliveryPreferences from "../patients/TestResultDeliveryPreferences";

import {
  toggleDeliveryPreferenceEmail,
  toggleDeliveryPreferenceSms,
  getSelectedDeliveryPreferencesSms,
  getSelectedDeliveryPreferencesEmail,
} from "./deliveryPreferences";

const { SMS, EMAIL, ALL, NONE } = TestResultDeliveryPreferences;

describe("Delivery preference utilities", () => {
  describe("toggleSmsDeliveryPreference", () => {
    let sut: Function;

    describe("Prior state: NONE", () => {
      beforeEach(() => {
        sut = toggleDeliveryPreferenceSms.bind(null, NONE);
      });

      it("returns SMS when SMS option selected", () => {
        expect(sut(SMS)).toBe(SMS);
      });
    });

    describe("Prior state: EMAIL", () => {
      beforeEach(() => {
        sut = toggleDeliveryPreferenceSms.bind(null, EMAIL);
      });

      it("returns EMAIL when NONE option selected", () => {
        expect(sut(NONE)).toBe(EMAIL);
      });

      it("returns ALL when SMS option selected", () => {
        expect(sut(SMS)).toBe(ALL);
      });
    });

    describe("Prior state: SMS", () => {
      beforeEach(() => {
        sut = toggleDeliveryPreferenceSms.bind(null, SMS);
      });

      it("returns NONE when NONE option selected", () => {
        expect(sut(NONE)).toBe(NONE);
      });

      it("returns ALL when EMAIL option selected", () => {
        expect(sut(EMAIL)).toBe(ALL);
      });
    });

    describe("Prior state: ALL", () => {
      beforeEach(() => {
        sut = toggleDeliveryPreferenceSms.bind(null, ALL);
      });

      it("returns NONE when NONE option selected", () => {
        expect(sut(NONE)).toBe(EMAIL);
      });
    });
  });

  describe("toggleEmailDeliveryPreference", () => {
    let sut: Function;

    describe("Prior state: NONE", () => {
      beforeEach(() => {
        sut = toggleDeliveryPreferenceEmail.bind(null, NONE);
      });

      it("returns SMS when SMS option selected", () => {
        expect(sut(EMAIL)).toBe(EMAIL);
      });
    });

    describe("Prior state: EMAIL", () => {
      beforeEach(() => {
        sut = toggleDeliveryPreferenceEmail.bind(null, EMAIL);
      });

      it("returns NONE when NONE option selected", () => {
        expect(sut(NONE)).toBe(NONE);
      });
    });

    describe("Prior state: SMS", () => {
      beforeEach(() => {
        sut = toggleDeliveryPreferenceEmail.bind(null, SMS);
      });

      it("returns ALL when EMAIL option selected", () => {
        expect(sut(EMAIL)).toBe(ALL);
      });

      it("returns SMS when NONE option selected", () => {
        expect(sut(NONE)).toBe(SMS);
      });
    });

    describe("Prior state: ALL", () => {
      beforeEach(() => {
        sut = toggleDeliveryPreferenceEmail.bind(null, ALL);
      });

      it("returns ALL when EMAIL option selected", () => {
        expect(sut(ALL)).toBe(ALL);
      });

      it("returns SMS when NONE option selected", () => {
        expect(sut(NONE)).toBe(SMS);
      });
    });
  });

  describe("getSelectedDeliveryPreferencesSms", () => {
    it("returns SMS if ALL delivery preferences are selected", () => {
      expect(getSelectedDeliveryPreferencesSms(ALL)).toBe(SMS);
    });

    it("returns SMS if SMS delivery preference is selected", () => {
      expect(getSelectedDeliveryPreferencesSms(SMS)).toBe(SMS);
    });

    it("returns NONE if NONE delivery preference is selected", () => {
      expect(getSelectedDeliveryPreferencesSms(NONE)).toBe(NONE);
    });

    it("returns NONE if EMAIL delivery preference is selected", () => {
      expect(getSelectedDeliveryPreferencesSms(EMAIL)).toBe(NONE);
    });
  });

  describe("getSelectedDeliveryPreferencesEmail", () => {
    it("returns EMAIL if ALL delivery preferences are selected", () => {
      expect(getSelectedDeliveryPreferencesEmail(ALL)).toBe(EMAIL);
    });

    it("returns EMAIL if EMAIL delivery preference is selected", () => {
      expect(getSelectedDeliveryPreferencesEmail(EMAIL)).toBe(EMAIL);
    });

    it("returns NONE if NONE delivery preference is selected", () => {
      expect(getSelectedDeliveryPreferencesEmail(NONE)).toBe(NONE);
    });

    it("returns NONE if SMS delivery preference is selected", () => {
      expect(getSelectedDeliveryPreferencesEmail(SMS)).toBe(NONE);
    });
  });
});
