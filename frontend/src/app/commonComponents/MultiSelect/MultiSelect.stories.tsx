import { Story, Meta } from "@storybook/react";
import React from "react";

import { ComboBoxOption } from "./ComboBox/ComboBox";
import MultiSelect, { MultiSelectProps } from "./MultiSelect";

export default {
  title: "MultiSelect",
  component: MultiSelect,
  argTypes: {},
  args: {
    name: "Favorite Fruit",
    label: "Favorite Fruit",
    onChange: () => {},
    options: [
      { label: "Apples", value: "Apples" },
      { label: "Bananas", value: "Bananas" },
      { label: "Blueberries", value: "Blueberries" },
      { label: "Grapes", value: "Grapes" },
      { label: "Oranges", value: "Oranges" },
      { label: "Strawberries", value: "Strawberries" },
    ] as Array<ComboBoxOption>,
  } as MultiSelectProps,
} as Meta;

type Props = React.ComponentProps<typeof MultiSelect>;

const Template: Story<Props> = (args) => (
  <>
    <MultiSelect {...args} />
  </>
);

export const Default = Template.bind({});
Default.args = {};
