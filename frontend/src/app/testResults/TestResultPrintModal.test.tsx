import { act, fireEvent, render, RenderResult } from "@testing-library/react";
import ReactDOM from "react-dom";
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
  let component: RenderResult;
  let container: RenderResult["container"];

  beforeAll(() => {
    ReactDOM.createPortal = jest.fn((element, node) => {
      return element;
    }) as any;

    printSpy = jest.spyOn(window, "print");
    component = render(
      <DetachedTestResultPrintModal
        data={{ testResult }}
        testResultId="id"
        closeModal={() => {}}
      />
    );
    container = component.container;
  });

  afterAll(() => {
    printSpy.mockRestore();
  });

  it("should render the test result print view", async () => {
    expect(container).toMatchSnapshot();

    await act(async () => {
      await fireEvent.click(component.getAllByRole("button")[2]);
    });

    expect(printSpy).toBeCalled();
  });
});
