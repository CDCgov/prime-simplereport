import { act, fireEvent, render } from "@testing-library/react";
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
  let printSpy: jest.SpyInstance;

  beforeAll(() => {
    printSpy = jest.spyOn(window, "print");
  });

  afterAll(() => {
    printSpy.mockRestore();
  });

  it("should render the test result print view", async () => {
    const { container, getAllByRole } = render(
      <MemoryRouter>
        <DetachedTestResultPrintModal
          data={{ testResult }}
          testResultId="id"
          closeModal={() => {}}
        />
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();

    await act(async () => {
      await fireEvent.click(getAllByRole("button")[2]);
    });

    expect(printSpy).toBeCalled();
  });
});
