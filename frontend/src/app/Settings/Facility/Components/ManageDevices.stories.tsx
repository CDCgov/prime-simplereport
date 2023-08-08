import { StoryFn, Meta } from "@storybook/react";
import React from "react";

import ManageDevices from "./ManageDevices";

export default {
  title: "App / Manage Facility / Manage Devices",
  component: ManageDevices,
  argTypes: {},
} as Meta;

type Props = React.ComponentProps<typeof ManageDevices>;

const Template: StoryFn<Props> = (args) => (
  <>
    <ManageDevices {...args} />
  </>
);

export const Default = Template.bind({});
export const Empty = Template.bind({});

Default.args = {
  deviceTypes: [
    {
      internalId: "fake-id",
      name: "Device One",
      model: "Device One",
      manufacturer: "Manufacturer One",
      supportedDiseaseTestPerformed: [],
    },
    {
      internalId: "fake-id-2",
      name: "Device Two",
      model: "Device Two",
      manufacturer: "Manufacturer Two",
      supportedDiseaseTestPerformed: [],
    },
  ] as FacilityFormDeviceType[],
  errors: [],
  newOrg: true,
  formCurrentValues: {
    facility: {
      name: "Facility",
      phone: "2708675309",
      email: null,
      street: "Sesame St",
      streetTwo: null,
      city: "Dream Town",
      zipCode: "90210",
      state: "CA",
      cliaNumber: "12D456789",
    },
    orderingProvider: {
      firstName: null,
      middleName: null,
      lastName: null,
      suffix: null,
      NPI: null,
      street: null,
      streetTwo: null,
      city: null,
      state: "NC",
      zipCode: null,
      phone: null,
    },
    devices: ["fake-id"],
  },
  onChange: () => {},
};

Empty.args = {
  ...Default.args,
  deviceTypes: [],
};
