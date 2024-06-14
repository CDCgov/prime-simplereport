import { StoryFn, Meta } from "@storybook/react";

import YesNoNotSureRadioGroup from "./YesNoNotSureRadioGroup";

export default {
  title: "Components/Form controls/Yes, No, Not Sure Radio Group",
  component: YesNoNotSureRadioGroup,
  argTypes: {},
  args: {
    legend: "Question with a Yes/No/Not Sure answer?",
    name: "radioGroup1",
    value: undefined,
    onChange: () => {},
    onBlur: () => {},
    validationStatus: undefined,
    errorMessage: "This is an error message.",
    hintText: undefined,
  },
} as Meta;

type Props = React.ComponentProps<typeof YesNoNotSureRadioGroup>;

const RadioGroupTemplate: StoryFn<Props> = (args) => (
  <div className="margin-9">
    <YesNoNotSureRadioGroup {...args} />
  </div>
);

export const Default = RadioGroupTemplate.bind({});
Default.args = {};

export const WithHint = RadioGroupTemplate.bind({});
WithHint.args = {
  hintText: "more context for the question",
};

export const PreSelectedAnswer = RadioGroupTemplate.bind({});
PreSelectedAnswer.args = {
  value: "YES",
};

export const OnError = RadioGroupTemplate.bind({});
OnError.args = {
  validationStatus: "error",
  errorMessage: "Oops something went wrong!",
};
