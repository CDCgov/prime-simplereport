import ReactDOM from "react-dom";

import { ReactApp, rootElement } from "./index";

jest.mock("react-dom", () => ({ render: jest.fn() }));

describe("index.js", () => {
  it("renders without crashing", () => {
    ReactDOM.render(ReactApp, rootElement);
    expect(ReactDOM.render).toHaveBeenCalledWith(ReactApp, rootElement);
  });
});
