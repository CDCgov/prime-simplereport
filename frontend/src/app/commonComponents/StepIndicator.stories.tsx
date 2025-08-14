import { StoryFn, Meta } from "@storybook/react-webpack5";

import StepIndicator from "./StepIndicator";

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

const Template: StoryFn<Props> = (args) => <StepIndicator {...args} />;

export const NoLabels = Template.bind({});
NoLabels.args = {
  noLabels: true,
};

export const SmallCounters = Template.bind({});
SmallCounters.args = {};
SmallCounters.parameters = {
  backgrounds: { default: "light gray" },
};
