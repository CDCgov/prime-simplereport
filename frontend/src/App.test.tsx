import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import createMockStore from "redux-mock-store";
import { Provider } from "react-redux";

import { App } from "./App";

jest.mock("./featureFlags/WithFeatureFlags", () => {
  return ({ children }: any): JSX.Element => <>{children}</>;
});

describe("index.js", () => {
  it("renders without crashing", async () => {
    const mockStore = createMockStore([]);
    const mockedStore = mockStore({});
    render(
      <Provider store={mockedStore}>
        <MockedProvider mocks={[]} addTypename={false}>
          <App />
        </MockedProvider>
      </Provider>
    );
    expect(await screen.findByText(/loading/i));
  });
});
