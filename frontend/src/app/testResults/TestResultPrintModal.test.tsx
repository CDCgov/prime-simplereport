import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cloneDeep } from "lodash";
import MockDate from "mockdate";
import ReactDOM from "react-dom";
import * as flaggedMock from "flagged";

import { DetachedTestResultPrintModal } from "./TestResultPrintModal";
import { MULTIPLEX_DISEASES, TEST_RESULTS } from "./constants";

const testResult = {
  dateTested: new Date("2022-01-28T17:56:48.143Z"),
  result: "NEGATIVE",
  results: [
    {
      disease: { name: MULTIPLEX_DISEASES.COVID_19 },
      testResult: TEST_RESULTS.NEGATIVE,
    },
  ] as MultiplexResult[],
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
      NPI: "fake-npi" as string | undefined,
      npi: undefined as string | undefined,
    },
  },
  testPerformed: {
    name: "Name",
    loincCode: "",
  },
};

window.print = jest.fn();

describe("TestResultPrintModal with only COVID results", () => {
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
    await act(
      async () => await userEvent.click(screen.getAllByText("Print")[1])
    );

    expect(printSpy).toBeCalled();
  });

  it("should render the test date and test time", () => {
    expect(screen.getByText("01/28/2022 5:56pm")).toBeInTheDocument();
  });

  it("should render only COVID information", () => {
    expect(screen.getByText("Test result: COVID-19")).toBeInTheDocument();
  });

  it("matches screenshot", () => {
    expect(component).toMatchSnapshot();
  });
});

describe("TestResultPrintModal with multiplex results in SimpleReport App", () => {
  let component: any;

  beforeEach(() => {
    // mock multiplex as true
    jest.spyOn(flaggedMock, "useFeature").mockReturnValue(true);

    const multiplexTestResult = cloneDeep(testResult);
    multiplexTestResult.results = [
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_B },
        testResult: TEST_RESULTS.POSITIVE,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.COVID_19 },
        testResult: TEST_RESULTS.POSITIVE,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_A },
        testResult: TEST_RESULTS.POSITIVE,
      },
    ];

    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;

    MockDate.set("2021/01/01");
    component = render(
      <DetachedTestResultPrintModal
        data={{ testResult: multiplexTestResult }}
        testResultId="id"
        closeModal={() => {}}
      />
    );
  });

  it("should render flu information", () => {
    expect(
      screen.getByText("Test results: COVID-19 and flu")
    ).toBeInTheDocument();
    expect(screen.getByText("For flu A and B:")).toBeInTheDocument();
  });

  it("matches screenshot", () => {
    expect(component).toMatchSnapshot();
  });
});

describe("TestResultPrintModal with multiplex results in Pxp App", () => {
  let component: any;

  beforeEach(() => {
    //mock multiplex as true
    jest.spyOn(flaggedMock, "useFeature").mockReturnValue(true);

    const multiplexPxpTestResult = cloneDeep(testResult);
    multiplexPxpTestResult.results = [
      {
        disease: { name: MULTIPLEX_DISEASES.COVID_19 },
        testResult: TEST_RESULTS.NEGATIVE,
      } as MultiplexResult,
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_A },
        testResult: TEST_RESULTS.NEGATIVE,
      } as MultiplexResult,
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_B },
        testResult: TEST_RESULTS.NEGATIVE,
      } as MultiplexResult,
    ];
    multiplexPxpTestResult.facility.orderingProvider.NPI = undefined;
    multiplexPxpTestResult.facility.orderingProvider.npi = "fake npi for pxp";

    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;

    MockDate.set("2021/01/01");
    component = render(
      <DetachedTestResultPrintModal
        data={{ testResult: multiplexPxpTestResult }}
        testResultId="id"
        closeModal={() => {}}
      />
    );
  });

  it("should render information", () => {
    expect(
      screen.getByText("Test results: COVID-19 and flu")
    ).toBeInTheDocument();
    expect(screen.getByText("fake npi for pxp")).toBeInTheDocument();
    expect(screen.getAllByText("Negative").length).toBe(3);
  });

  it("matches screenshot", () => {
    expect(component).toMatchSnapshot();
  });
});
