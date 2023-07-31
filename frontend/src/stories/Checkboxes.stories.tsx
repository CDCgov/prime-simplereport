import { StoryFn, Meta } from "@storybook/react";
import React, { useState } from "react";

import Checkboxes from "../app/commonComponents/Checkboxes";

export default {
  title: "Components/Form controls/Checkbox",
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
    boxes: [
      {
        label: "Apple",
        value: "apple",
        checked: false,
      },
      {
        label: "Orange",
        value: "orange",
        checked: false,
      },
      {
        label: "Pear",
        value: "pear",
        checked: false,
      },
    ],
  },
} as Meta;

type Props = React.ComponentProps<typeof Checkboxes>;

const Template: StoryFn<Props> = (args) => {
  const [fruits, setFruits] = useState({});

  return (
    <div className="grid-container margin-top-2">
      <Checkboxes
        {...args}
        onChange={(e) =>
          setFruits({ ...fruits, [e.target.value]: e.target.checked })
        }
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};
