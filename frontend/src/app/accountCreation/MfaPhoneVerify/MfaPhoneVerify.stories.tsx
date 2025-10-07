import { StoryFn, Meta } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";

import { MfaPhoneVerify } from "./MfaPhoneVerify";

export default {
  title: "App/Account set up/Step 3b: Verify Voice Call security code",
  component: MfaPhoneVerify,
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => (
  <MemoryRouter initialEntries={[{ state: { contact: "(530) 867-5309" } }]}>
    <MfaPhoneVerify {...args} />
  </MemoryRouter>
);

export const Default = Template.bind({});
Default.args = {};
