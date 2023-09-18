import { render } from "@testing-library/react";
import "../../i18n";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import configureStore from "redux-mock-store";
import { configureAxe } from "jest-axe";

import Header from "./Header";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});
const mockStore = configureStore([]);
const store = mockStore({
  organization: {
    name: "Organization Name",
  },
  user: {
    firstName: "Kim",
    lastName: "Mendoza",
    roleDescription: "Admin user",
  },
  facilities: [
    { id: "1", name: "Facility One" },
    { id: "2", name: "Facility Two" },
  ],
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

describe("Header", () => {
  it("displays correctly", async () => {
    render(
      <Provider store={store}>
        <MockedProvider>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );
    expect(document.body).toMatchSnapshot();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
