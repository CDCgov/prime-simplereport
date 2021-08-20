import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { DetachedTestResultPrintModal } from "./TestResultPrintModal";

const testResult = {
  dateTested: new Date(),
  result: "NEGATIVE",
  correctionStatus: null,
  deviceType: {
    name: "Fake device",
  },
  patient: {
    firstName: "First",
    middleName: "Middle",
    lastName: "Last",
    birthDate: "08/07/1990",
  },
  facility: {
    name: "Facility Name",
    cliaNumber: "12D4567890",
    phone: "6318675309",
    street: "555 Fake St",
    streetTwo: null,
    city: "Raleigh",
    state: "NC",
    zipCode: "27601",
    orderingProvider: {
      firstName: "Ordering",
      middleName: null,
      lastName: "Provider",
      NPI: "fake-npi",
    },
  },
  testPerformed: {
    name: "Name",
    loincCode: "",
  },
};

describe("TestResultPrintModal", () => {
  it("should render a list of tests", async () => {
    const { container } = render(
      <MemoryRouter>
        <DetachedTestResultPrintModal
          data={{ testResult }}
          testResultId="id"
          closeModal={() => {}}
        />
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();
  });
});
