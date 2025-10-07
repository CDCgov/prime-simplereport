import { render, screen } from "@testing-library/react";

import { AoEAnswers } from "./AoEForm/AoEForm";
import AskOnEntryTag from "./AskOnEntryTag";

const expectedStates: {
  testName: string;
  answers: {
    noSymptoms: boolean;
    symptoms: string;
    symptomOnset: string | null;
    pregnancy: string | null;
  };
  result: "COMPLETED" | "PENDING";
}[] = [
  {
    testName: "no fields copleted",
    answers: {
      noSymptoms: false,
      symptoms: "{}",
      symptomOnset: null,
      pregnancy: null,
    },
    result: "PENDING",
  },
  {
    testName: "fields complete no symptoms",
    answers: {
      noSymptoms: true,
      symptoms: "{}",
      symptomOnset: null,
      pregnancy: "no",
    },
    result: "COMPLETED",
  },
  {
    testName: "fields complete symptoms",
    answers: {
      noSymptoms: false,
      symptoms: '{"something":"true"}',
      symptomOnset: "12/12/2020",
      pregnancy: "no",
    },
    result: "COMPLETED",
  },
  {
    testName: "missing symptom onset",
    answers: {
      noSymptoms: false,
      symptoms: '{"something":"true"}',
      symptomOnset: null,
      pregnancy: "no",
    },
    result: "PENDING",
  },
  {
    testName: "missing pregnancy response",
    answers: {
      noSymptoms: true,
      symptoms: '{"something":"true"}',
      symptomOnset: null,
      pregnancy: null,
    },
    result: "PENDING",
  },
];

describe("AskOnEntryTag", () => {
  expectedStates.forEach(({ testName, answers, result }) => {
    it(testName, () => {
      render(<AskOnEntryTag aoeAnswers={answers as AoEAnswers} />);
      expect(screen.getByText(result)).toBeInTheDocument();
    });
  });
});
