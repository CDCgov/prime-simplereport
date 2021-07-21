import { Story, Meta } from "@storybook/react";

import PersonalDetailsForm from "./PersonalDetailsForm";

export default {
  title: "App/Identity Verification/Step 1: Personal Details",
  component: PersonalDetailsForm,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <PersonalDetailsForm {...args} />;

export const Default = Template.bind({});
Default.args = {};
