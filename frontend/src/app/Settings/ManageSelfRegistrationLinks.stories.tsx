import { Story, Meta } from "@storybook/react";
import { ComponentProps } from "react";

import { ManageSelfRegistrationLinks } from "./ManageSelfRegistrationLinks";

export default {
  title: "Org Admin/Settings/Self-registration",
  component: ManageSelfRegistrationLinks,
  argTypes: {
    isNewFeature: { control: "boolean" },
  },
} as Meta;

const Template: Story<ComponentProps<typeof ManageSelfRegistrationLinks>> = (
  args
) => <ManageSelfRegistrationLinks {...args} />;

export const View = Template.bind({});
View.args = {
  facilitySlugs: [
    {
      name: "The Sandwich Emporium",
      slug: "2q45f",
    },
    {
      name: "Physics Building",
      slug: "emc22",
    },
    {
      name: "Admissions Facility",
      slug: "66t6y",
    },
  ],
  organizationSlug: "ab3de",
  howItWorksPath: "/how-it-works",
  baseUrl: "https://simplereport.gov/",
};
