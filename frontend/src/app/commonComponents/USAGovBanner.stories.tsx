import { Meta } from "@storybook/react";

import USAGovBanner from "./USAGovBanner";

export default {
  title: "Components/USA Gov Banner",
  component: USAGovBanner,
} as Meta;

export const Default: React.VFC<{}> = (args) => <USAGovBanner {...args} />;
