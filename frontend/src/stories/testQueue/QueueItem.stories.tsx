import { Meta, Story } from "@storybook/react";
import { uniqueId } from "lodash";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import createMockStore from "redux-mock-store";

import QueueItem, { QueueItemProps } from "../../app/testQueue/QueueItem";
import { getMocks, StoryGraphQLProvider } from "../storyMocks";

const mockStore = createMockStore([]);

export default {
  title: "App/Test queue/Queue item",
  component: QueueItem,
  parameters: {
    layout: "fullscreen",
    msw: getMocks(
      "GetPatientsLastResult",
      "SendPatientLinkSms",
      "UpdateAOE",
      "RemovePatientFromQueue"
    ),
  },
  decorators: [
    (Story) => (
      <StoryGraphQLProvider>
        <Story />
      </StoryGraphQLProvider>
    ),
  ],
  argTypes: {},
  args: {},
} as Meta;

const store = mockStore({
  organization: { name: "An Organization " },
});

const Template: Story<QueueItemProps> = (args) => {
  return (
    <MemoryRouter>
      <Provider store={store}>
        <QueueItem {...args} />;
      </Provider>
    </MemoryRouter>
  );
};

const device = {
  name: "TestPro 4000",
  internalId: "tp4000",
  testLength: 0.1,
  supportedDiseases: [{ internalId: "d1", name: "COVID-19", loinc: "12345" }],
};

const defaultProps: QueueItemProps = {
  internalId: "abc-123",
  patient: {
    internalId: "def-456",
    firstName: "Jennifer",
    middleName: "K",
    lastName: "Finley",
    telephone: "571-867-5309",
    birthDate: "2002-07-21",
    phoneNumbers: [
      {
        number: "571-867-5309",
        type: "MOBILE",
      },
    ],
    email: "jennifer@finley.com",
    emails: ["jennifer@finley.com"],
    testResultDelivery: "SMS",
    gender: "male",
  },
  devices: [device],
  deviceSpecimenTypes: [
    {
      internalId: "fake-dst-id",
      deviceType: device,
      specimenType: {
        internalId: "fake-swab-id",
        name: "Fake Swab Type",
      },
    },
  ],
  selectedDeviceSpecimenTypeId: "fake-dst-id",
  // askOnEntry prop is incorrectly typed as "string" in the component
  askOnEntry: {
    noSymptoms: undefined,
    pregnancy: "no",
    symptoms: "{}",
  } as any,
  selectedDeviceId: "tp4000",
  selectedDeviceTestLength: 0.1,
  selectedTestResults: [
    { disease: { name: "COVID-19" }, testResult: "UNKNOWN" },
  ],
  dateTestedProp: "",
  refetchQueue: () => {},
  facilityName: "Facility Name",
  facilityId: "100",
  setStartTestPatientId: () => {},
  startTestPatientId: "",
};

export const Unstarted = Template.bind({});
Unstarted.args = {
  ...defaultProps,
  internalId: uniqueId(),
};

export const FilledOut = Template.bind({});
FilledOut.args = {
  ...defaultProps,
  internalId: uniqueId(),
  askOnEntry: {
    noSymptoms: true,
    pregnancy: "no",
    symptoms: "{}",
  } as any,
  dateTestedProp: "2021-03-03T14:40:00Z",
};

export const ReadyIndicator = Template.bind({});
ReadyIndicator.args = {
  ...defaultProps,
  internalId: "completed-timer",
  askOnEntry: {
    noSymptoms: true,
    pregnancy: "no",
    symptoms: "{}",
  } as any,
};

export const CompletedIndicator = Template.bind({});
CompletedIndicator.args = {
  ...defaultProps,
  internalId: "completed-timer",
  askOnEntry: {
    noSymptoms: true,
    pregnancy: "no",
    symptoms: "{}",
  } as any,
  selectedTestResults: [
    { disease: { name: "COVID-19" }, testResult: "NEGATIVE" },
  ],
};

export const FailOnSubmit = Template.bind({});
FailOnSubmit.args = {
  ...defaultProps,
  internalId: "completed_timer",
  askOnEntry: {
    noSymptoms: true,
    pregnancy: "no",
    symptoms: "{}",
  } as any,
  selectedTestResults: [
    { disease: { name: "COVID-19" }, testResult: "NEGATIVE" },
  ],
  patient: {
    ...defaultProps.patient,
    internalId: "this-should-fail",
  },
};
