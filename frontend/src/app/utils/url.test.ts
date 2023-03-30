import { stripIdTokenFromString } from "./url";

describe("stripIdTokenFromOktaRedirectUri", () => {
  it("empty text", () => {
    const text = "";
    expect(stripIdTokenFromString(text)).toBe("");
  });
  it("with no match", () => {
    const text = "localhost:3000/token_type=test";
    expect(stripIdTokenFromString(text)).toBe(text);
  });
  it("with url", () => {
    const text = "localhost:3000/#id_token=blahblahblah&token_type=test";
    expect(stripIdTokenFromString(text)).toBe(
      "localhost:3000/#id_token={ID-TOKEN-OBSCURED}&token_type=test"
    );
  });
});

describe("stripIdTokenFromOktaRedirectUri", () => {
  it("empty text", () => {
    const text = "";
    expect(stripIdTokenFromString(text)).toBe("");
  });
  it("with no match", () => {
    const text = "/token_type=test";
    expect(stripIdTokenFromString(text)).toBe(text);
  });
  it("with url", () => {
    const text = "/#id_token=blahblahblah";
    expect(stripIdTokenFromString(text)).toBe("/#id_token={ID-TOKEN-OBSCURED}");
  });
});
