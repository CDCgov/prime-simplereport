import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import createMockStore from "redux-mock-store";
import { Provider } from "react-redux";

import { ReactApp } from "./App";

jest.mock("./featureFlags/WithFeatureFlags", () => {
  return ({ children }: any): JSX.Element => <>{children}</>;
});

describe("App Component", () => {
  it("renders without crashing", async () => {
    const mockStore = createMockStore([]);
    const mockedStore = mockStore({});
    render(
      <Provider store={mockedStore}>
        <MockedProvider mocks={[]} addTypename={false}>
          <ReactApp />
        </MockedProvider>
      </Provider>
    );
    expect(await screen.findByText(/loading/i));
  });
});
