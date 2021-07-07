import renderer from "react-test-renderer";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

import TermsOfService from "./TermsOfService";
import "../../i18n";

const mockStore = configureStore([]);

describe("TermsOfService", () => {
  it("snapshot", () => {
    const store = mockStore({
      plid: "foo",
    });
    const component = renderer.create(
      <Router history={createMemoryHistory()}>
        <Provider store={store}>
          <MockedProvider mocks={[]} addTypename={false}>
            <TermsOfService />
          </MockedProvider>
        </Provider>
      </Router>
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});
