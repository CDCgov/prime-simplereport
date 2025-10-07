// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />

declare const PUBLIC_URL: string;

interface User {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  email: string;
  type?: UserType; // TODO: remove optional prop
  permissions?: UserPermission[]; // TODO: remove optional prop
  roleDescription: RoleDescription;
}

// Definition to import svg resources as elements through svgr lib
declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

type RouterWithFacilityProps = {
  children: React.ReactNode;
};
