import { Story, Meta } from "@storybook/react";

import OrganizationForm from "./OrganizationForm";

export default {
  title: "App/Organization create",
  component: OrganizationForm,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <OrganizationForm {...args} />;

export const Default = Template.bind({});
Default.args = {};
