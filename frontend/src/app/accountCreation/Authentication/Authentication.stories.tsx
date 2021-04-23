import { Story, Meta } from "@storybook/react";

import { Authentication } from "./Authentication";

export default {
  title: "App/Account set up/Step 3: Authentication",
  component: Authentication,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <Authentication {...args} />;

export const Default = Template.bind({});
Default.args = {};
