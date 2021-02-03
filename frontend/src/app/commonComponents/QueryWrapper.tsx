import React from "react";
import { gql, QueryHookOptions, useQuery } from "@apollo/client";

const defaultQueryOptions: QueryHookOptions = {
  variables: {},
  fetchPolicy: "no-cache",
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
  componentProps: Omit<ComponentProps, "data">;
}): React.ReactElement {
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
  const props = ({ ...componentProps, data } as unknown) as ComponentProps;
  return <Component {...props} />;
}
