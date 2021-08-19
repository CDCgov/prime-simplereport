import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import createMockStore from "redux-mock-store";
import { useTrackEvent } from "@microsoft/applicationinsights-react-js";
import { TRAINING_PURPOSES_ONLY } from "../TrainingNotification";

import Header from "../Header";
import "../../../i18n";

const mockStore = createMockStore([]);

const store = mockStore({
  organization: {
    name: "Organization Name",
  },
  user: {
    firstName: "Kim",
    lastName: "Mendoza",
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

  const WrappedHeader: React.FC = () => (
    <MemoryRouter>
      <Provider store={store}>
        <Header />
      </Provider>
    </MemoryRouter>
  );

  const MODAL_TEXT = "Welcome to the SimpleReport";

  it("displays the training header and modal and dismisses the modal", async () => {
    process.env.REACT_APP_IS_TRAINING_SITE = "true";
    render(<WrappedHeader />);
    expect(await screen.findAllByText(TRAINING_PURPOSES_ONLY)).toHaveLength(2);
    const trainingWelcome = await screen.findByText(MODAL_TEXT, {
      exact: false,
    });
    expect(trainingWelcome).toBeInTheDocument();
    await waitFor(() => {
      fireEvent.click(screen.getByText("Got it", { exact: false }));
    });
    expect(trainingWelcome).not.toBeInTheDocument();
  });
  it("does not display training notifications outside the training environment", () => {
    process.env.REACT_APP_IS_TRAINING_SITE = "false";
    expect(screen.queryByText(TRAINING_PURPOSES_ONLY)).not.toBeInTheDocument();
    expect(screen.queryByText(MODAL_TEXT)).not.toBeInTheDocument();
  });
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
});
