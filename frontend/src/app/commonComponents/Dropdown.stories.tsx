import { StoryFn, Meta } from "@storybook/react";
import { useState } from "react";

import Dropdown from "./Dropdown";

const fruits = ["Apple", "Orange", "Pear"];

const fruitOptions = Object.entries(fruits).map(([value, key]) => ({
  value: value,
  label: key,
}));

export default {
  title: "Components/Form controls/Dropdown",
  component: Dropdown,
  parameters: { layout: "fullscreen" },
  argTypes: {},
  args: {
    name: "dropdown",
    label: "Dropdown",
    errorMessage: "Helpful error message",
    options: fruitOptions,
    defaultSelect: true,
  },
} as Meta;

type Props = React.ComponentProps<typeof Dropdown>;

const Template: StoryFn<Props> = (args) => {
  const [fruit, setFruit] = useState("");

  return (
    <div className="grid-container margin-top-2">
      <Dropdown
        {...args}
        selectedValue={fruit}
        onChange={(evt) => setFruit(evt.target.value)}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};
