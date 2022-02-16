import { render, screen } from "@testing-library/react";
import ReactDOM from "react-dom";

import { TestResult } from "../testQueue/QueueItem";

import { DetachedTestResultDetailsModal } from "./TestResultDetailsModal";

const testResult = {
  dateTested: "2022-01-28T17:56:48.143Z",
  result: "NEGATIVE" as TestResult,
  correctionStatus: null,
  noSymptoms: false,
  symptoms: '{"00000":"false"}',
  symptomOnset: "myOnset",
  pregnancy: null,
  deviceType: {
    name: "Fake device",
  },
  patient: {
    firstName: "First",
    middleName: "Middle",
    lastName: "Last",
    birthDate: "08/07/1990",
  },
  createdBy: {
    name: {
      firstName: "firstName",
      middleName: "middle",
      lastName: "last",
    },
  },
};

window.print = jest.fn();

describe("TestResultDetailsModal", () => {
  let component: any;

  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;

    component = render(
      <DetachedTestResultDetailsModal
        data={{ testResult }}
        testResultId="id"
        closeModal={() => {}}
      />
    );
  });

  it("should render the test date and test time", () => {
    expect(screen.getByText("01/28/2022 5:56pm")).toBeInTheDocument();
  });

  it("matches screenshot", () => {
    expect(component).toMatchSnapshot();
  });
});
