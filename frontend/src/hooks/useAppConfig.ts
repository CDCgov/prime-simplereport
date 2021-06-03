import { ReactiveVar } from "@apollo/client";
// TODO: configure here generalData load, current user data, organization, locale etc...
//

export const useAppConfig = (appConfigVar: ReactiveVar<AppConfigState>) => {
  const setUser = (user: User) => {
    appConfigVar({
      ...appConfigVar(),
      user,
    });
  };
  const updateOrganizationName = (organizationName: string) => {
    appConfigVar({
      ...appConfigVar(),
      organization: {
        ...appConfigVar().organization,
        name: organizationName,
      },
    });
  };
  const setActivationToken = (activationToken:string | null)=>{
    appConfigVar({...appConfigVar(), activationToken});
  }
  const setInitialData = (data: AppConfigState) => {
    appConfigVar(data);
  };
  return {
    setUser,
    setInitialData,
    setActivationToken,
    updateOrganizationName,
  };
};
