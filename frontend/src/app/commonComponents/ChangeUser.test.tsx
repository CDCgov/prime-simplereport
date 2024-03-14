import { render, screen } from "@testing-library/react";

import ChangeUser from "./ChangeUser";

describe("ChangeUser", () => {
  it("renders nothing", () => {
    render(<ChangeUser />);
    expect(
      screen.queryByText("Login as", { exact: false })
    ).not.toBeInTheDocument();
  });

  describe("when in development", () => {
    const OLD_ENV = process.env;
    beforeAll(() => {
      jest.resetModules(); // Most important - it clears the cache
      process.env = { ...OLD_ENV }; // Make a copy
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "development",
        configurable: true,
        writable: true,
      });
    });
    afterAll(() => {
      process.env = OLD_ENV; // Restore old environment
    });
    it("renders 4 login links", () => {
      render(<ChangeUser />);
      expect(screen.getAllByText("Login as", { exact: false }).length).toBe(4);
    });
  });
});
