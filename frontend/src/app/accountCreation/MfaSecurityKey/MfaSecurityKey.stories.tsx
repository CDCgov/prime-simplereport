import { Story, Meta } from "@storybook/react";

import { MfaSecurityKey } from "./MfaSecurityKey";

export default {
  title: "App/Account set up/Step 3a: Security key",
  component: MfaSecurityKey,
  argTypes: {},
  args: {
    location: {
      state: {
        activation: {
          attestation: "direct",
          authenticatorSelection: {
            userVerification: "preferred",
            requireResidentKey: false,
          },
          challenge: "cdsZ1V10E0BGE4GcG3IK",
          excludeCredentials: [],
          pubKeyCredParams: [
            {
              type: "public-key",
              alg: -7,
            },
            {
              type: "public-key",
              alg: -257,
            },
          ],
          rp: {
            name: "Rain-Cloud59",
          },
          user: {
            displayName: "Bob Tester",
            name: "bob.tester@gmail.com",
            id: "00u15s1KDETTQMQYABRL",
          },
        },
      },
    },
  },
} as Meta;

type Props = React.ComponentProps<typeof MfaSecurityKey>;

const Template: Story<Props> = (args) => <MfaSecurityKey {...args} />;

export const Default = Template.bind({});
Default.args = {};
