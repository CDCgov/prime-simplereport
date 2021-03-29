import { formatAddress } from "./address";

describe("formatAddress", () => {
  test("empty address", () => {
    const address = {
      street: "",
      streetTwo: "",
      city: "",
      state: "",
      county: "",
      zipCode: "",
    };
    expect(formatAddress(address)).toBe("");
  });
  test("with only street", () => {
    const address = {
      street: "123 Green Street",
      streetTwo: "",
      city: "",
      state: "",
      county: "",
      zipCode: "",
    };
    expect(formatAddress(address)).toBe("123 Green Street");
  });
  test("with street and streetTwo", () => {
    const address = {
      street: "123 Green Street",
      streetTwo: "APT 1",
      city: "",
      state: "",
      county: "",
      zipCode: "",
    };
    expect(formatAddress(address)).toBe("123 Green Street\nAPT 1");
  });
  test("with street, streetTwo, and city", () => {
    const address = {
      street: "123 Green Street",
      streetTwo: "APT 1",
      city: "New City",
      state: "",
      county: "",
      zipCode: "",
    };
    expect(formatAddress(address)).toBe("123 Green Street\nAPT 1\nNew City");
  });
  test("street2 is null", () => {
    const address = {
      street: "123 Green Street",
      streetTwo: null,
      city: "New City",
      state: "",
      county: "",
      zipCode: "",
    };
    expect(formatAddress(address)).toBe("123 Green Street\nNew City");
  });
  test("with street, streetTwo, city, and state", () => {
    const address = {
      street: "123 Green Street",
      streetTwo: "APT 1",
      city: "New City",
      state: "NC",
      county: "",
      zipCode: "",
    };
    expect(formatAddress(address)).toBe(
      "123 Green Street\nAPT 1\nNew City, NC"
    );
  });
  test("with complete address", () => {
    const address = {
      street: "123 Green Street",
      streetTwo: "APT 1",
      city: "New City",
      state: "NC",
      county: "County",
      zipCode: "00700",
    };
    expect(formatAddress(address)).toBe(
      "123 Green Street\nAPT 1\nNew City, NC 00700"
    );
  });
  test("with no state", () => {
    const address = {
      street: "123 Green Street",
      streetTwo: "APT 1",
      city: "New City",
      state: "",
      county: "",
      zipCode: "00700",
    };
    expect(formatAddress(address)).toBe(
      "123 Green Street\nAPT 1\nNew City 00700"
    );
  });
  test("with no city", () => {
    const address = {
      street: "123 Green Street",
      streetTwo: "APT 1",
      city: "",
      state: "NC",
      county: "",
      zipCode: "00700",
    };
    expect(formatAddress(address)).toBe("123 Green Street\nAPT 1\nNC 00700");
  });
  test("with no streetTwo", () => {
    const address = {
      street: "123 Green Street",
      streetTwo: "",
      city: "New City",
      state: "NC",
      county: "",
      zipCode: "00700",
    };
    expect(formatAddress(address)).toBe("123 Green Street\nNew City, NC 00700");
  });
  test("with no street", () => {
    const address = {
      street: "",
      streetTwo: "APT 1",
      city: "New City",
      state: "NC",
      county: "",
      zipCode: "00700",
    };
    expect(formatAddress(address)).toBe("APT 1\nNew City, NC 00700");
  });
  test("with only city, state, zipCode", () => {
    const address = {
      street: "",
      streetTwo: "",
      city: "New City",
      state: "NC",
      county: "",
      zipCode: "00700",
    };
    expect(formatAddress(address)).toBe("New City, NC 00700");
  });
  test("with only city and state", () => {
    const address = {
      street: "",
      streetTwo: "",
      city: "New City",
      state: "NC",
      county: "",
      zipCode: "",
    };
    expect(formatAddress(address)).toBe("New City, NC");
  });
  test("with only city and zipCode", () => {
    const address = {
      street: "",
      streetTwo: "",
      city: "New City",
      state: "",
      county: "",
      zipCode: "00700",
    };
    expect(formatAddress(address)).toBe("New City 00700");
  });
  test("with only state and zipCode", () => {
    const address = {
      street: "",
      streetTwo: "",
      city: "",
      state: "NC",
      county: "",
      zipCode: "00700",
    };
    expect(formatAddress(address)).toBe("NC 00700");
  });
  test("with only streetTwo", () => {
    const address = {
      street: "",
      streetTwo: "APT 1",
      city: "",
      state: "",
      county: "",
      zipCode: "",
    };
    expect(formatAddress(address)).toBe("APT 1");
  });
  test("with only city", () => {
    const address = {
      street: "",
      streetTwo: "",
      city: "New City",
      state: "",
      county: "",
      zipCode: "",
    };
    expect(formatAddress(address)).toBe("New City");
  });
  test("with only state", () => {
    const address = {
      street: "",
      streetTwo: "",
      city: "",
      state: "NC",
      county: "",
      zipCode: "",
    };
    expect(formatAddress(address)).toBe("NC");
  });
  test("with only zipCode", () => {
    const address = {
      street: "",
      streetTwo: "",
      city: "",
      state: "",
      county: "",
      zipCode: "00700",
    };
    expect(formatAddress(address)).toBe("00700");
  });
});
