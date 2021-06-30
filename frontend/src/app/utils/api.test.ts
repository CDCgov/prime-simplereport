import { FetchMock } from "jest-fetch-mock/types";

import FetchClient from "./api";

describe("FetchClient", () => {
  let sut = new FetchClient("/");

  beforeEach(() => {
    process.env.REACT_APP_BACKEND_URL = "http://localhost:";
    (fetch as FetchMock).resetMocks();
  });

  it("getURL fails w/o an API URL in the env", () => {
    const existing = process.env.REACT_APP_BACKEND_URL;
    process.env.REACT_APP_BACKEND_URL = undefined;
    expect(() => {
      sut.getURL("some-path");
    }).toThrow();
    process.env.REACT_APP_BACKEND_URL = existing;
  });

  describe("POST", () => {
    it("throws when the request fails", async () => {
      const path = "some-path";
      (fetch as FetchMock).mockResponseOnce("", { status: 401 });
      try {
        await sut.request(path, {});
        fail("Failed to throw");
      } catch (e) {
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
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  it("GET throws when the request fails", async () => {
    const path = "some-path";
    (fetch as FetchMock).mockResponseOnce("", { status: 401 });
    try {
      await sut.getRequest(path);
      fail("Failed to throw");
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
});
