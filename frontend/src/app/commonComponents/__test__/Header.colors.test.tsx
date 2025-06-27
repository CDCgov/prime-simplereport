import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import createMockStore from "redux-mock-store";
import { MockedProvider } from "@apollo/client/testing";

import Header from "../Header";
import "../../../i18n";

const mockStore = createMockStore([]);
const store = mockStore({
  organization: { name: "Test Organization" },
  user: { firstName: "Test", lastName: "User", roleDescription: "Admin" },
  facilities: [{ id: "1", name: "Test Facility" }],
});

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Provider store={store}>
        <MockedProvider>
          <Header />
        </MockedProvider>
      </Provider>
    </MemoryRouter>
  );

describe("Header Visual Design System", () => {
  it("should match design system snapshot", () => {
    const { container } = renderHeader();

    expect(container.firstChild).toMatchSnapshot();
  });
});
