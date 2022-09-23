import { render, screen } from "@testing-library/react";
import ReactDOM from "react-dom";
import * as flaggedMock from "flagged";

import { DetachedTestResultDetailsModal } from "./TestResultDetailsModal";

const nonMultiplexTestResult = {
  dateTested: "2022-01-28T17:56:48.143Z",
  results: [
    {
      disease: { name: "COVID-19" as MultiplexDisease },
      testResult: "NEGATIVE" as TestResult,
      __typename: "MultiplexResult",
    },
  ],
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

const multiplexTestResult = JSON.parse(JSON.stringify(nonMultiplexTestResult));
multiplexTestResult["results"] = [
  {
    disease: { name: "COVID-19" as MultiplexDisease },
    testResult: "POSITIVE" as TestResult,
    __typename: "MultiplexResult",
  },
  {
    disease: { name: "Flu A" as MultiplexDisease },
    testResult: "NEGATIVE" as TestResult,
    __typename: "MultiplexResult",
  },
  {
    disease: { name: "Flu B" as MultiplexDisease },
    testResult: "POSITIVE" as TestResult,
    __typename: "MultiplexResult",
  },
];

window.print = jest.fn();

describe("non-multiplex TestResultDetailsModal", () => {
  let component: any;

  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;

    component = render(
      <DetachedTestResultDetailsModal
        data={{ testResult: nonMultiplexTestResult }}
        testResultId="id"
        closeModal={() => {}}
      />
    );
  });

  it("should render the test date and test time", () => {
    expect(screen.getByText("01/28/2022 5:56pm")).toBeInTheDocument();
  });

  it("shouldn't have flu A or B result rows", () => {
    expect(screen.queryByText("Flu A result")).not.toBeInTheDocument();
    expect(screen.queryByText("Flu B result")).not.toBeInTheDocument();
  });

  it("matches screenshot", () => {
    expect(component).toMatchSnapshot();
  });
});

describe("Multiplex TestResultDetailsModal", () => {
  let component: any;

  beforeEach(() => {
    jest.spyOn(flaggedMock, "useFeature").mockReturnValue(true);
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;

    component = render(
      <DetachedTestResultDetailsModal
        data={{ testResult: multiplexTestResult }}
        testResultId="id"
        closeModal={() => {}}
      />
    );
  });

  it("should render the test date and test time", () => {
    expect(screen.getByText("01/28/2022 5:56pm")).toBeInTheDocument();
  });

  it("should have flu A or B result rows", () => {
    expect(screen.getByText("Flu A result")).toBeInTheDocument();
    expect(screen.getByText("Flu B result")).toBeInTheDocument();
  });

  it("matches screenshot", () => {
    expect(component).toMatchSnapshot();
  });
});
