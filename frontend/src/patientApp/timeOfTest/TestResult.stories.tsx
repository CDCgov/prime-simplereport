import { Meta } from "@storybook/react";
import { cloneDeep } from "lodash";
import createMockStore from "redux-mock-store";
import { Provider } from "react-redux";

import Page from "../../app/commonComponents/Page/Page";
import PatientHeader from "../PatientHeader";
import { VerifyV2Response } from "../PxpApiService";

import TestResult from "./TestResult";

const mockStore = createMockStore([]);

export default {
  title: "Pxp Test Results",
  component: TestResult,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
  args: {},
} as Meta;

const data = {
  testResult: {
    testEventId: "12321312",
    result: "POSITIVE" as TestResult,
    results: [
      { disease: { name: "COVID-19" }, result: "POSITIVE" },
    ] as PxpMultiplexResult[],
    dateTested: new Date("2021-08-20").toDateString(),
    correctionStatus: "ORIGINAL",
    deviceType: {
      name: "Fake device",
      model: "Fake model",
    },
    organization: {
      name: "Fake organization",
    },
    facility: {
      name: "Facility Name",
      cliaNumber: "12D4567890",
      street: "555 Fake St",
      streetTwo: "APT 1",
      state: "NC",
      city: "Raleigh",
      zipCode: "27601",
      phone: "6318675309",
      orderingProvider: {
        firstName: "Ordering",
        lastName: "Provider",
        middleName: "OP Middle Name",
        npi: "fake-npi",
      },
    },
    patient: {
      firstName: "First",
      middleName: "Middle",
      lastName: "Last",
      birthDate: "08/07/1990",
    },
  } as VerifyV2Response,
};

export const PositiveCovid = () => {
  let store = mockStore(data);
  return (
    <Provider store={store}>
      <Page>
        <PatientHeader />
        <TestResult />
      </Page>
    </Provider>
  );
};

export const NegativeCovid = () => {
  let editedData = cloneDeep(data);
  editedData.testResult.results = [
    { disease: { name: "COVID-19" }, result: "NEGATIVE" },
  ];
  let store = mockStore(editedData);
  return (
    <Provider store={store}>
      <Page>
        <PatientHeader />
        <TestResult />
      </Page>
    </Provider>
  );
};

export const InconclusiveCovid = () => {
  let editedData = cloneDeep(data);
  editedData.testResult.results = [
    { disease: { name: "COVID-19" }, result: "UNDETERMINED" },
  ];
  let store = mockStore(editedData);
  return (
    <Provider store={store}>
      <Page>
        <PatientHeader />
        <TestResult />
      </Page>
    </Provider>
  );
};

export const PositiveFluMultiplex = () => {
  let editedData = cloneDeep(data);
  editedData.testResult.results = [
    { disease: { name: "Flu B" }, result: "NEGATIVE" },
    { disease: { name: "Flu A" }, result: "POSITIVE" },
    { disease: { name: "COVID-19" }, result: "NEGATIVE" },
  ];
  let store = mockStore(editedData);
  return (
    <Provider store={store}>
      <Page>
        <PatientHeader />
        <TestResult />
      </Page>
    </Provider>
  );
};

export const PositiveCovidMultiplex = () => {
  let editedData = cloneDeep(data);
  editedData.testResult.results = [
    { disease: { name: "Flu B" }, result: "NEGATIVE" },
    { disease: { name: "Flu A" }, result: "NEGATIVE" },
    { disease: { name: "COVID-19" }, result: "POSITIVE" },
  ];
  let store = mockStore(editedData);
  return (
    <Provider store={store}>
      <Page>
        <PatientHeader />
        <TestResult />
      </Page>
    </Provider>
  );
};

export const PositiveAllMultiplex = () => {
  let editedData = cloneDeep(data);
  editedData.testResult.results = [
    { disease: { name: "Flu A" }, result: "POSITIVE" },
    { disease: { name: "Flu B" }, result: "POSITIVE" },
    { disease: { name: "COVID-19" }, result: "POSITIVE" },
  ];
  let store = mockStore(editedData);
  return (
    <Provider store={store}>
      <Page>
        <PatientHeader />
        <TestResult />
      </Page>
    </Provider>
  );
};

export const NegativeAllMultiplex = () => {
  let editedData = cloneDeep(data);
  editedData.testResult.results = [
    { disease: { name: "Flu B" }, result: "NEGATIVE" },
    { disease: { name: "Flu A" }, result: "NEGATIVE" },
    { disease: { name: "COVID-19" }, result: "NEGATIVE" },
  ];
  let store = mockStore(editedData);
  return (
    <Provider store={store}>
      <Page>
        <PatientHeader />
        <TestResult />
      </Page>
    </Provider>
  );
};

export const UndeterminedAllMultiplex = () => {
  let editedData = cloneDeep(data);
  editedData.testResult.results = [
    { disease: { name: "Flu B" }, result: "UNDETERMINED" },
    { disease: { name: "Flu A" }, result: "UNDETERMINED" },
    { disease: { name: "COVID-19" }, result: "UNDETERMINED" },
  ];
  let store = mockStore(editedData);
  return (
    <Provider store={store}>
      <Page>
        <PatientHeader />
        <TestResult />
      </Page>
    </Provider>
  );
};
