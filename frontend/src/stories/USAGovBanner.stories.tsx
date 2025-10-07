import { Meta } from "@storybook/react";

import USAGovBanner from "../app/commonComponents/USAGovBanner";

export default {
  title: "Components/Banner",
  component: USAGovBanner,
} as Meta;

export const Default: React.VFC<{}> = (args) => <USAGovBanner {...args} />;
