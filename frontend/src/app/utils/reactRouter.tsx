import React, { ReactNode } from "react";
import { Provider } from "react-redux";
import { MockedProvider } from "@apollo/client/testing";
import {
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { MockStoreEnhanced } from "redux-mock-store";
import { MockedResponse } from "@apollo/client/testing/core";

// https://reactrouter.com/en/main/routers/picking-a-router#testing

export function createGQLWrappedMemoryRouterWithDataApis(
  elementToTest: ReactNode,
  store: MockStoreEnhanced<unknown, {}>,
  mocks: MockedResponse[],
  addTypename?: boolean,
  path?: string
): React.ReactElement {
  const element = (
    <Provider store={store}>
      <MockedProvider mocks={mocks} addTypename={addTypename}>
        <>{elementToTest}</>
      </MockedProvider>
    </Provider>
  );
  const routes = createRoutesFromElements(
    path ? (
      <Route element={element} path={path} />
    ) : (
      <Route element={element} path={"/"} />
    )
  );
  const router = createMemoryRouter(routes);
  return <RouterProvider router={router} />;
}

export function createMemoryRouterWithDataApis(
  elementToTest: ReactNode,
  initialEntries?: string[]
): React.ReactElement {
  const routes = createRoutesFromElements(
    <Route element={elementToTest} path={"/"} />
  );
  const router = createMemoryRouter(routes, {
    initialEntries: initialEntries,
  });
  return <RouterProvider router={router} />;
}
