import { Story, Meta } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";

import { getMocks } from "../../../stories/storyMocks";

import { MfaGoogleAuth } from "./MfaGoogleAuth";

export default {
  title: "App/Account set up/Step 3a: Google Authenticator MFA",
  component: MfaGoogleAuth,
  parameters: {
    msw: getMocks("enrollTotpMfa"),
  },
  argTypes: {},
} as Meta;

const Template: Story = (args) => (
  <MemoryRouter initialEntries={["/"]}>
    <MfaGoogleAuth {...args} />
  </MemoryRouter>
);

export const Default = Template.bind({});
Default.args = {};
