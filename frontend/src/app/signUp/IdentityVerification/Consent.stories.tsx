import { Story, Meta } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";

import Consent from "./Consent";

export default {
  title: "App/Identity Verification/Step 1: Consent",
  component: Consent,
  argTypes: {},
} as Meta;

const Template: Story = (args) => (
  <MemoryRouter
    initialEntries={[
      {
        pathname: "/identity-verification",
        state: {
          firstName: "Harry",
          lastName: "Potter",
          orgExternalId: "Hogwarts",
        },
      },
    ]}
  >
    <Consent {...args} />
  </MemoryRouter>
);

export const Default = Template.bind({});
Default.args = {};
