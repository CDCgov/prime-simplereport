import { StoryFn, Meta } from "@storybook/react";

import {
  featureList,
  NewFeatureTag,
} from "../app/commonComponents/NewFeatureTag";

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
