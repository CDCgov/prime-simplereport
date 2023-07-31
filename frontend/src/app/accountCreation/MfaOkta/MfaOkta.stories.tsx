import { StoryFn, Meta } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";

import { getMocks } from "../../../stories/storyMocks";

import { MfaOkta } from "./MfaOkta";

export default {
  title: "App/Account set up/Step 3a: Okta Verify MFA",
  component: MfaOkta,
  parameters: {
    msw: getMocks("enrollTotpMfa"),
  },
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => (
  <MemoryRouter initialEntries={["/"]}>
    <MfaOkta {...args} />
  </MemoryRouter>
);

export const Default = Template.bind({});
Default.args = {};
