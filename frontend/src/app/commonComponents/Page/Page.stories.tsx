import { Story, Meta } from "@storybook/react";

import Page from "./Page";

export default {
  title: "Components/Page",
  component: Page,
  argTypes: {},
} as Meta;

const Template: Story = () => <Page />;

export const WithChildren = Template.bind({});
WithChildren.args = {
  children: (
    <>
      <p>This is some test content</p>
    </>
  ),
};
