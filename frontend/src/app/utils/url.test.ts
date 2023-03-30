import {
  stripIdTokenFromOktaRedirectUri,
  stripIdTokenFromMatchUntilEndOfString,
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
      "localhost:3000/#id_token={ID-TOKEN-OBSCURED}token_type=test"
    );
  });
  it("with prod url", () => {
    const text =
      "https://www.simplereport.gov/app/#id_token=sometokenstuff&token_type=Bearer&expires_in=3600&scope=simple_report_prod+openid+simple_report&state=thisisbogus";
    expect(stripIdTokenFromOktaRedirectUri(text)).toBe(
      "https://www.simplereport.gov/app/#id_token={ID-TOKEN-OBSCURED}token_type=Bearer&expires_in=3600&scope=simple_report_prod+openid+simple_report&state=thisisbogus"
    );
  });
});

describe("stripIdTokenFromOktaRedirectUri", () => {
  it("empty text", () => {
    const text = "";
    expect(stripIdTokenFromMatchUntilEndOfString(text)).toBe("");
  });
  it("with no match", () => {
    const text = "/token_type=test";
    expect(stripIdTokenFromMatchUntilEndOfString(text)).toBe(text);
  });
  it("with url", () => {
    const text = "/#id_token=blahblahblah";
    expect(stripIdTokenFromMatchUntilEndOfString(text)).toBe(
      "/#id_token={ID-TOKEN-OBSCURED}"
    );
  });
  it("with prod url", () => {
    const text =
      "https://www.simplereport.gov/app/#id_token=blahblahblah&access_token=anothertoken";
    expect(stripIdTokenFromMatchUntilEndOfString(text)).toBe(
      "https://www.simplereport.gov/app/#id_token={ID-TOKEN-OBSCURED}"
    );
  });
});
