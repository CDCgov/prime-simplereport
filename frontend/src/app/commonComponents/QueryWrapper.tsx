import React from "react";
import { gql, QueryHookOptions, useQuery } from "@apollo/client";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";

export type InjectedQueryWrapperProps = "data" | "trackAction";

const defaultQueryOptions: QueryHookOptions = {
  variables: {},
  fetchPolicy: "cache-and-network",
};

export function QueryWrapper<ComponentProps>({
  query,
  queryOptions,
  Component,
  componentProps,
}: {
  query: ReturnType<typeof gql>;
  queryOptions?: QueryHookOptions;
  Component: React.ComponentType<ComponentProps>;
  componentProps: Omit<ComponentProps, InjectedQueryWrapperProps>;
}): React.ReactElement {
  const appInsights = useAppInsightsContext();
  const trackAction = useTrackEvent(appInsights, "User Action", {});
  const { data, loading, error } = useQuery(query, {
    ...defaultQueryOptions,
    ...queryOptions,
  });

  if (loading) {
    return <p>Loading</p>;
  }
  if (error) {
    throw error;
  }
  const props = ({
    ...componentProps,
    trackAction,
    data,
  } as unknown) as ComponentProps;
  return <Component {...props} />;
}
