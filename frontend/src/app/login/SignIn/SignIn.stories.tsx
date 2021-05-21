import { Story, Meta } from "@storybook/react";

import { SignIn } from "./SignIn";

export default {
  title: "App/Login/Sign in",
  component: SignIn,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <SignIn {...args} />;

export const Default = Template.bind({});
Default.args = {};
