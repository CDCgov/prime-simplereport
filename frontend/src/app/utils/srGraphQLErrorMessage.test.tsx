import { render, screen } from "@testing-library/react";

import { getBody, getHeader } from "./srGraphQLErrorMessage";

describe("getHeader", () => {
  test("returns default header message if header not found", () => {
    const message = "warning: results failed to upload; head: try again";
    expect(getHeader(message)).toBe("Something went wrong");
  });
  test("returns header message up to semicolon", () => {
    const message =
      "text: something failed header: check the logs; body: contact support";
    expect(getHeader(message)).toBe("check the logs");
  });
  test("returns header message ignores whitespace", () => {
    const message =
      "text: something failed header:  check the logs    ; body: contact support";
    expect(getHeader(message)).toBe("check the logs");
  });
  test("returns header message to the end of string if no semicolon", () => {
    const message =
      "body: something failed header:check the logs and contact support";
    expect(getHeader(message)).toBe("check the logs and contact support");
  });
  test("returns header message", () => {
    const message = "header:check the logs; body: something failed";
    expect(getHeader(message)).toBe("check the logs");
  });
});
describe("getBody", () => {
  test("returns the default body message if body not found", () => {
    const message =
      "warning: results failed to upload; body: try again; reason: did not work";
    render(getBody(message));
    expect(screen.getByText("try again")).toBeInTheDocument();
  });
  test("adds mailto anchor tag if there is support@simplereport.gov email in the body", () => {
    const message =
      "header: check the logs, body: Contact support@simplereport.gov for more information";
    expect(render(getBody(message))).toMatchSnapshot();
  });
  test("adds mailto anchor tag if there is support@simplereport.gov email in the body", () => {
    const message =
      "body: Contact support@simplereport.gov; reason: did not work";
    expect(render(getBody(message))).toMatchSnapshot();
  });
});
