import React from "react";
import { gql, QueryHookOptions, useQuery } from "@apollo/client";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";

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

export function QueryWrapper<ComponentProps>({
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
  Component: React.ComponentType<ComponentProps>;
  componentProps: Omit<ComponentProps, InjectedQueryWrapperProps>;
}): React.ReactElement {
  const appInsights = useAppInsightsContext();
  const trackAction = useTrackEvent(appInsights, "User Action", {});

  const safeTrackAction = (action: any) => {
    try {
      trackAction(action);
    } catch (err) {
      console.log(err);
    }
  };

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
  const props = ({
    ...componentProps,
    trackAction: safeTrackAction,
    data,
    loading,
    refetch: passOnRefetch,
    startPolling,
    stopPolling,
  } as unknown) as ComponentProps;
  return (
    <>
      <Component {...props} />
      {children}
    </>
  );
}
