/* 
    TODO: this is a quick v0 and should be gutted;

    An alternate approach would be to initialize an similar to `appPermissions`, but with the actual bool options

    ie: 
        userPermissions = {
            settings: {
                canView: true
                canAddFacility: false
            }
        }

    example:
        if (userPermissions.settings.canView) {
            ...
        }
    
    Or create a method on the user type: if (user.permissions.canView.settings) {...}

    Or wrap all of this in a permissions component, but that isn't as one-size-fits-all.
    You'd need specialized wrappers to disable links/buttons, disable queries, hide components, handle redirects, etc.
*/
const hasPermission = (
  userPermissions: UserPermission[] | undefined,
  requiredPermissions: UserPermission[]
) => {
  return requiredPermissions.every((requiredPermission) =>
    userPermissions?.includes(requiredPermission)
  );
};

/*
    Maps a user functionality to the required list of professions
    - a user functionality could be a link that needs to be disabled, a button that needs to be hidden, a query that needs to be rejected, etc
        - a single UX functionality may need gating at multiple parts in the app
    - permissions are defined in the backend and returned in the whoami query
*/

interface AppPermissions {
  settings: {
    canView: UserPermission[];
  };
  people: {
    canView: UserPermission[];
    canEdit: UserPermission[];
  };
  results: {
    canView: UserPermission[];
  };
  tests: {
    canStart: UserPermission[];
    canUpdate: UserPermission[];
    canSubmit: UserPermission[];
  };
}

const appPermissions: AppPermissions = {
  settings: {
    canView: ["EDIT_ORGANIZATION", "EDIT_FACILITY"], // can view the settings page
    // for the time being, only admins can view, but they also have edit options. Finer granularity here is not needed
    // canEditFacility: ["edit_facility"],
    // canEditOrganization: ["EDIT_ORGANIZATION"]
  },
  people: {
    canView: ["READ_PATIENT_LIST"], // TODO: test_only users should be able to make the query, but not view this page. This is all wrapped under a single permission tho.
    canEdit: ["EDIT_PATIENT"],
  },
  results: {
    canView: ["READ_RESULT_LIST"],
  },
  tests: {
    canStart: ["START_TEST"],
    canUpdate: ["UPDATE_TEST"],
    canSubmit: ["SUBMIT_TEST"],
  },
};

export { hasPermission, appPermissions };
