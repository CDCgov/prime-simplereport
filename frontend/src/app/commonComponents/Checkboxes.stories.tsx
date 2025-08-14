import { StoryFn, Meta } from "@storybook/react-webpack5";
import React, { useState } from "react";

import Checkboxes from "./Checkboxes";

export default {
  title: "Components/Form controls/Checkboxes",
  component: Checkboxes,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
  args: {
    name: "radio-input",
    label: "Radio button",
    legend: "Fruit",
    errorMessage: "Helpful error message",
  },
} as Meta;

type Props = React.ComponentProps<typeof Checkboxes>;

const Template: StoryFn<Props> = (args) => {
  const [fruits, setFruits] = useState({
    apple: false,
    orange: false,
    pear: false,
  });
  const boxes = [
    {
      label: "Apple",
      value: "apple",
      checked: fruits.apple,
    },
    {
      label: "Orange",
      value: "orange",
      checked: fruits.orange,
    },
    {
      label: "Pear",
      value: "pear",
      checked: fruits.pear,
    },
  ];

  const checkboxArgs = {
    ...args,
    ...{ boxes },
  };

  return (
    <div className="grid-container margin-top-2">
      <Checkboxes
        {...checkboxArgs}
        onChange={(e) =>
          setFruits({ ...fruits, [e.target.value]: e.target.checked })
        }
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};
