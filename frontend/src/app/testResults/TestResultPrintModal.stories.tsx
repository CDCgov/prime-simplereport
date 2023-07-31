import { Meta, StoryFn } from "@storybook/react";
import { uniqueId, cloneDeep } from "lodash";

import {
  DetachedTestResultPrintModal,
  TestResultPrintModalProps,
} from "./TestResultPrintModal";

export default {
  title: "Print test results",
  component: DetachedTestResultPrintModal,
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

const defaultProps: TestResultPrintModalProps = {
  data: { testResult } as any,
  testResultId: uniqueId(),
  closeModal: () => {},
  hardcodedPrintDate: "8/24/2021, 9:44:25 AM",
};

const positiveCovidProps = cloneDeep(defaultProps);
positiveCovidProps.data.testResult.results = [
  { disease: { name: "COVID-19" }, testResult: "POSITIVE" },
];

const undeterminedCovidProps = cloneDeep(defaultProps);
undeterminedCovidProps.data.testResult.results = [
  { disease: { name: "COVID-19" }, testResult: "UNDETERMINED" },
];

const positiveFluMultiplexProps = cloneDeep(defaultProps);
positiveFluMultiplexProps.data.testResult.results = [
  { disease: { name: "COVID-19" }, testResult: "NEGATIVE" },
  { disease: { name: "Flu A" }, testResult: "POSITIVE" },
  { disease: { name: "Flu B" }, testResult: "NEGATIVE" },
];

const positiveCovidMultiplexProps = cloneDeep(defaultProps);
positiveCovidMultiplexProps.data.testResult.results = [
  { disease: { name: "COVID-19" }, testResult: "POSITIVE" },
  { disease: { name: "Flu A" }, testResult: "NEGATIVE" },
  { disease: { name: "Flu B" }, testResult: "NEGATIVE" },
];

const positiveAllMultiplexProps = cloneDeep(defaultProps);
positiveAllMultiplexProps.data.testResult.results = [
  { disease: { name: "COVID-19" }, testResult: "POSITIVE" },
  { disease: { name: "Flu A" }, testResult: "POSITIVE" },
  { disease: { name: "Flu B" }, testResult: "POSITIVE" },
];

const negativeAllMultiplexProps = cloneDeep(defaultProps);
negativeAllMultiplexProps.data.testResult.results = [
  { disease: { name: "COVID-19" }, testResult: "NEGATIVE" },
  { disease: { name: "Flu A" }, testResult: "NEGATIVE" },
  { disease: { name: "Flu B" }, testResult: "NEGATIVE" },
];

const undeterminedAllMultiplexProps = cloneDeep(defaultProps);
undeterminedAllMultiplexProps.data.testResult.results = [
  { disease: { name: "COVID-19" }, testResult: "UNDETERMINED" },
  { disease: { name: "Flu A" }, testResult: "UNDETERMINED" },
  { disease: { name: "Flu B" }, testResult: "UNDETERMINED" },
];

const Template: StoryFn<TestResultPrintModalProps> = (args) => {
  return <DetachedTestResultPrintModal {...args} />;
};

export const Default = Template.bind({});
Default.args = defaultProps;

export const WithPositiveCovid = Template.bind({});
WithPositiveCovid.args = positiveCovidProps;

export const WithUndeterminedCovid = Template.bind({});
WithUndeterminedCovid.args = undeterminedCovidProps;

export const WithPositiveFluMultiplex = Template.bind({});
WithPositiveFluMultiplex.args = positiveFluMultiplexProps;

export const WithPositiveCovidMultiplex = Template.bind({});
WithPositiveCovidMultiplex.args = positiveCovidMultiplexProps;

export const WithPositiveAllMultiplex = Template.bind({});
WithPositiveAllMultiplex.args = positiveAllMultiplexProps;

export const WithNegativeAllMultiplex = Template.bind({});
WithNegativeAllMultiplex.args = negativeAllMultiplexProps;

export const WithUndeterminedAllMultiplex = Template.bind({});
WithUndeterminedAllMultiplex.args = undeterminedAllMultiplexProps;
