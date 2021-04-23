import { Story, Meta } from "@storybook/react";

import { Card } from "../app/commonComponents/Card";

export default {
  title: "App/Components/Card",
  component: Card,
  argTypes: {
    logo: { control: "boolean" },
  },
} as Meta;

const Template: Story = (args) => <Card {...args} />;

export const WithChildren = Template.bind({});
WithChildren.args = {
  children: (
    <>
      <p>This is some test content</p>
    </>
  ),
};
