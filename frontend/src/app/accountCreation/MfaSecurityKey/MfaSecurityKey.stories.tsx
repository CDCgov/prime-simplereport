import { StoryFn, Meta } from "@storybook/react-webpack5";

import { getMocks } from "../../../stories/storyMocks";

import { MfaSecurityKey } from "./MfaSecurityKey";

export default {
  title: "App/Account set up/Step 3a: Security key",
  component: MfaSecurityKey,
  parameters: {
    msw: getMocks("enrollSecurityKeyMfa"),
  },
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => <MfaSecurityKey {...args} />;

export const Default = Template.bind({});
Default.args = {};
