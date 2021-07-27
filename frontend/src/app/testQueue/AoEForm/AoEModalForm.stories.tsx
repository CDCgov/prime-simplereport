import { Story, Meta } from "@storybook/react";
import { ComponentProps } from "react";

import AoEModalForm from "./AoEModalForm";

export default {
  title: "App/Test Queue/AoE Modal Form",
  component: AoEModalForm,
  argTypes: {
    logo: { control: "boolean" },
  },
} as Meta;

const Template: Story<ComponentProps<typeof AoEModalForm>> = (args) => (
  <AoEModalForm {...args} />
);

export const Default = Template.bind({});
Default.args = {};
