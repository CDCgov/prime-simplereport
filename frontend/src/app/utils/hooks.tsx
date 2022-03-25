import {
  DocumentNode,
  OperationVariables,
  QueryHookOptions,
  QueryResult,
  useQuery,
} from "@apollo/client";
import React, { useEffect, useRef } from "react";

const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  onClickOutside: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (ev: MouseEvent) => {
      if (ref.current && !ref.current.contains(ev.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener<"mousedown">("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener<"mousedown">(
        "mousedown",
        handleClickOutside
      );
    };
  }, [ref, onClickOutside]);
};

const useDocumentTitle = (title: string, retainOnUnmount = false) => {
  const defaultTitle = useRef<string>(document.title);

  useEffect(() => {
    document.title = title + " | SimpleReport";
  }, [title]);

  useEffect(() => {
    const defaultCurrentTitle = defaultTitle.current;

    return () => {
      if (!retainOnUnmount) {
        document.title = defaultCurrentTitle;
      }
    };
  }, [retainOnUnmount, title]);
};

/**
 * Small wrapper around `useQuery` so that we can use it imperatively.
 *
 * @see Credit: https://github.com/apollographql/react-apollo/issues/3499#issuecomment-610649667
 *
 * @example
 * const callQuery = useImperativeQuery(query, options)
 * const handleClick = async () => {
 *   const{ data, error } = await callQuery()
 * }
 */
function useImperativeQuery<TData = any, TVariables = OperationVariables>(
  query: DocumentNode,
  options: QueryHookOptions<TData, TVariables> = {}
): QueryResult<TData, TVariables>["refetch"] {
  const { refetch } = useQuery<TData, TVariables>(query, {
    ...options,
    skip: true,
  });

  const imperativelyCallQuery = (queryVariables: TVariables) => {
    return refetch(queryVariables);
  };

  return imperativelyCallQuery;
}

export { useOutsideClick, useDocumentTitle, useImperativeQuery };
