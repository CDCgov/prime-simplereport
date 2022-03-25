import { Story, Meta } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";

import { MfaSmsVerify } from "./MfaSmsVerify";

export default {
  title: "App/Account set up/Step 3b: Verify SMS security code",
  component: MfaSmsVerify,
  argTypes: {},
} as Meta;

const Template: Story = (args) => (
  <MemoryRouter initialEntries={[{ state: { contact: "(530) 867-5309" } }]}>
    <MfaSmsVerify {...args} />
  </MemoryRouter>
);

export const Default = Template.bind({});
Default.args = {};
