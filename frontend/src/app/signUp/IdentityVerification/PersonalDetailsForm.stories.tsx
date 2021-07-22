import { Story, Meta } from "@storybook/react";
import { MemoryRouter } from "react-router";

import PersonalDetailsForm from "./PersonalDetailsForm";

export default {
  title: "App/Identity Verification/Step 1: Personal Details",
  component: PersonalDetailsForm,
  argTypes: {},
} as Meta;

const Template: Story = (args) => (
  <MemoryRouter
    initialEntries={[
      { pathname: "/identity-verification", search: "?orgExternalId=foo" },
    ]}
  >
    <PersonalDetailsForm {...args} />
  </MemoryRouter>
);

export const Default = Template.bind({});
Default.args = {};
