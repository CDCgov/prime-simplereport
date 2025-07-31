import { StoryFn, Meta } from "@storybook/react-webpack5";
import React from "react";

import { MultiSelectDropdownOption } from "./MultiSelectDropdown/MultiSelectDropdown";
import MultiSelect, { MultiSelectProps } from "./MultiSelect";

export default {
  title: "Components/Form controls/MultiSelect",
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
    ] as Array<MultiSelectDropdownOption>,
  } as MultiSelectProps,
} as Meta;

type Props = React.ComponentProps<typeof MultiSelect>;

const Template: StoryFn<Props> = (args) => (
  <>
    <MultiSelect {...args} />
  </>
);

export const Default = Template.bind({});
Default.args = {};
