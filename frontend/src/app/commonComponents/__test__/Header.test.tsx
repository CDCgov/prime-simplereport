import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import createMockStore from "redux-mock-store";

import Header from "../Header";
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

  type WrappedHeaderProps = {
    children?: React.ReactNode;
  };

  const WrappedHeader: React.FC<WrappedHeaderProps> = ({ children }) => (
    <MemoryRouter>
      <Provider store={store}>
        <Header />
        {children}
      </Provider>
    </MemoryRouter>
  );

  it("displays the support link correctly", async () => {
    import.meta.env.VITE_IS_TRAINING_SITE = "false";
    render(<WrappedHeader />);
    await act(
      async () =>
        await userEvent.click(screen.getByTestId("desktop-user-button"))
    );
    expect(screen.getByTestId("desktop-support-link")).toBeVisible();
    await act(
      async () =>
        await userEvent.click(screen.getByTestId("desktop-support-link"))
    );
    expect(trackEventMock).toHaveBeenCalledWith({ name: "Support" });
  });
  it("displays new feature link correctly", async () => {
    import.meta.env.VITE_IS_TRAINING_SITE = "false";
    render(<WrappedHeader />);
    await act(
      async () =>
        await userEvent.click(screen.getByTestId("desktop-user-button"))
    );
    expect(screen.getByTestId("desktop-whats-new-link")).toBeVisible();
    await act(
      async () =>
        await userEvent.click(screen.getByTestId("desktop-whats-new-link"))
    );
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
      await act(
        async () =>
          await userEvent.selectOptions(dropdown[1].closest("select")!, "2")
      );
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
