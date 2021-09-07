import { Story, Meta } from "@storybook/react";

import { TestResult } from "../QueueItem";

import SearchResults, { QueueProps, TestResultsProps } from "./SearchResults";

const patient = {
  internalId: "a123",
  firstName: "George",
  middleName: "",
  lastName: "Washington",
  birthDate: "1950-01-01",
  isDeleted: false,
  role: "somerole",
  lastTest: {
    dateAdded: "2020-01-01",
    result: "NEGATIVE" as TestResult,
    dateTested: "2020-01-01",
    deviceTypeModel: "MegaTester2000",
  },
};

export default {
  title: "Search Results",
  component: SearchResults,
  argTypes: {},
} as Meta;

const TestResultsTemplate = (): Story<TestResultsProps> => (args) => (
  <SearchResults {...args} />
);
const QueueTemplate = (): Story<QueueProps> => (args) => (
  <SearchResults {...args} />
);

export const NoResults = TestResultsTemplate();
NoResults.args = {
  onPatientSelect: () => {},
  page: "test-results",
  loading: false,
  patients: [],
  shouldShowSuggestions: true,
};

export const WithResults = TestResultsTemplate();
WithResults.args = {
  onPatientSelect: () => {},
  page: "test-results",
  loading: false,
  patients: [patient],
  shouldShowSuggestions: true,
};

export const QueueResults = QueueTemplate();
QueueResults.args = {
  page: "queue",
  loading: false,
  patients: [patient],
  patientsInQueue: [],
  shouldShowSuggestions: true,
};
