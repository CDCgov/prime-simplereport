import { Story, Meta } from "@storybook/react";

import { Locked } from "./Locked";

export default {
  title: "App/Login/Locked",
  component: Locked,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <Locked {...args} />;

export const Default = Template.bind({});
Default.args = {};
