import { fireEvent, render, screen, within } from "@testing-library/react";
import configureStore, { MockStoreEnhanced } from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import userEvent from "@testing-library/user-event";

import LabReportForm from "./LabReportForm";

describe("LabReportForm Stepper", () => {
  let store: MockStoreEnhanced<unknown, {}>;
  const mockStore = configureStore([]);
  const renderWithUser = (mocks: any[]) => ({
    user: userEvent.setup(),
    ...render(
      <MemoryRouter>
        <MockedProvider mocks={mocks}>
          <Provider store={store}>
            <LabReportForm />
          </Provider>
        </MockedProvider>
      </MemoryRouter>
    ),
  });

  beforeEach(() => {
    store = mockStore({
      organization: {
        name: "Organization Name",
      },
      facilities: [
        {
          id: "a1",
          name: "Fake Facility",
        },
      ],
      user: {
        permissions: [],
      },
    });
  });

  test("renders stepper with steps", () => {
    renderWithUser([]);
    const stepIndicator = screen.getByTestId("step-indicator");
    const steps = within(stepIndicator).getAllByRole("listitem");
    expect(steps).toHaveLength(5);
    expect(steps[0]).toHaveTextContent("Facility information");
    expect(steps[1]).toHaveTextContent("Provider information");
    expect(steps[2]).toHaveTextContent("Patient information");
    expect(steps[3]).toHaveTextContent("Lab results");
    expect(steps[4]).toHaveTextContent("Review and submit");
  });

  test("steps forward and back", () => {
    renderWithUser([]);

    const stepIndicator = screen.getByTestId("step-indicator");

    const currentStep = within(stepIndicator).getByRole("heading");
    expect(currentStep).toHaveTextContent("Facility information");

    const nextButton = screen.getByRole("button", {
      name: /Next/i,
    });
    fireEvent.click(nextButton);

    expect(currentStep).toHaveTextContent("Provider information");

    const backButton = screen.getByRole("button", {
      name: /Back to facility information/i,
    });
    fireEvent.click(backButton);

    expect(currentStep).toHaveTextContent("Facility information");
  });

  test("allows clicking to change step", () => {
    renderWithUser([]);

    const stepIndicator = screen.getByTestId("step-indicator");
    const currentStep = within(stepIndicator).getByRole("heading");

    const providerStep = within(stepIndicator).getByText(
      "Provider information"
    );
    fireEvent.click(providerStep);
    expect(currentStep).toHaveTextContent("Provider information");

    const patientStep = within(stepIndicator).getByText("Patient information");
    fireEvent.click(patientStep);
    expect(currentStep).toHaveTextContent("Patient information");

    const facilityStep = within(stepIndicator).getByText(
      "Facility information"
    );
    fireEvent.click(facilityStep);
    expect(currentStep).toHaveTextContent("Facility information");
  });
});
