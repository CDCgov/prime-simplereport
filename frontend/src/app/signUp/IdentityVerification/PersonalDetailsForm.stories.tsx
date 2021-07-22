import { Story, Meta } from "@storybook/react";
import { withQuery } from "@storybook/addon-queryparams";

import PersonalDetailsForm from "./PersonalDetailsForm";

export default {
  title: "App/Identity Verification/Step 1: Personal Details",
  component: PersonalDetailsForm,
  argTypes: {},
  decorators: [withQuery],
  parameters: {
    query: {
      orgExternalId: "foo",
    },
  },
} as Meta;

const Template: Story = (args) => <PersonalDetailsForm {...args} />;

export const Default = Template.bind({});
Default.args = {};
