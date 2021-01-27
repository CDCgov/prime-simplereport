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
    canView: ["edit_organization", "edit_facility"], // can view the settings page
    // for the time being, only admins can view, but they also have edit options. Finer granularity here is not needed
    // canEditFacility: ["edit_facility"],
    // canEditOrganization: ["edit_organization"]
  },
  people: {
    canView: ["read_patient_list"], // TODO: test_only users should be able to make the query, but not view this page. This is all wrapped under a single permission tho.
    canEdit: ["edit_patient"],
  },
  results: {
    canView: ["read_result_list"],
  },
  tests: {
    canStart: ["start_test"],
    canUpdate: ["update_test"],
    canSubmit: ["submit_test"],
  },
};

export { hasPermission, appPermissions };

// People Tab:
// - header: only show link if has ["read_patient_list"]
// - route: only support route if has ["read_patient_list"]
// - query: fetching people must have ["read_patient_list"]
// - add button: hide button unless ["edit_patient"]
// - edit patient: must have ["edit_patient"], otherwise remove link

// Test Results:
// - header: only show if has ["READ_RESULT_LIST"]
// - route: only support route if has ["READ_RESULT_LIST"]

// Queue:
// - ￼￼￼

// type UserPermission =
//   | "read_patient_list"
//   | "read_result_list"
//   | "edit_patient"
//   | "edit_facility"
//   | "edit_organization"
//   | "start_test"
//   | "update_test"
//   | "submit_test";

// xx READ_PATIENT_LIST,
// xx READ_RESULT_LIST,
// xx EDIT_PATIENT,
// EDIT_FACILITY,
// EDIT_ORGANIZATION,
// START_TEST,
// UPDATE_TEST,
// SUBMIT_TEST

// ROLES + PERMISSIONS:
//  ENTRY_ONLY("Test-entry users",
//             EnumSet.of(UserPermission.START_TEST, UserPermission.UPDATE_TEST, UserPermission.SUBMIT_TEST)),
// USER("Users",
//             EnumSet.of(UserPermission.READ_PATIENT_LIST, UserPermission.READ_RESULT_LIST, UserPermission.EDIT_PATIENT,
//                     UserPermission.START_TEST, UserPermission.UPDATE_TEST)),
// ADMIN("Admins", EnumSet.allOf(UserPermission.class));
