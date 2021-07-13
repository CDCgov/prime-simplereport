import { Story, Meta } from "@storybook/react";

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

const Template: Story<Props> = (args) => <NewFeatureTag {...args} />;

export const Default = Template.bind({});
Default.args = {};
