import { StoryFn, Meta } from "@storybook/react-webpack5";

import Optional from "./Optional";

export default {
  title: "Components/Form controls/Optional",
  component: Optional,
  args: {
    label: "Label",
  },
} as Meta;

type Props = React.ComponentProps<typeof Optional>;

const Template: StoryFn<Props> = (args) => <Optional {...args} />;

export const Default = Template.bind({});
