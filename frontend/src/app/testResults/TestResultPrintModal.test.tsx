import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockDate from "mockdate";
import ReactDOM from "react-dom";

import { DetachedTestResultPrintModal } from "./TestResultPrintModal";

const testResult = {
  dateTested: new Date("2022-01-28T17:56:48.143Z"),
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

window.print = jest.fn();

describe("TestResultPrintModal", () => {
  let printSpy: jest.SpyInstance;
  let component: any;

  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;

    printSpy = jest.spyOn(window, "print");

    MockDate.set("2021/01/01");
    component = render(
      <DetachedTestResultPrintModal
        data={{ testResult }}
        testResultId="id"
        closeModal={() => {}}
      />
    );
  });

  afterEach(() => {
    printSpy.mockRestore();
  });

  it("should render the test result print view", async () => {
    userEvent.click(screen.getAllByText("Print")[1]);

    expect(printSpy).toBeCalled();
  });

  it("should render the test date and test time", () => {
    expect(screen.getByText("01/28/2022 5:56pm")).toBeInTheDocument();
  });

  it("matches screenshot", () => {
    expect(component).toMatchSnapshot();
  });
});
