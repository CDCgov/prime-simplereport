import { Story, Meta } from "@storybook/react";

import { MfaGoogleAuth } from "./MfaGoogleAuth";

export default {
  title: "App/Account set up/Step 3a: Google Authenticator MFA",
  component: MfaGoogleAuth,
  argTypes: {},
  args: {
    location: {
      state: {
        qrCode: "https://i.redd.it/tvfnlka65zi51.jpg",
      },
    },
  },
} as Meta;

type Props = React.ComponentProps<typeof MfaGoogleAuth>;

const Template: Story<Props> = (args) => <MfaGoogleAuth {...args} />;

export const Default = Template.bind({});
Default.args = {};
