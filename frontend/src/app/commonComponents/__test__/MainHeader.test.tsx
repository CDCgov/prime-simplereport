import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import createMockStore from "redux-mock-store";

import MainHeader from "../MainHeader";
import { getAppInsights } from "../../TelemetryService";
import "../../../i18n";
import { useSelectedFacility } from "../../facilitySelect/useSelectedFacility";

const mockStore = createMockStore([]);

const store = mockStore({
  organization: {
    name: "Organization Name",
  },
  user: {
    firstName: "Kim",
    lastName: "Mendoza",
    roleDescription: "Standard user",
  },
  facilities: [
    { id: "1", name: "Facility 1" },
    { id: "2", name: "Facility 2" },
  ],
});

jest.mock("../../TelemetryService", () => ({
  getAppInsights: jest.fn(),
}));

describe("Header.tsx", () => {
  const OLD_ENV = process.env;
  const trackEventMock = jest.fn();

  beforeEach(() => {
    (getAppInsights as jest.Mock).mockImplementation(() => ({
      trackEvent: trackEventMock,
    }));
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    (getAppInsights as jest.Mock).mockReset();
    process.env = OLD_ENV;
  });

  const WrappedHeader: React.FC = ({ children }) => (
    <MemoryRouter>
      <Provider store={store}>
        <MainHeader />
        {children}
      </Provider>
    </MemoryRouter>
  );

  it("displays the support link correctly", async () => {
    process.env.REACT_APP_IS_TRAINING_SITE = "false";
    render(<WrappedHeader />);
    userEvent.click(screen.getByTestId("desktop-user-button"));
    expect(screen.getByTestId("desktop-support-link")).toBeVisible();
    userEvent.click(screen.getByTestId("desktop-support-link"));
    expect(trackEventMock).toHaveBeenCalledWith({ name: "Support" });
  });
  it("displays new feature link correctly", async () => {
    process.env.REACT_APP_IS_TRAINING_SITE = "false";
    render(<WrappedHeader />);
    userEvent.click(screen.getByTestId("desktop-user-button"));
    expect(screen.getByTestId("desktop-whats-new-link")).toBeVisible();
    userEvent.click(screen.getByTestId("desktop-whats-new-link"));
    expect(trackEventMock).toHaveBeenCalledWith({ name: "What's new" });
  });
  it("it does not render login links", () => {
    expect(
      screen.queryByText("Login as", { exact: false })
    ).not.toBeInTheDocument();
  });
  describe("Facility dropdown", () => {
    it("Switches facilities", async () => {
      render(
        <WrappedHeader>
          <FacilityViewer />
        </WrappedHeader>
      );
      const dropdown = await screen.findAllByRole("option");
      userEvent.selectOptions(dropdown[1].closest("select")!, "2");
      expect(
        await screen.findByText("Facility 2 is selected")
      ).toBeInTheDocument();
    });
  });
});

function FacilityViewer() {
  const [selectedFacility] = useSelectedFacility();
  return <>{selectedFacility?.name} is selected</>;
}
