import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Story, Meta } from "@storybook/react";
import createMockStore from "redux-mock-store";
import { Provider } from "react-redux";

import { UserPermission } from "../../../generated/graphql";
import { initialState } from "../../store";

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

const mockStore = createMockStore([]);

const standardUser = {
  id: "a123",
  firstName: "Bob",
  lastName: "Bobberoo",
  middleName: "",
  suffix: "",
  email: "bob@example.com",
  isAdmin: false,
  roleDescription: "Standard user",
  permissions: [UserPermission.SearchPatients, UserPermission.EditPatient],
};

const standardUserStore = mockStore({
  ...initialState,
  user: { ...standardUser },
});

const entryOnlyUserStore = mockStore({
  ...initialState,
  user: {
    ...standardUser,
    roleDescription: "Test-entry user",
    permissions: [UserPermission.SearchPatients],
  },
});

const RouterWithFacility: React.FC<RouterWithFacilityProps> = ({
  children,
}) => <MemoryRouter>{children}</MemoryRouter>;

interface TestResultsPropsWithEntryOnlyUser extends TestResultsProps {
  isEntryOnlyUser?: boolean;
}

export default {
  title: "Search Results",
  component: SearchResults,
  argTypes: {},
  decorators: [
    (Story, context) => (
      <Provider
        store={
          context.args["isEntryOnlyUser"]
            ? entryOnlyUserStore
            : standardUserStore
        }
      >
        <Story></Story>
      </Provider>
    ),
  ],
} as Meta;

const TestResultsTemplate =
  (): Story<TestResultsPropsWithEntryOnlyUser> => (args) =>
    (
      <RouterWithFacility>
        <SearchResults {...args} />
      </RouterWithFacility>
    );
const QueueTemplate = (): Story<QueueProps> => (args) =>
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
  isEntryOnlyUser: false,
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
