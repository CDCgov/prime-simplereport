import getNodeEnv from "./getNodeEnv";

describe("getNodeEnv", () => {
  it("returns the node env", () => {
    expect(getNodeEnv()).toEqual(import.meta.env.MODE);
  });
});
