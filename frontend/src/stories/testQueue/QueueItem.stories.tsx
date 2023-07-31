import { Meta, StoryFn } from "@storybook/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import createMockStore from "redux-mock-store";

import QueueItem, {
  DevicesMap,
  QueueItemProps,
} from "../../app/testQueue/QueueItem";
import { PhoneType } from "../../generated/graphql";
import { getMocks, StoryGraphQLProvider } from "../storyMocks";
import mockSupportedDiseaseMultiplex from "../../app/testQueue/mocks/mockSupportedDiseaseMultiplex";
import mockSupportedDiseaseCovid from "../../app/testQueue/mocks/mockSupportedDiseaseCovid";

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

const Template: StoryFn<QueueItemProps> = (args) => {
  return (
    <MemoryRouter>
      <Provider store={store}>
        <QueueItem {...args} />;
      </Provider>
    </MemoryRouter>
  );
};

const facilityInfo = {
  id: "f02cfff5-1921-4293-beff-e2a5d03e1fda",
  name: "Testing Site",
  deviceTypes: [
    {
      internalId: "ee4f40b7-ac32-4709-be0a-56dd77bb9609",
      name: "LumiraDX",
      testLength: 15,
      supportedDiseaseTestPerformed: mockSupportedDiseaseCovid,
      swabTypes: [
        {
          name: "Swab of internal nose",
          internalId: "8596682d-6053-4720-8a39-1f5d19ff4ed9",
          typeCode: "445297001",
        },
        {
          name: "Nasopharyngeal swab",
          internalId: "f127ef55-4133-4556-9bca-33615d071e8d",
          typeCode: "258500001",
        },
      ],
    },
    {
      internalId: "5c711888-ba37-4b2e-b347-311ca364efdb",
      name: "Abbott BinaxNow",
      testLength: 15,
      supportedDiseaseTestPerformed: mockSupportedDiseaseCovid,
      swabTypes: [
        {
          name: "Swab of internal nose",
          internalId: "8596682d-6053-4720-8a39-1f5d19ff4ed9",
          typeCode: "445297001",
        },
      ],
    },
    {
      internalId: "32b2ca2a-75e6-4ebd-a8af-b50c7aea1d10",
      name: "BD Veritor",
      testLength: 15,
      supportedDiseaseTestPerformed: mockSupportedDiseaseCovid,
      swabTypes: [
        {
          name: "Swab of internal nose",
          internalId: "8596682d-6053-4720-8a39-1f5d19ff4ed9",
          typeCode: "445297001",
        },
        {
          name: "Nasopharyngeal swab",
          internalId: "f127ef55-4133-4556-9bca-33615d071e8d",
          typeCode: "258500001",
        },
      ],
    },
    {
      internalId: "67109f6f-eaee-49d3-b8ff-c61b79a9da8e",
      name: "Multiplex",
      testLength: 15,
      supportedDiseaseTestPerformed: mockSupportedDiseaseMultiplex,
      swabTypes: [
        {
          name: "Swab of internal nose",
          internalId: "8596682d-6053-4720-8a39-1f5d19ff4ed9",
          typeCode: "445297001",
        },
        {
          name: "Nasopharyngeal swab",
          internalId: "f127ef55-4133-4556-9bca-33615d071e8d",
          typeCode: "258500001",
        },
      ],
    },
  ],
};

const devicesMap: DevicesMap = new Map();
facilityInfo.deviceTypes.map((d) => devicesMap.set(d.internalId, d));

const queueItemInfo = {
  internalId: "1b02363b-ce71-4f30-a2d6-d82b56a91b39",
  pregnancy: null,
  dateAdded: "2022-11-08 13:33:07.503",
  symptoms:
    '{"64531003":"false","103001002":"false","84229001":"false","68235000":"false","426000000":"false","49727002":"false","68962001":"false","422587007":"false","267036007":"false","62315008":"false","43724002":"false","36955009":"false","44169009":"false","422400008":"false","230145002":"false","25064002":"false","162397003":"false"}',
  symptomOnset: null,
  noSymptoms: null,
  deviceType: {
    internalId: "ee4f40b7-ac32-4709-be0a-56dd77bb9609",
    name: "LumiraDX",
    model: "LumiraDx SARS-CoV-2 Ag Test*",
    testLength: 15,
    supportedDiseaseTestPerformed: mockSupportedDiseaseCovid,
  },
  specimenType: {
    internalId: "8596682d-6053-4720-8a39-1f5d19ff4ed9",
    name: "Swab of internal nose",
    typeCode: "445297001",
  },
  patient: {
    internalId: "72b3ce1e-9d5a-4ad2-9ae8-e1099ed1b7e0",
    firstName: "Jennifer",
    middleName: "K",
    lastName: "Finley",
    telephone: "571-867-5309",
    birthDate: "2002-07-21",
    gender: "refused",
    testResultDelivery: null,
    preferredLanguage: null,
    email: "sywaporoce@mailinator.com",
    emails: ["sywaporoce@mailinator.com"],
    phoneNumbers: [
      {
        type: PhoneType.Mobile,
        number: "(553) 223-0559",
      },
      {
        type: PhoneType.Landline,
        number: "(669) 789-0799",
      },
    ],
  },
  results: [],
  dateTested: null,
  correctionStatus: "ORIGINAL",
  reasonForCorrection: null,
};
const defaultProps: QueueItemProps = {
  queueItem: queueItemInfo,
  facility: facilityInfo,
  devicesMap: devicesMap,
  refetchQueue: () => {},
  startTestPatientId: null,
  setStartTestPatientId: null,
};

export const Unstarted = Template.bind({});
Unstarted.args = {
  ...defaultProps,
};

export const FilledOut = Template.bind({});
FilledOut.args = {
  ...defaultProps,
  queueItem: {
    ...queueItemInfo,
    noSymptoms: true,
    pregnancy: "no",
    dateTested: "2021-03-03T14:40:00Z",
  },
};

export const ReadyIndicator = Template.bind({});
ReadyIndicator.args = {
  ...defaultProps,
  queueItem: {
    ...queueItemInfo,
    internalId: "completed-timer",
    noSymptoms: true,
    pregnancy: "no",
  },
};

export const CompletedIndicator = Template.bind({});
CompletedIndicator.args = {
  ...defaultProps,
  queueItem: {
    ...queueItemInfo,
    internalId: "completed-timer",
    noSymptoms: true,
    pregnancy: "no",
    results: [{ disease: { name: "COVID-19" }, testResult: "NEGATIVE" }],
  },
};

export const InvalidDevice = Template.bind({});
InvalidDevice.args = {
  ...defaultProps,
  queueItem: {
    ...queueItemInfo,
    noSymptoms: true,
    pregnancy: "no",
    results: [{ disease: { name: "COVID-19" }, testResult: "NEGATIVE" }],
    deviceType: {
      internalId: "invalid",
      name: "invalid",
      model: "invalid",
      testLength: 15,
    },
  },
};

export const InvalidSpecimen = Template.bind({});
InvalidSpecimen.args = {
  ...defaultProps,
  queueItem: {
    ...queueItemInfo,
    noSymptoms: true,
    pregnancy: "no",
    results: [{ disease: { name: "COVID-19" }, testResult: "NEGATIVE" }],
    specimenType: {
      internalId: "invalid",
      name: "invalid",
      typeCode: "invalid",
    },
  },
};
