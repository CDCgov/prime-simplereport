import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { MockedProvider } from "@apollo/client/testing";

import PrimeErrorBoundary from "../../PrimeErrorBoundary";
import { store } from "../../store";
import { WhoAmIQueryMock } from "../../ReportingApp.test";
import SRToastContainer from "../../commonComponents/SRToastContainer";
import { SendSupportEscalationDocument } from "../../../generated/graphql";

import { Escalations } from "./Escalations";

const SendSupportEscalationMock = {
  request: {
    query: SendSupportEscalationDocument,
  },
  result: {
    data: {},
  },
};

describe("Escalations", () => {
  it("Renders the page", async () => {
    const { container } = render(
      <PrimeErrorBoundary>
        <Provider store={store}>
          <MockedProvider mocks={[WhoAmIQueryMock]}>
            <MemoryRouter>
              <Escalations />
            </MemoryRouter>
          </MockedProvider>
        </Provider>
      </PrimeErrorBoundary>
    );
    expect(container).toMatchSnapshot();
  });

  it("Loads a success toast when submission works correctly", async () => {
    render(
      <div>
        <Provider store={store}>
          <MockedProvider mocks={[WhoAmIQueryMock, SendSupportEscalationMock]}>
            <MemoryRouter>
              <Escalations />
            </MemoryRouter>
          </MockedProvider>
        </Provider>
        <SRToastContainer />
      </div>
    );
    const submitButton = await screen.findByText("Submit escalation");
    submitButton.click();
    await screen.findByText("Escalation successfully sent");
  });
});
