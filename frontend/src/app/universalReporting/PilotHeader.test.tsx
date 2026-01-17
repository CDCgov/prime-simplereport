import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../i18n";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import configureStore from "redux-mock-store";
import { configureAxe } from "jest-axe";

import { appPermissions } from "../permissions";

import PilotHeader from "./PilotHeader";

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
    permissions: appPermissions.tests.canView,
  },
  facilities: [
    { id: "1", name: "Facility One" },
    { id: "2", name: "Facility Two" },
  ],
});

jest.mock("../TelemetryService", () => ({
  getAppInsights: () => ({
    trackEvent: jest.fn(),
  }),
}));

describe("PilotHeader", () => {
  const renderPilotHeader = () => {
    return render(
      <Provider store={store}>
        <MockedProvider>
          <MemoryRouter>
            <PilotHeader />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );
  };

  it("displays correctly", async () => {
    const { container } = renderPilotHeader();
    expect(container).toMatchSnapshot();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("displays user info", async () => {
    const user = userEvent.setup();
    renderPilotHeader();
    await user.click(screen.getByTestId("desktop-user-button"));
    const userMenu = await screen.findByLabelText("Account navigation");
    expect(within(userMenu).getByText("Kim Mendoza")).toBeInTheDocument();
    expect(within(userMenu).getByText("Admin")).toBeInTheDocument();
  });

  it("toggles mobile menu", async () => {
    const user = userEvent.setup();
    renderPilotHeader();
    const menuButton = screen.getByRole("button", { name: "Menu" });
    await user.click(menuButton);
    expect(screen.getByLabelText("Primary mobile navigation")).toHaveClass(
      "is-visible"
    );
    const closeButton = screen.getByTitle("close menu");
    await user.click(closeButton);
    expect(screen.getByLabelText("Primary mobile navigation")).not.toHaveClass(
      "is-visible"
    );
  });

  it("navigates to home on logo click", () => {
    renderPilotHeader();
    expect(screen.getByTitle("Home")).toHaveAttribute("href", "/pilot/report");
  });

  it("displays the report lab results link", () => {
    renderPilotHeader();
    const desktopNav = screen.getByLabelText("Primary desktop navigation");
    expect(
      within(desktopNav).getByText("Report lab results")
    ).toBeInTheDocument();
  });

  it("displays settings link in mobile", async () => {
    const user = userEvent.setup();
    renderPilotHeader();
    const menuButton = screen.getByRole("button", { name: "Menu" });
    await user.click(menuButton);
    expect(screen.getByTestId("mobile-settings-button")).toBeInTheDocument();
  });

  it("displays support link", async () => {
    const user = userEvent.setup();
    renderPilotHeader();
    await user.click(screen.getByTestId("desktop-user-button"));
    await screen.findByLabelText("Account navigation");
    const supportLink = screen.getByTestId("desktop-support-link");
    expect(supportLink).toBeInTheDocument();
    await user.click(supportLink);
  });

  it("logs out user", async () => {
    const user = userEvent.setup();
    const originalLocation = window.location;
    // @ts-ignore
    delete window.location;
    window.location = {
      ...originalLocation,
      replace: jest.fn(),
    };
    renderPilotHeader();
    await user.click(screen.getByTestId("desktop-user-button"));
    const userMenu = await screen.findByLabelText("Account navigation");
    await user.click(within(userMenu).getByText("Log out"));
    expect(window.location.replace).toHaveBeenCalled();
    window.location = originalLocation;
  });
});
