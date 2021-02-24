export type UserPermission =
  | "READ_PATIENT_LIST"
  | "READ_RESULT_LIST"
  | "EDIT_PATIENT"
  | "EDIT_FACILITY"
  | "EDIT_ORGANIZATION"
  | "START_TEST"
  | "UPDATE_TEST"
  | "SUBMIT_TEST"
  | "SEARCH_PATIENTS";

export type UserRole = "admin" | "user" | "entry-only";

// this is what the server sends back in the user.roleDescription field. It is used as the display value (most of the time)
export type RoleDescription =
  | "Admin user"
  | "Standard user"
  | "Test-entry user";

// when changing a user's role, the server expects one of these values as the roleDescription. It's annoying how its not consistent with RoleDescription
export type OrganizationRole = "ADMIN" | "USER" | "ENTRY_ONLY";

/* 
    TODO: this is a quick v0

    We should store permissions in Redux, react context, or another global state storage. A standardized one doesn't exist in our codebase atm.
    It can look something like:

        userPermissions = {
            settings: {
                canView: true
                canAddFacility: false
            }
        }

    Alternatively, we can modify user.permissions accordingly. ie: `user.permissions.canView.settings`

    Off the top of my head, there are a few other options for checking permissions
    - create a permissions component that takes in the required permissions, pulls the current permissions from the centralized local store, and does the gating
    - manually pull in the permissions from centraliezd local store. 
    - look into third-party permission gating components? CASL is one.
*/
const hasPermission = (
  userPermissions: UserPermission[] | undefined,
  requiredPermissions: UserPermission[]
) => {
  return requiredPermissions.every((requiredPermission) =>
    userPermissions?.includes(requiredPermission)
  );
};

interface AppPermissions {
  settings: {
    canView: UserPermission[];
    canEditFacility: UserPermission[];
    canEditOrganization: UserPermission[];
  };
  people: {
    canView: UserPermission[];
    canEdit: UserPermission[];
  };
  results: {
    canView: UserPermission[];
  };
  tests: {
    canView: UserPermission[];
    canSearch: UserPermission[];
    canStart: UserPermission[];
    canUpdate: UserPermission[];
    canSubmit: UserPermission[];
  };
}

/*
    Maps a user functionality to the required list of professions
    - a user functionality could be a link that needs to be disabled, a button that needs to be hidden, a query that needs to be rejected, etc
        - a single UX functionality may need gating at multiple parts in the app
    - permissions are defined in the backend and returned in the whoami query
*/
const appPermissions: AppPermissions = {
  settings: {
    canView: ["EDIT_ORGANIZATION", "EDIT_FACILITY"],
    canEditFacility: ["EDIT_FACILITY"], // TODO: not used
    canEditOrganization: ["EDIT_ORGANIZATION"], // TODO: not used
  },
  people: {
    canView: ["READ_PATIENT_LIST"],
    canEdit: ["EDIT_PATIENT"],
  },
  results: {
    canView: ["READ_RESULT_LIST"],
  },
  tests: {
    canView: ["START_TEST", "UPDATE_TEST", "SUBMIT_TEST"],
    canSearch: ["SEARCH_PATIENTS"], // TODO: not used
    canStart: ["START_TEST"],
    canUpdate: ["UPDATE_TEST"],
    canSubmit: ["SUBMIT_TEST"],
  },
};

export { hasPermission, appPermissions };
