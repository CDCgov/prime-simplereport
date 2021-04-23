import { Story, Meta } from "@storybook/react";

import { CardContainer } from "../app/commonComponents/CardContainer";

export default {
  title: "App/Common/CardContainer",
  component: CardContainer,
  argTypes: {
    logo: { control: "boolean" },
  },
} as Meta;

const Template: Story = (args) => <CardContainer {...args} />;

export const WithChildren = Template.bind({});
WithChildren.args = {
  children: (
    <>
      <p>This is some test content</p>
    </>
  ),
};
