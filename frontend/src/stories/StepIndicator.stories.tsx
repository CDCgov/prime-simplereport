import { Story, Meta } from "@storybook/react";

import StepIndicator from "../app/commonComponents/StepIndicator";

export default {
  title: "Components/Step indicator",
  component: StepIndicator,
  argTypes: {},
  args: {
    steps: [
      {
        label: "Apple",
        value: "apple",
        order: 0,
      },
      {
        label: "Orange",
        value: "orange",
        order: 1,
      },
      {
        label: "Pear",
        value: "pear",
        order: 2,
      },
    ],
    currentStepValue: "orange",
  },
} as Meta;

type Props = React.ComponentProps<typeof StepIndicator>;

const Template: Story<Props> = (args) => <StepIndicator {...args} />;

export const noLabels = Template.bind({});
noLabels.args = {
  noLabels: true,
};

export const SmallCounters = Template.bind({});
SmallCounters.args = {};
SmallCounters.parameters = {
  backgrounds: { default: "light gray" },
};
