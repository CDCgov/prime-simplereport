import ReactDOM from "react-dom";

import { ReactApp, rootElement } from "./index";

jest.mock("react-dom", () => ({ render: jest.fn() }));

jest.mock("./featureFlags/WithFeatureFlags", () => {
  return ({ children }: any): JSX.Element => <>{children}</>;
});

describe("index.js", () => {
  it("renders without crashing", () => {
    ReactDOM.render(ReactApp, rootElement);
    expect(ReactDOM.render).toHaveBeenCalledWith(ReactApp, rootElement);
  });
});
