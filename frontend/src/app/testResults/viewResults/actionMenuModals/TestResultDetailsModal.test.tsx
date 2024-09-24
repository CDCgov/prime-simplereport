import { render, screen } from "@testing-library/react";
import ReactDOM from "react-dom";

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
  surveyData: {
    pregnancy: null,
    syphilisHistory: null,
    symptoms: '{"00000":"false"}',
    symptomOnset: "myOnset",
    noSymptoms: false,
    genderOfSexualPartners: null,
  },
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
  {
    disease: { name: "RSV" as MultiplexDisease },
    testResult: "UNDETERMINED" as TestResult,
    __typename: "MultiplexResult",
  },
];

const hivTestResult = JSON.parse(JSON.stringify(nonMultiplexTestResult));
hivTestResult.results = [
  {
    disease: { name: "HIV" as MultiplexDisease },
    testResult: "POSITIVE" as TestResult,
    __typename: "MultiplexResult",
  },
];
hivTestResult.surveyData.genderOfSexualPartners = ["female", "male", "other"];
hivTestResult.surveyData.pregnancy = "77386006";

const syphilisTestResult = JSON.parse(JSON.stringify(nonMultiplexTestResult));
syphilisTestResult.results = [
  {
    disease: { name: "Syphilis" as MultiplexDisease },
    testResult: "POSITIVE" as TestResult,
    __typename: "MultiplexResult",
  },
];
syphilisTestResult.surveyData.pregnancy = "77386006";
syphilisTestResult.surveyData.syphilisHistory = "1087151000119108";
syphilisTestResult.surveyData.symptoms =
  '{"91554004":"false","15188001":"false","724386005":"false","56940005":"true","266128007":"true","46636008":"true","68225006":"false","195469007":"false","26284000":"false"}';
syphilisTestResult.surveyData.symptomOnset = "2024-09-24";
syphilisTestResult.surveyData.noSymptoms = false;
syphilisTestResult.surveyData.genderOfSexualPartners = [
  "female",
  "male",
  "other",
];

const renderComponent = (testResult: TestResult) =>
  render(
    <DetachedTestResultDetailsModal
      data={{ testResult: testResult }}
      closeModal={() => {}}
    />
  );
describe("single disease TestResultDetailsModal", () => {
  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;
  });

  it("should render the test date and test time", () => {
    renderComponent(nonMultiplexTestResult);
    expect(screen.getByText("01/28/2022 5:56pm")).toBeInTheDocument();
  });

  it("shouldn't have flu A or B result rows", () => {
    renderComponent(nonMultiplexTestResult);
    expect(screen.queryByText("Flu A result")).not.toBeInTheDocument();
    expect(screen.queryByText("Flu B result")).not.toBeInTheDocument();
  });

  it("matches screenshot", () => {
    let view = renderComponent(nonMultiplexTestResult);
    expect(view).toMatchSnapshot();
  });
});

describe("multiple diseases TestResultDetailsModal", () => {
  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;
  });

  it("should render the test date and test time", () => {
    renderComponent(multiplexTestResult);
    expect(screen.getByText("01/28/2022 5:56pm")).toBeInTheDocument();
  });

  it("should have rows for all diseases in result", () => {
    renderComponent(multiplexTestResult);
    expect(screen.getByText("COVID-19 result")).toBeInTheDocument();
    expect(screen.getByText("Flu A result")).toBeInTheDocument();
    expect(screen.getByText("Flu B result")).toBeInTheDocument();
    expect(screen.getByText("RSV result")).toBeInTheDocument();
    expect(
      screen.queryByText("Gender of sexual partners")
    ).not.toBeInTheDocument();
  });

  it("matches screenshot", () => {
    let view = renderComponent(multiplexTestResult);
    expect(view).toMatchSnapshot();
  });
});

describe("HIV TestResultDetailsModal", () => {
  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;
  });

  it("should have HIV specific AOE text", () => {
    renderComponent(hivTestResult);
    expect(screen.getByText("HIV result")).toBeInTheDocument();
    expect(screen.queryByText("Symptoms")).not.toBeInTheDocument();
    expect(screen.queryByText("Symptom onset")).not.toBeInTheDocument();
    expect(screen.getByText("Gender of sexual partners")).toBeInTheDocument();
    expect(screen.getByText("Female, Male, Other")).toBeInTheDocument();
    expect(screen.getByText("Pregnant?")).toBeInTheDocument();
  });

  it("matches screenshot", () => {
    let view = renderComponent(hivTestResult);
    expect(view).toMatchSnapshot();
  });
});

describe("Syphilis TestResultDetailsModal", () => {
  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;
  });

  it("should have Syphilis specific symptoms", () => {
    renderComponent(syphilisTestResult);
    expect(screen.getByText("Syphilis result")).toBeInTheDocument();
    expect(screen.getByText("Symptoms")).toBeInTheDocument();
    expect(screen.getByText("Symptom onset")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Blurred vision, Palmar (hand)/plantar (foot) rash, Body Rash"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Gender of sexual partners")).toBeInTheDocument();
    expect(screen.getByText("Female, Male, Other")).toBeInTheDocument();
    expect(screen.getByText("Pregnant?")).toBeInTheDocument();
    expect(
      screen.getByText("Previously told they have syphilis?")
    ).toBeInTheDocument();
  });

  it("matches screenshot", () => {
    let view = renderComponent(syphilisTestResult);
    expect(view).toMatchSnapshot();
  });
});
