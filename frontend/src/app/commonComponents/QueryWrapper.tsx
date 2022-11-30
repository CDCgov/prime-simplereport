import React, { ComponentProps } from "react";
import { gql, QueryHookOptions, useQuery } from "@apollo/client";

import { getAppInsights } from "../TelemetryService";

export type InjectedQueryWrapperProps =
  | "data"
  | "trackAction"
  | "refetch"
  | "loading"
  | "startPolling"
  | "stopPolling";

const defaultQueryOptions: QueryHookOptions = {
  variables: {},
  fetchPolicy: "cache-and-network",
};

// eslint-disable-next-line
type PropsWithChildren = {
  children: React.ReactNode;
} & ComponentProps<any>;

export function QueryWrapper<PropsWithChildren>({
  query,
  queryOptions,
  onRefetch,
  children,
  Component,
  componentProps,
  displayLoadingIndicator = true,
}: {
  query: ReturnType<typeof gql>;
  queryOptions?: QueryHookOptions;
  onRefetch?: () => void;
  displayLoadingIndicator?: boolean;
  children?: React.ReactNode;
  Component: React.ComponentType<PropsWithChildren>;
  componentProps: Omit<PropsWithChildren, InjectedQueryWrapperProps>;
}): React.ReactElement {
  const appInsights = getAppInsights();

  const { data, loading, error, refetch, startPolling, stopPolling } = useQuery(
    query,
    {
      ...defaultQueryOptions,
      ...queryOptions,
    }
  );
  if (displayLoadingIndicator && loading) {
    return <p>Loading</p>;
  }
  if (error) {
    throw error;
  }
  const passOnRefetch = () => {
    refetch();
    onRefetch && onRefetch();
  };
  const props = {
    ...componentProps,
    trackAction: appInsights
      ? appInsights.trackEvent({ name: "User Action" })
      : () => {
          // no-op
        },
    data,
    loading,
    refetch: passOnRefetch,
    startPolling,
    stopPolling,
  } as unknown as ComponentProps<any>;
  return (
    <>
      <Component {...props} />
      {children}
    </>
  );
}
