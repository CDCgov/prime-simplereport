import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Meta, StoryFn } from "@storybook/react-webpack5";

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
    facilityName: "Whatever",
    dateAdded: "2020-01-01",
    result: "NEGATIVE" as TestResult,
    dateTested: "2020-01-01",
    deviceTypeModel: "MegaTester2000",
    deviceTypeName: "MegaTester2000 (PCR)",
  },
};

const RouterWithFacility: React.FC<RouterWithFacilityProps> = ({
  children,
}) => <MemoryRouter>{children}</MemoryRouter>;

export default {
  title: "App/Queue/Patient Search Results",
  component: SearchResults,
  argTypes: {},
} as Meta;

const TestResultsTemplate = (): StoryFn<TestResultsProps> => (args) =>
  (
    <RouterWithFacility>
      <SearchResults {...args} />
    </RouterWithFacility>
  );
const QueueTemplate = (): StoryFn<QueueProps> => (args) =>
  (
    <RouterWithFacility>
      <SearchResults {...args} />
    </RouterWithFacility>
  );

export const NoResults = TestResultsTemplate();
NoResults.args = {
  onPatientSelect: () => {},
  page: "test-results",
  loading: false,
  patients: [],
  shouldShowSuggestions: true,
  canAddPatient: true,
};

export const WithResults = TestResultsTemplate();
WithResults.args = {
  onPatientSelect: () => {},
  page: "test-results",
  loading: false,
  patients: [patient],
  shouldShowSuggestions: true,
  canAddPatient: true,
};

export const QueueResults = QueueTemplate();
QueueResults.args = {
  page: "queue",
  loading: false,
  patients: [patient],
  patientsInQueue: [],
  shouldShowSuggestions: true,
  canAddPatient: true,
};
