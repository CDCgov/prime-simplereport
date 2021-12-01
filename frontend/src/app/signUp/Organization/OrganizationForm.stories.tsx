import { Story, Meta } from "@storybook/react";

import OrganizationForm from "./OrganizationForm";

export default {
  title: "App/Sign up/Step 2b: Organization form",
  component: OrganizationForm,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <OrganizationForm {...args} />;

export const Default = Template.bind({});
Default.args = {};
