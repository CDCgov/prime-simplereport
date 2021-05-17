import { Story, Meta } from "@storybook/react";

import { Authenticator } from "./Authenticator";

export default {
  title: "App/Login/Authenticator",
  component: Authenticator,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <Authenticator {...args} />;

export const Default = Template.bind({});
Default.args = {};
