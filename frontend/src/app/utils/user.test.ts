import { formatFullName } from "./user";

describe("formatFullName", () => {
  test("empty user", () => {
    const user: any = {
      firstName: "",
      lastName: "",
      middleName: "",
      suffix: "",
    };
    expect(formatFullName(user)).toBe("");
  });
  test("user with only firstName", () => {
    const user: any = {
      firstName: "Kim",
      lastName: "",
      middleName: "",
      suffix: "",
    };
    expect(formatFullName(user)).toBe("Kim");
  });
  test("user with only middleName", () => {
    const user: any = {
      firstName: "",
      lastName: "",
      middleName: "Rebecca",
      suffix: "",
    };
    expect(formatFullName(user)).toBe(" Rebecca");
  });
  test("user with only lastName", () => {
    const user: any = {
      firstName: "",
      lastName: "Mendoza",
      middleName: "",
      suffix: "",
    };
    expect(formatFullName(user)).toBe(" Mendoza");
  });
  test("user no middle name", () => {
    const user: any = {
      firstName: "Kim",
      lastName: "Mendoza",
      middleName: "",
      suffix: "",
    };
    expect(formatFullName(user)).toBe("Kim Mendoza");
  });
  test("user full name", () => {
    const user: any = {
      firstName: "Kim",
      lastName: "Mendoza",
      middleName: "Rebecca",
      suffix: "",
    };
    expect(formatFullName(user)).toBe("Kim Rebecca Mendoza");
  });
  test("user full name and suffix", () => {
    const user: any = {
      firstName: "Kim",
      lastName: "Mendoza",
      middleName: "Rebecca",
      suffix: "PhD",
    };
    expect(formatFullName(user)).toBe("Kim Rebecca Mendoza, PhD");
  });
});
