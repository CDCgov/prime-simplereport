import { StoryFn, Meta } from "@storybook/react";

import { Card } from "./Card";

export default {
  title: "Components/Card/Card",
  component: Card,
  argTypes: {
    logo: { control: "boolean" },
  },
} as Meta;

const Template: StoryFn = (args) => <Card {...args} />;

export const WithChildren = Template.bind({});
WithChildren.args = {
  bodyKicker: "Heading",
  children: (
    <>
      <p>This is some test content</p>
    </>
  ),
};
