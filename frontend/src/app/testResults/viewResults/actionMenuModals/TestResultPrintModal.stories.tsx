import { Meta, StoryFn } from "@storybook/react";

import { GetTestResultForPrintDocument } from "../../../../generated/graphql";

import TestResultPrintModal, {
  TestResultPrintModalProps,
} from "./TestResultPrintModal";

export default {
  title: "Print test results",
  component: TestResultPrintModal,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
  args: {},
} as Meta;

const testResult = {
  dateTested: new Date("2021-08-20"),
  results: [{ disease: { name: "COVID-19" }, testResult: "NEGATIVE" }],
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

function GetTestResultForPrintDocumentMock(variables: any, testResult: any) {
  return {
    request: {
      query: GetTestResultForPrintDocument,
      variables,
    },
    result: {
      data: { testResult },
    },
  };
}

const Template: StoryFn<TestResultPrintModalProps> = (args) => {
  return <TestResultPrintModal {...args} />;
};

/**
 * Default (Covid negative)
 */
export const Default = Template.bind({});
const defaultProps: TestResultPrintModalProps = {
  isOpen: true,
  testResultId: "default",
  closeModal: () => {},
  hardcodedPrintDate: "8/24/2021, 9:44:25 AM",
};

Default.args = defaultProps;
Default.parameters = {
  apolloClient: {
    mocks: [
      GetTestResultForPrintDocumentMock({ id: "default" }, { ...testResult }),
    ],
  },
};

/**
 * Covid positive
 */
export const WithPositiveCovid = Template.bind({});
const positiveCovidProps = { ...defaultProps, testResultId: "covid_positive" };

WithPositiveCovid.args = positiveCovidProps;
WithPositiveCovid.parameters = {
  apolloClient: {
    mocks: [
      GetTestResultForPrintDocumentMock(
        { id: "covid_positive" },
        {
          ...testResult,
          results: [{ disease: { name: "COVID-19" }, testResult: "POSITIVE" }],
        }
      ),
    ],
  },
};

/**
 * Covid undetermined
 */
export const WithUndeterminedCovid = Template.bind({});
WithUndeterminedCovid.args = {
  ...defaultProps,
  testResultId: "covid_undetermined",
};
WithUndeterminedCovid.parameters = {
  apolloClient: {
    mocks: [
      GetTestResultForPrintDocumentMock(
        { id: "covid_undetermined" },
        {
          ...testResult,
          results: [
            { disease: { name: "COVID-19" }, testResult: "UNDETERMINED" },
          ],
        }
      ),
    ],
  },
};

/**
 * Multiplex Flu Positive
 */
export const WithPositiveFluMultiplex = Template.bind({});
WithPositiveFluMultiplex.args = {
  ...defaultProps,
  testResultId: "multiplex_positive",
};
WithPositiveFluMultiplex.parameters = {
  apolloClient: {
    mocks: [
      GetTestResultForPrintDocumentMock(
        { id: "multiplex_positive" },
        {
          ...testResult,
          results: [
            { disease: { name: "COVID-19" }, testResult: "NEGATIVE" },
            { disease: { name: "Flu A" }, testResult: "POSITIVE" },
            { disease: { name: "Flu B" }, testResult: "NEGATIVE" },
          ],
        }
      ),
    ],
  },
};

/**
 * Multiplex covid positive
 */
export const WithPositiveCovidMultiplex = Template.bind({});
WithPositiveCovidMultiplex.args = {
  ...defaultProps,
  testResultId: "multiplex_covid_positive",
};
WithPositiveCovidMultiplex.parameters = {
  apolloClient: {
    mocks: [
      GetTestResultForPrintDocumentMock(
        { id: "multiplex_covid_positive" },
        {
          ...testResult,
          results: [
            { disease: { name: "COVID-19" }, testResult: "POSITIVE" },
            { disease: { name: "Flu A" }, testResult: "NEGATIVE" },
            { disease: { name: "Flu B" }, testResult: "NEGATIVE" },
          ],
        }
      ),
    ],
  },
};

/**
 * Multiplex all positive
 */
export const WithPositiveAllMultiplex = Template.bind({});
WithPositiveAllMultiplex.args = {
  ...defaultProps,
  testResultId: "multiplex_all_positive",
};
WithPositiveAllMultiplex.parameters = {
  apolloClient: {
    mocks: [
      GetTestResultForPrintDocumentMock(
        { id: "multiplex_all_positive" },
        {
          ...testResult,
          results: [
            { disease: { name: "COVID-19" }, testResult: "POSITIVE" },
            { disease: { name: "Flu A" }, testResult: "POSITIVE" },
            { disease: { name: "Flu B" }, testResult: "POSITIVE" },
          ],
        }
      ),
    ],
  },
};

/**
 * Multiplex all negative
 */
export const WithNegativeAllMultiplex = Template.bind({});
WithNegativeAllMultiplex.args = {
  ...defaultProps,
  testResultId: "multiplex_all_negative",
};
WithNegativeAllMultiplex.parameters = {
  apolloClient: {
    mocks: [
      GetTestResultForPrintDocumentMock(
        { id: "multiplex_all_negative" },
        {
          ...testResult,
          results: [
            { disease: { name: "COVID-19" }, testResult: "NEGATIVE" },
            { disease: { name: "Flu A" }, testResult: "NEGATIVE" },
            { disease: { name: "Flu B" }, testResult: "NEGATIVE" },
          ],
        }
      ),
    ],
  },
};

/**
 * Multiplex undetermined
 */
export const WithUndeterminedAllMultiplex = Template.bind({});
WithUndeterminedAllMultiplex.args = {
  ...defaultProps,
  testResultId: "multiplex_undetermined",
};
WithUndeterminedAllMultiplex.parameters = {
  apolloClient: {
    mocks: [
      GetTestResultForPrintDocumentMock(
        { id: "multiplex_undetermined" },
        {
          ...testResult,
          results: [
            { disease: { name: "COVID-19" }, testResult: "UNDETERMINED" },
            { disease: { name: "Flu A" }, testResult: "UNDETERMINED" },
            { disease: { name: "Flu B" }, testResult: "UNDETERMINED" },
          ],
        }
      ),
    ],
  },
};
