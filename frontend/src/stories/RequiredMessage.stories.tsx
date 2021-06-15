import { Meta } from "@storybook/react";

import RequiredMessage from "../app/commonComponents/RequiredMessage";

export default {
  title: "Components/Form controls/Required message",
  component: RequiredMessage,
} as Meta;

export const Default: React.VFC<{}> = (args) => <RequiredMessage {...args} />;
