import { Story, Meta } from "@storybook/react";
import { uniqueId } from "lodash";

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
  dateTested: new Date(),
  result: "NEGATIVE",
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
};

const Template: Story<TestResultPrintModalProps> = (args) => {
  return <DetachedTestResultPrintModal {...args} />;
};

export const Default = Template.bind({});
Default.args = defaultProps;
