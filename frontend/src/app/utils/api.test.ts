import { FetchMock } from "jest-fetch-mock/types";

import FetchClient from "./api";

describe("FetchClient", () => {
  let sut: FetchClient;

  beforeEach(() => {
    sut = new FetchClient("/");
    process.env.VITE_BACKEND_URL = "http://localhost:";
    (fetch as FetchMock).resetMocks();
  });

  it("getURL fails w/o an API URL in the env", () => {
    const existing = process.env.VITE_BACKEND_URL;
    process.env.VITE_BACKEND_URL = undefined;
    expect(() => {
      sut.getURL("some-path");
    }).toThrow();
    process.env.VITE_BACKEND_URL = existing;
  });

  it("getURL works as expected", () => {
    const existing = process.env.VITE_BACKEND_URL;
    process.env.VITE_BACKEND_URL = "https://simplereport.gov/api";
    sut = new FetchClient("pxp");
    expect(sut.getURL("some-path")).toEqual(
      "https://simplereport.gov/api/pxp/some-path"
    );
    process.env.VITE_BACKEND_URL = existing;
  });

  describe("POST", () => {
    it("throws when the request fails", async () => {
      const path = "some-path";
      (fetch as FetchMock).mockResponseOnce("", { status: 401 });
      try {
        await sut.request(path, {});
        fail("Failed to throw");
      } catch (e: any) {
        expect(e).toBeDefined();
      }
    });

    it("parses JSON", async () => {
      const path = "some-path";
      const mockResponse = { fruit: "apple" };
      (fetch as FetchMock).mockResponseOnce(JSON.stringify(mockResponse), {
        headers: { "Content-type": "application/json" },
      });
      const result = await sut.request(path, {});
      expect(result.fruit).toBe("apple");
    });

    it("throws on invalid JSON", async () => {
      const path = "some-path";
      const mockResponse = "not-json-at-all";
      (fetch as FetchMock).mockResponseOnce(mockResponse, {
        headers: { "Content-type": "application/json" },
      });
      try {
        await sut.request(path, {});
        fail("Failed to throw");
      } catch (e: any) {
        expect(e).toBeDefined();
      }
    });

    it("redirects to session timeout on session error", async () => {
      // jest doesn't allow navigation changes, so we mock the window location
      const mockResponse = jest.fn();
      Object.defineProperty(window, "location", {
        value: {
          hash: {
            endsWith: mockResponse,
            includes: mockResponse,
          },
          assign: mockResponse,
        },
        writable: true,
      });
      const path = "some-path";
      (fetch as FetchMock).mockResponseOnce("Session timeout", { status: 410 });
      try {
        await sut.request(path, {});
        fail("Failed to throw");
      } catch (e) {
        expect(e).toBeDefined();
        expect(window.location.href).toContain("session-timeout");
      }
    });
  });

  it("GET throws when the request fails", async () => {
    const path = "some-path";
    (fetch as FetchMock).mockResponseOnce("", { status: 401 });
    try {
      await sut.getRequest(path);
      fail("Failed to throw");
    } catch (e: any) {
      expect(e).toBeDefined();
    }
  });
});
