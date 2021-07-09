import { VersionService } from "./VersionService";
import reload from "./utils/reload";

jest.mock("./utils/reload", () => jest.fn());

describe("VersionService", () => {
  beforeEach(() => {
    (reload as jest.Mock).mockReset();
  });

  describe("getSHA()", () => {
    it("", async () => {
      // GIVEN
      // WHEN
      const result = VersionService.getSHA();

      // THEN
      fail("Not yet implemented");
    });
  });

  describe("enforce", () => {
    it("", async () => {
      // GIVEN
      // WHEN
      VersionService.enforce();

      // THEN
      fail("Not yet implemented");
    });
  });
});
