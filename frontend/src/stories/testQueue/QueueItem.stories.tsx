import { Story, Meta } from "@storybook/react";

import QueueItem, { QueueItemProps } from "../../app/testQueue/QueueItem";
import { getMocks, StoryGraphQLProvider } from "../storyMocks";

export default {
  title: "App/Test queue/Queue item",
  component: QueueItem,
  parameters: {
    layout: "fullscreen",
    msw: getMocks(
      "EditQueueItem",
      "SubmitTestResults",
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

const Template: Story<QueueItemProps> = (args) => <QueueItem {...args} />;

const defaultProps: QueueItemProps = {
  internalId: "abc-123",
  patient: {
    internalId: "def-456",
    firstName: "Jennifer",
    middleName: "K",
    lastName: "Finley",
    telephone: "571-867-5309",
    birthDate: "2002-07-21",
  },
  devices: [
    {
      name: "TestPro 4000",
      internalId: "tp4000",
      testLength: 10,
    },
  ],
  // askOnEntry prop is incorrectly typed as "string" in the component
  askOnEntry: {
    noSymptoms: true,
    firstTest: true,
    pregnancy: "no",
    symptoms: "{}",
  } as any,
  selectedDeviceId: "tp4000",
  selectedDeviceTestLength: 10,
  selectedTestResult: "NEGATIVE",
  defaultDevice: {
    internalId: "tp4000",
  },
  dateTestedProp: "2021-03-03T14:40:00Z",
  refetchQueue: () => {},
  facilityId: "100",
  patientLinkId: "200",
};

export const Item = Template.bind({});
Item.args = {
  ...defaultProps,
};
