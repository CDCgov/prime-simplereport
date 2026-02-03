import { Meta } from "@storybook/react-webpack5";
import { Provider } from "react-redux";
import {
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import createMockStore from "redux-mock-store";
import React from "react";

import LegacyApplication from "../../app/LegacyApplicationWrapper";

import { SelfRegistration } from "./SelfRegistration";

const element = (
  <Provider store={createMockStore()({})}>
    <LegacyApplication>
      <SelfRegistration />
    </LegacyApplication>
  </Provider>
);
export default {
  title: "App/PXP/Self-Registration",
  component: SelfRegistration,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
} as Meta;

const route = createRoutesFromElements(
  <>
    <Route element={element} path={"/register/shady-oaks"} />
  </>
);

const router = createMemoryRouter(route, {
  initialEntries: [`/register/shady-oaks`],
});

const Template = (): React.ReactElement => {
  return <RouterProvider router={router} />;
};

export const Default = Template.bind({});
