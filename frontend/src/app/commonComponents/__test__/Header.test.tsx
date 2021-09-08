import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import createMockStore from "redux-mock-store";
import { useTrackEvent } from "@microsoft/applicationinsights-react-js";

import Header from "../Header";
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

jest.mock("@microsoft/applicationinsights-react-js", () => ({
  useAppInsightsContext: () => {},
  useTrackEvent: jest.fn(),
}));

describe("Header.tsx", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  const WrappedHeader: React.FC = ({ children }) => (
    <MemoryRouter>
      <Provider store={store}>
        <Header />
        {children}
      </Provider>
    </MemoryRouter>
  );

  it("displays the support link correctly", async () => {
    process.env.REACT_APP_IS_TRAINING_SITE = "false";
    render(<WrappedHeader />);
    await waitFor(() => {
      fireEvent.click(screen.getByTestId("user-button"));
    });
    expect(screen.getByTestId("support-link")).toBeVisible();
    await waitFor(() => {
      fireEvent.click(screen.getByTestId("support-link"));
    });
    expect(useTrackEvent).toHaveBeenCalledWith(undefined, "Support", {});
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
      await waitFor(() => {
        fireEvent.change(dropdown[1].closest("select")!, {
          target: { value: "2" },
        });
      });
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
