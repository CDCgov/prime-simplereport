import { Story, Meta } from "@storybook/react";

import { LogIn } from "./LogIn";

export default {
  title: "App/Login/Log in",
  component: LogIn,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <LogIn {...args} />;

export const Default = Template.bind({});
Default.args = {};
