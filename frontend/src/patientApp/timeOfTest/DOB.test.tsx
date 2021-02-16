import renderer from "react-test-renderer";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import DOB from "./DOB";

const mockStore = configureStore([]);

describe("DOB", () => {
  it("snapshot", () => {
    const store = mockStore({
      plid: "foo",
    });
    const component = renderer.create(
      <Provider store={store}>
        <MockedProvider mocks={[]} addTypename={false}>
          <DOB />
        </MockedProvider>
      </Provider>
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});
