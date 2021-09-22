import { Story, Meta } from "@storybook/react";

import { Analytics } from "./Analytics";

export default {
  title: "App/Analytics/COVID-19 testing data",
  component: Analytics,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <Analytics {...args} />;

export const Default = Template.bind({});
Default.args = {};
