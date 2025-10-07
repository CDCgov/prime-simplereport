import { UserPermission } from "../generated/graphql";

// this is what the server sends back in the user.roleDescription field. It is used as the display value (most of the time)
export type RoleDescription =
  | "Admin user"
  | "Standard user"
  | "Test-entry user"
  | "test-result-upload-pilot user";

// when changing a user's role, the server expects one of these values as the roleDescription. It's annoying how its not consistent with RoleDescription
export type Role = "ADMIN" | "USER" | "ENTRY_ONLY" | "TEST_RESULT_UPLOAD_USER";

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

/*
    Maps a user functionality to the required list of professions
    - a user functionality could be a link that needs to be disabled, a button that needs to be hidden, a query that needs to be rejected, etc
        - a single UX functionality may need gating at multiple parts in the app
    - permissions are defined in the backend and returned in the whoami query
*/
const appPermissions = {
  settings: {
    canView: [UserPermission.EditOrganization, UserPermission.EditFacility],
  },
  people: {
    canView: [UserPermission.ReadPatientList],
    canEdit: [UserPermission.EditPatient],
    canDelete: [UserPermission.ArchivePatient],
  },
  results: {
    canView: [UserPermission.ReadResultList],
  },
  tests: {
    canView: [
      UserPermission.StartTest,
      UserPermission.UpdateTest,
      UserPermission.SubmitTest,
    ],
    canStart: [UserPermission.StartTest],
    canUpdate: [UserPermission.UpdateTest],
    canSubmit: [UserPermission.SubmitTest],
  },
};

export { hasPermission, appPermissions };
