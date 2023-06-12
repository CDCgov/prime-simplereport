import { Link, useLocation } from "react-router-dom";
import React, { ReactNode } from "react";

interface Props {
  pathname: string;
  hash?: string;
  children: ReactNode;
}

export const HashLink = ({ children, hash, pathname, ...props }: Props) => {
  const { search } = useLocation();

  return (
    <Link {...props} to={{ pathname: pathname, hash: hash, search: search }}>
      {children}
    </Link>
  );
};
