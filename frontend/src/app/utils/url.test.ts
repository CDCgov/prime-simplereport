import {
  stripIdTokenFromOktaRedirectUri,
  stripIdTokenFromOperationName,
} from "./url";

describe("stripIdTokenFromOktaRedirectUri", () => {
  it("empty text", () => {
    const text = "";
    expect(stripIdTokenFromOktaRedirectUri(text)).toBe("");
  });
  it("with no match", () => {
    const text = "localhost:3000/token_type=test";
    expect(stripIdTokenFromOktaRedirectUri(text)).toBe(text);
  });
  it("with url", () => {
    const text = "localhost:3000/#id_token=blahblahblah&token_type=test";
    expect(stripIdTokenFromOktaRedirectUri(text)).toBe(
      "localhost:3000/#id_token={ID-TOKEN-OBSCURED}&token_type=test"
    );
  });
});

describe("stripIdTokenFromOktaRedirectUri", () => {
  it("empty text", () => {
    const text = "";
    expect(stripIdTokenFromOperationName(text)).toBe("");
  });
  it("with no match", () => {
    const text = "/token_type=test";
    expect(stripIdTokenFromOperationName(text)).toBe(text);
  });
  it("with url", () => {
    const text = "/#id_token=blahblahblah";
    expect(stripIdTokenFromOperationName(text)).toBe(
      "/#id_token={ID-TOKEN-OBSCURED}"
    );
  });
});
