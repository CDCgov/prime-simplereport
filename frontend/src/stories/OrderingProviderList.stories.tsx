import React from "react";
import { MemoryRouter } from "react-router";
import { Story, Meta } from "@storybook/react";
import faker from "faker";

import OrderingProviderList, {
  OrderingProviderListProps,
} from "../app/Settings/Facility/Components/OrderingProviderList";

export default {
  title: "Ordering Provider List",
  component: OrderingProviderList,
} as Meta;

const RouterWithFacility: React.FC = ({ children }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

const Template = (): Story<OrderingProviderListProps> => (args) => (
  <RouterWithFacility>
    <OrderingProviderList {...args} />
  </RouterWithFacility>
);

const createOrderingProvider = () => ({
  firstName: faker.name.firstName(),
  middleName: faker.name.middleName(),
  lastName: faker.name.lastName(),
  suffix: faker.name.suffix(),
  NPI: "0000000000",
  phone: faker.phone.phoneNumber(),
  city: faker.address.city(),
  state: faker.address.state(),
  street: faker.address.streetAddress(),
  streetTwo: faker.address.secondaryAddress(),
  zipCode: faker.address.zipCode(),
});

const provider = createOrderingProvider();

export const SingleProvider = Template();
SingleProvider.args = {
  providers: [provider],
  defaultProvider: provider,
  updateDefaultProvider: () => {},
  updateProviders: () => {},
};

export const MultipleProviders = Template();
MultipleProviders.args = {
  providers: [provider, createOrderingProvider()],
  defaultProvider: provider,
  updateDefaultProvider: () => {},
  updateProviders: () => {},
};
