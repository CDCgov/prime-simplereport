import moment from "moment";
import { FetchMock } from "jest-fetch-mock/types";

import { VersionService, LOCAL_STORAGE_KEY } from "./VersionService";
import reload from "./utils/reload";
import env from "./utils/getNodeEnv";

jest.mock("./utils/reload", () => jest.fn());
jest.mock("./utils/getNodeEnv", () => jest.fn());

describe("VersionService", () => {
  describe("with localStorage", () => {
    beforeEach(() => {
      (reload as jest.Mock).mockReset();
      (env as jest.Mock).mockReset();
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      (fetch as FetchMock).resetMocks();
    });

    describe("getSHA()", () => {
      it("returns the SHA from fetch in prod", async () => {
        // GIVEN
        const notSHA = "definitely not the sha";
        (env as jest.Mock).mockReturnValue("production");
        (fetch as FetchMock).mockResponseOnce(notSHA);

        // WHEN
        const result = await VersionService.getSHA();

        // THEN
        expect(fetch).toHaveBeenCalled();
        expect(result).toEqual(notSHA);
      });

      it("returns the SHA from env in pre-prod", async () => {
        // GIVEN
        const sha = "haha this is a sha for testing";
        import.meta.env.VITE_CURRENT_COMMIT = sha;

        // WHEN
        const result = await VersionService.getSHA();

        // THEN
        expect(result).toEqual(import.meta.env.VITE_CURRENT_COMMIT);
        expect(fetch).not.toHaveBeenCalled();
      });
    });

    describe("enforce", () => {
      it("calls reload if the SHAs don't match", async () => {
        // GIVEN
        const localSHA = "apples";
        const remoteSHA = "bananas";
        import.meta.env.VITE_CURRENT_COMMIT = localSHA;
        (env as jest.Mock).mockReturnValue("production");
        (fetch as FetchMock).mockResponseOnce(remoteSHA);

        // WHEN
        await VersionService.enforce();

        // THEN
        expect(fetch).toHaveBeenCalled();
        expect(reload).toHaveBeenCalled();
      });

      it("won't getSHA or reload we've reloaded too recently", async () => {
        // GIVEN
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(moment().subtract(14, "minutes").toDate())
        );
        const localSHA = "apples";
        const remoteSHA = "bananas";
        import.meta.env.VITE_CURRENT_COMMIT = localSHA;
        (env as jest.Mock).mockReturnValue("production");
        (fetch as FetchMock).mockResponseOnce(remoteSHA);

        // WHEN
        await VersionService.enforce();

        // THEN
        expect(fetch).not.toHaveBeenCalled();
        expect(reload).not.toHaveBeenCalled();
      });
    });
  });

  describe("without localStorage", () => {
    let originalLocalStorage: Storage;

    beforeAll(() => {
      originalLocalStorage = global.localStorage;
      Object.defineProperty(global, "localStorage", { value: undefined });
    });

    afterAll(() => {
      Object.defineProperty(global, "localStorage", {
        value: originalLocalStorage,
      });
    });

    it("doesn't do anything", async () => {
      // GIVEN
      const localSHA = "apples";
      import.meta.env.VITE_CURRENT_COMMIT = localSHA;
      (env as jest.Mock).mockReturnValue("production");

      // WHEN
      await VersionService.enforce();

      // THEN
      expect(fetch).not.toHaveBeenCalled();
      expect(reload).not.toHaveBeenCalled();
    });
  });
});
