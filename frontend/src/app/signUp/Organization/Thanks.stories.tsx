import { Story, Meta } from "@storybook/react";

import { Thanks } from "./Thanks";

export default {
  title: "App/Organization create/Sign up success",
  component: Thanks,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <Thanks {...args} />;

export const Default = Template.bind({});
Default.args = {};