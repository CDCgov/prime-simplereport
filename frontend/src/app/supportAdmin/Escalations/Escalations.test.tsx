import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";

import SRToastContainer from "../../commonComponents/SRToastContainer";
import { SendSupportEscalationDocument } from "../../../generated/graphql";
import { WhoAmIQueryMock } from "../../OperationMocks";

import { Escalations } from "./Escalations";

const SendSupportEscalationMock = {
  request: {
    query: SendSupportEscalationDocument,
  },
  result: {
    data: { sendSupportEscalation: {} },
  },
};

describe("Escalations", () => {
  it("Renders the page", () => {
    const { container } = render(
      <MockedProvider mocks={[WhoAmIQueryMock, SendSupportEscalationMock]}>
        <MemoryRouter>
          <Escalations />
        </MemoryRouter>
      </MockedProvider>
    );
    expect(container).toMatchSnapshot();
  });

  it("Loads a success toast when submission works correctly", async () => {
    render(
      <>
        <MockedProvider mocks={[WhoAmIQueryMock, SendSupportEscalationMock]}>
          <MemoryRouter>
            <Escalations />
          </MemoryRouter>
        </MockedProvider>
        <SRToastContainer />
      </>
    );
    const user = userEvent.setup();
    const submitButton = await screen.findByText("Submit escalation");
    await user.click(submitButton);
    await screen.findByText("Escalation successfully sent");
  });
});
