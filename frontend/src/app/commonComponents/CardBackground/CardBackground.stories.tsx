import { StoryFn, Meta } from "@storybook/react-webpack5";

import { CardBackground } from "./CardBackground";

export default {
  title: "Components/Card/Card background",
  component: CardBackground,
  argTypes: {
    logo: { control: "boolean" },
  },
} as Meta;

const Template: StoryFn = (args) => <CardBackground {...args} />;

export const WithChildren = Template.bind({});
WithChildren.args = {
  children: (
    <>
      <p>This is some test content</p>
    </>
  ),
};
