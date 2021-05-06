import { Story, Meta } from "@storybook/react";

import RadioGroup from "../app/commonComponents/RadioGroup";

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

const Template: Story<Props> = (args) => (
  <div className="grid-container margin-top-2">
    <RadioGroup {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {};

export const Tile = Template.bind({});
Tile.args = {
  variant: "tile",
};

export const labelDescription = Template.bind({});
labelDescription.args = {
  buttons: [
    {
      label: "Apple",
      value: "apple",
      labelDescription: "Text that describes the fruit",
    },
    {
      label: "Orange",
      value: "orange",
      labelDescription: "Text that describes the fruit",
    },
    {
      label: "Pear",
      value: "pear",
      labelDescription: "Text that describes the fruit",
    },
  ],
};
