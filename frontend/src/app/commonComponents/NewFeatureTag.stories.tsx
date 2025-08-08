import { StoryFn, Meta } from "@storybook/react-webpack5";

import { featureList, NewFeatureTag } from "./NewFeatureTag";

export default {
  title: "Components/NewFeatureTag",
  component: NewFeatureTag,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    feature: {
      options: [...featureList, undefined],
      control: { type: "radio" },
    },
    customEndDate: {
      control: { type: "text" },
    },
  },
  args: {},
} as Meta;

type Props = React.ComponentProps<typeof NewFeatureTag>;

const Template: StoryFn<Props> = (args: Props) => <NewFeatureTag {...args} />;

const date = new Date();
date.setMonth(date.getMonth() + 1);

export const Default = Template.bind({});
Default.args = {
  customEndDate: date.toLocaleDateString(),
};
