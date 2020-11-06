import { ORGANIZATION__UPDATE_SETTINGS } from "./organizationActionTypes";

export const updateOrganizationSettings = (organizationSettings) => {
  return {
    type: ORGANIZATION__UPDATE_SETTINGS,
    payload: {
      organizationSettings,
    },
  };
};
