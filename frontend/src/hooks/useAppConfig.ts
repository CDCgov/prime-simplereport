import { useReactiveVar } from "@apollo/client";

import { appConfig } from "../storage/store";
// TODO: configure here generalData load, current user data, organization, locale etc...
//

export const useAppConfig = () => {
  const config = useReactiveVar(appConfig);
  const setUser = (user: User) => {
    appConfig({
      ...config,
      user,
    });
  };
  const updateOrganizationName = (organizationName: string) => {
    appConfig({
      ...config,
      organization: {
        ...config.organization,
        name: organizationName,
      },
    });
  };
  const setActivationToken = (activationToken: string | null) => {
    appConfig({ ...config, activationToken });
  };
  const setInitialData = (data: AppConfigState) => {
    appConfig(data);
  };
  return {
    config,
    setUser,
    setInitialData,
    setActivationToken,
    updateOrganizationName,
  };
};
