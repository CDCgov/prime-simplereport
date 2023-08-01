import { StoryFn, Meta } from "@storybook/react";

import Button from "./Button";

export default {
  title: "Components/Button",
  component: Button,
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => <Button {...args} />;

export const Default = Template.bind({});
Default.args = { label: "Button" };
