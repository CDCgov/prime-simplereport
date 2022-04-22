import { Meta, Story } from "@storybook/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";

import Submissions from "./Submissions";

type Props = {};

export default {
  title: "Submissions",
  component: Submissions,
  argTypes: {},
  args: {},
} as Meta;

const Template: Story<Props> = (args) => (
  <MemoryRouter>
    <Submissions {...args} />
  </MemoryRouter>
);

export const Default = Template.bind({});
Default.args = {};
