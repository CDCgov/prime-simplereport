import React from "react";
import ReactDOM from "react-dom";

import { ReactApp, rootElement } from "./index";

jest.mock("react-dom", () => ({ render: jest.fn() }));
jest.mock("@microsoft/applicationinsights-react-js", () => ({
  withAITracking: (reactPlugin: any, Component: any) => <Component />,
  ReactPlugin: Object,
}));
describe("index.js", () => {
  it("renders without crashing", () => {
    ReactDOM.render(ReactApp, rootElement);
    expect(ReactDOM.render).toHaveBeenCalledWith(ReactApp, rootElement);
  });
});
