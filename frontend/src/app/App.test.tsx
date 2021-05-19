import React from "react";
import renderer from "react-test-renderer";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";
import { MockedProvider } from "@apollo/client/testing";

import App, { WHOAMI_QUERY } from "./App";

jest.mock("uuid");
jest.mock("@microsoft/applicationinsights-react-js", () => ({
  ReactPlugin: jest.fn(),
}));

const mockStore = createMockStore([]);
const store = mockStore({});
const mocks = [
  {
    request: {
      query: WHOAMI_QUERY,
    },
    result: {
      data: {
        queue: [],
        organization: {
          testingFacility: [
            {
              id: "fec4de56-f4cc-4c61-b3d5-76869ca71296",
              deviceTypes: [
                {
                  internalId: "d70bb3b8-96bd-40d9-a3ce-b266a7edb91d",
                  name: "Quidel Sofia 2",
                  model: "Sofia 2 SARS Antigen FIA",
                  testLength: 15,
                },
                {
                  internalId: "5e44dcef-8cc6-44f4-a200-a5b8169ab60a",
                  name: "LumiraDX",
                  model: "LumiraDx SARS-CoV-2 Ag Test*",
                  testLength: 15,
                },
              ],
              defaultDeviceType: {
                internalId: "5e44dcef-8cc6-44f4-a200-a5b8169ab60a",
                name: "LumiraDX",
                model: "LumiraDx SARS-CoV-2 Ag Test*",
                testLength: 15,
              },
            },
          ],
        },
      },
    },
  },
];
describe("TestResultInputForm", () => {
  it("should render without error", () => {
    const component = renderer.create(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Provider store={store}>
          <App />
        </Provider>
      </MockedProvider>
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
