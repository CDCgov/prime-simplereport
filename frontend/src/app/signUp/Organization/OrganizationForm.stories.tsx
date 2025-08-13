import { StoryFn, Meta } from "@storybook/react-webpack5";

import OrganizationForm from "./OrganizationForm";

export default {
  title: "App/Sign up/Step 2b: Organization form",
  component: OrganizationForm,
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => <OrganizationForm {...args} />;

export const Default = Template.bind({});
Default.args = {};
