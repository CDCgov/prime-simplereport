import { Meta, StoryFn } from "@storybook/react";
import { ComponentProps } from "react";

import { getMocks, StoryGraphQLProvider } from "../../../stories/storyMocks";

import AoEModalForm from "./AoEModalForm";

export default {
  title: "App/Test Queue/AoE Modal Form",
  component: AoEModalForm,
  parameters: {
    msw: getMocks("GetPatientsLastResult"),
  },
  argTypes: {
    saveCallback: { action: "saved" },
  },
} as Meta;

const Template: StoryFn<ComponentProps<typeof AoEModalForm>> = (args) => (
  <StoryGraphQLProvider>
    <AoEModalForm {...args} />
  </StoryGraphQLProvider>
);

const patient = {
  firstName: "Pauline",
  lastName: "Nida",
  internalId: "123abc",
  birthDate: "2002-01-29",
  phoneNumbers: [
    { type: "MOBILE", number: "(703) 867-5309" },
    { type: "MOBILE", number: "(555) 123-4567" },
  ],
  testResultDelivery: "SMS",
  middleName: "",
  lastTest: {
    dateAdded: "",
    result: "UNKNOWN",
    dateTested: "",
    deviceTypeModel: "",
  },
};

export const Default = Template.bind({});
Default.args = {
  patient,
};
