import { isLocalHost } from "./serviceWorkerHelper";

describe("isLocalHost", () => {
  test("hostname - localhost", () => {
    const hostname = "localhost";
    expect(isLocalHost(hostname)).toBe(true);
  });
  test("hostname - IPv6 localhost address", () => {
    const hostname = "[::1]";
    expect(isLocalHost(hostname)).toBe(true);
  });
  test("hostname - IPv4 localhost address", () => {
    const hostname = "127.0.0.0";
    expect(isLocalHost(hostname)).toBe(true);
  });
  test("hostname - www.simplereport.gov ", () => {
    const hostname = "www.simplereport.gov";
    expect(isLocalHost(hostname)).toBe(false);
  });
  test("hostname - none provided", () => {
    // set window level host name
    window.location.hostname = "www.simplereport.gov";
    expect(isLocalHost()).toBe(false);
  });
  test("hostname - none provided", () => {
    // set window level host name
    window.location.hostname = "localhost";
    expect(isLocalHost()).toBe(true);
  });
});
