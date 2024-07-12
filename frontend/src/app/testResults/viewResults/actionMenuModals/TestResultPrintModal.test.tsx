import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cloneDeep } from "lodash";
import MockDate from "mockdate";
import ReactDOM from "react-dom";

import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../../constants";

import { DetachedTestResultPrintModal } from "./TestResultPrintModal";

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

  const renderWithUser = () => ({
    user: userEvent.setup(),
    ...render(
      <DetachedTestResultPrintModal
        data={{ testResult }}
        testResultId="id"
        closeModal={() => {}}
      />
    ),
  });

  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;

    printSpy = jest.spyOn(window, "print");
    MockDate.set("2021/01/01");
  });

  afterEach(() => {
    printSpy.mockRestore();
  });

  it("should render the test result print view", async () => {
    const { user } = renderWithUser();
    await user.click(screen.getAllByText("Print")[1]);
    expect(printSpy).toBeCalled();
  });

  it("should render the test date and test time", () => {
    renderWithUser();
    expect(screen.getByText("01/28/2022 5:56pm")).toBeInTheDocument();
  });

  it("should render only COVID information", () => {
    renderWithUser();
    expect(screen.getByText("For COVID-19:")).toBeInTheDocument();
  });

  it("matches screenshot", () => {
    const { container } = renderWithUser();
    expect(container).toMatchSnapshot();
  });
});

const renderComponent = (testResult: TestResult) =>
  render(
    <DetachedTestResultPrintModal
      data={{ testResult: testResult }}
      testResultId="id"
      closeModal={() => {}}
    />
  );

describe("TestResultPrintModal with multiplex results in SimpleReport App", () => {
  let multiplexTestResult = cloneDeep(testResult);

  beforeEach(() => {
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
  });

  it("should render flu information", () => {
    renderComponent(multiplexTestResult);
    expect(screen.getByText("Test results")).toBeInTheDocument();
    expect(screen.getByText("For flu A and B:")).toBeInTheDocument();
  });

  it("matches screenshot", () => {
    let view = renderComponent(multiplexTestResult);
    expect(view).toMatchSnapshot();
  });
});

describe("TestResultPrintModal with multiplex results from Pxp App", () => {
  // when we render the print modal from the pxp app, the shape of the result data can be slightly different, so we want to test for that case
  let multiplexPxpTestResult = cloneDeep(testResult);

  beforeEach(() => {
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
    // if no NPI, component should use npi
    multiplexPxpTestResult.facility.orderingProvider.NPI = undefined;
    multiplexPxpTestResult.facility.orderingProvider.npi = "fake npi for pxp";

    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;

    MockDate.set("2021/01/01");
  });

  it("should render information", () => {
    renderComponent(multiplexPxpTestResult);
    expect(screen.getByText("Test results")).toBeInTheDocument();
    expect(screen.getByText("fake npi for pxp")).toBeInTheDocument();
    expect(screen.getAllByText("Negative").length).toBe(3);
  });

  it("matches screenshot", () => {
    let view = renderComponent(multiplexPxpTestResult);
    expect(view).toMatchSnapshot();
  });
});

describe("TestResultPrintModal with RSV and flu results", () => {
  let multiplexTestResult = cloneDeep(testResult);

  beforeEach(() => {
    multiplexTestResult.results = [
      {
        disease: { name: MULTIPLEX_DISEASES.RSV },
        testResult: TEST_RESULTS.POSITIVE,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_B },
        testResult: TEST_RESULTS.UNDETERMINED,
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
  });

  it("should render flu information", () => {
    renderComponent(multiplexTestResult);
    expect(screen.getByText("Test results")).toBeInTheDocument();
    expect(screen.getByText("For flu A and B:")).toBeInTheDocument();
  });

  it("matches screenshot", () => {
    let view = renderComponent(multiplexTestResult);
    expect(view).toMatchSnapshot();
  });
});

describe("TestResultPrintModal with HIV results", () => {
  let hivTestResult = cloneDeep(testResult);

  beforeEach(() => {
    hivTestResult.results = [
      {
        disease: { name: MULTIPLEX_DISEASES.HIV },
        testResult: TEST_RESULTS.POSITIVE,
      },
    ];

    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;

    MockDate.set("2021/01/01");
  });

  it("should render HIV information", () => {
    renderComponent(hivTestResult);
    expect(screen.getByText("HIV")).toBeInTheDocument();
    expect(screen.getByText("Positive")).toBeInTheDocument();
  });

  it("matches screenshot", () => {
    let view = renderComponent(hivTestResult);
    expect(view).toMatchSnapshot();
  });
});

describe("TestResultPrintModal with a syphilis result", () => {
  let syphilisResult = cloneDeep(testResult);

  beforeEach(() => {
    syphilisResult.results = [
      {
        disease: { name: MULTIPLEX_DISEASES.SYPHILIS },
        testResult: TEST_RESULTS.POSITIVE,
      },
    ];

    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;

    MockDate.set("2021/01/01");
  });

  it("should render Syphilis information and guidance", () => {
    renderComponent(syphilisResult);
    expect(screen.getByText("Syphilis")).toBeInTheDocument();
    expect(screen.getByText("Positive")).toBeInTheDocument();
    expect(screen.getByText("For syphilis:")).toBeInTheDocument();
  });
});
