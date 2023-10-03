import { WHOAMI_QUERY } from "./ReportingApp";

export const WhoAmIQueryMock = {
  request: {
    query: WHOAMI_QUERY,
    fetchPolicy: "no-cache",
  },
  result: {
    data: {
      whoami: {
        id: "05b2f71a-9392-442b-aab5-4eb550a864c0",
        firstName: "Bob",
        middleName: null,
        lastName: "Bobberoo",
        suffix: null,
        email: "bob@example.com",
        isAdmin: false,
        permissions: [
          "EDIT_PATIENT",
          "ARCHIVE_PATIENT",
          "READ_PATIENT_LIST",
          "EDIT_ORGANIZATION",
          "START_TEST",
          "EDIT_FACILITY",
          "ACCESS_ALL_FACILITIES",
          "READ_RESULT_LIST",
          "READ_ARCHIVED_PATIENT_LIST",
          "SUBMIT_TEST",
          "MANAGE_USERS",
          "SEARCH_PATIENTS",
          "UPDATE_TEST",
        ],
        roleDescription: "Admin user",
        organization: {
          name: "Dis Organization",
          testingFacility: [
            {
              id: "fec4de56-f4cc-4c61-b3d5-76869ca71296",
              name: "Testing Site",
            },
          ],
        },
      },
    },
  },
};
