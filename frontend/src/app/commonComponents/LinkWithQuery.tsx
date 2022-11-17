import { NavLink, NavLinkProps, useLocation } from "react-router-dom";

interface LinkWithQueryProps extends NavLinkProps {
  uploaderExperience?: boolean;
}

export const LinkWithQuery: React.FC<LinkWithQueryProps> = ({
  children,
  to,
  uploaderExperience = false,
  ...props
}) => {
  const { search } = useLocation();

  // if linking to uploader experience, update link path and omit unneeded query params
  const path = uploaderExperience ? "/csv-uploads" + to : to + search;
  return (
    <NavLink to={path} {...props}>
      {children}
    </NavLink>
  );
};
