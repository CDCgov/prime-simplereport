import { NavLink, NavLinkProps, useLocation } from "react-router-dom";

export const LinkWithQuery: React.FC<NavLinkProps> = ({
  children,
  to,
  ...props
}) => {
  const { search } = useLocation();

  return (
    <NavLink to={to + search} {...props}>
      {children}
    </NavLink>
  );
};
