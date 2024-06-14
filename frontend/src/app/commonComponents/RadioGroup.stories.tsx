import { StoryFn, Meta } from "@storybook/react";
import React, { useState } from "react";

import RadioGroup from "./RadioGroup";

export default {
  title: "Components/Form controls/Radio buttons",
  component: RadioGroup,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
  args: {
    name: "radio-input",
    label: "Radio button",
    legend: "Fruit",
    errorMessage: "Helpful error message",
    buttons: [
      {
        label: "Apple",
        value: "apple",
      },
      {
        label: "Orange",
        value: "orange",
      },
      {
        label: "Pear",
        value: "pear",
      },
    ],
  },
} as Meta;

type Props = React.ComponentProps<typeof RadioGroup>;

const Template: StoryFn<Props> = (args) => {
  const [fruit, setFruit] = useState("");

  return (
    <div className="grid-container margin-top-2">
      <RadioGroup {...args} selectedRadio={fruit} onChange={setFruit} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};

export const Tile = Template.bind({});
Tile.args = {
  variant: "tile",
  buttons: [
    {
      label: "Apple",
      value: "apple",
    },
    {
      label: "Orange",
      value: "orange",
      labelDescription:
        "This is optional text that can be used to describe the label in more detail.",
    },
    {
      label: "Pear",
      value: "pear",
    },
  ],
};
