import {
  FindUserByEmailDocument,
  GetAllOrganizationsDocument,
  GetFacilitiesByOrgIdDocument,
} from "../../../generated/graphql";

export const getAllOrgsMock = {
  request: {
    query: GetAllOrganizationsDocument,
  },
  result: {
    data: {
      organizations: [
        {
          id: "6291c4db-8d4b-4db1-8604-c6c32cc5f2aa",
          name: "Dat Organization",
          __typename: "Organization",
        },
        {
          id: "85988325-e5f1-4921-b8e7-4de3a1a8ead6",
          name: "Dis Organization",
          __typename: "Organization",
        },
      ],
    },
  },
};

export const getFacilitiesByOrgMock = {
  request: {
    query: GetFacilitiesByOrgIdDocument,
    variables: {
      orgId: "85988325-e5f1-4921-b8e7-4de3a1a8ead6",
    },
  },
  result: {
    data: {
      organization: {
        id: "85988325-e5f1-4921-b8e7-4de3a1a8ead6",
        externalId: "DIS_ORG",
        name: "Dis Organization",
        type: "university",
        facilities: [
          {
            name: "Testing Site",
            id: "97bc572e-f894-4280-916e-5c95270d1ea8",
            city: "Los Angeles",
            state: "CA",
            zipCode: "90000",
            __typename: "Facility",
          },
        ],
        __typename: "Organization",
      },
    },
  },
};

export const findUserByEmailMock = {
  request: {
    query: FindUserByEmailDocument,
    variables: {
      email: "ruby@example.com",
    },
  },
  result: {
    data: {
      user: {
        id: "dc3660f0-f7b7-4b46-9a7f-53a62838a802",
        firstName: "Ruby",
        middleName: "Raven",
        lastName: "Reynolds",
        roleDescription: "Standard user",
        role: "USER",
        permissions: [
          "START_TEST",
          "UPDATE_TEST",
          "ARCHIVE_PATIENT",
          "UPLOAD_RESULTS_SPREADSHEET",
          "SEARCH_PATIENTS",
          "EDIT_PATIENT",
          "SUBMIT_TEST",
          "READ_PATIENT_LIST",
          "READ_RESULT_LIST",
        ],
        email: "ruby@example.com",
        status: "ACTIVE",
        organization: {
          id: "85988325-e5f1-4921-b8e7-4de3a1a8ead6",
          testingFacility: [
            {
              id: "97bc572e-f894-4280-916e-5c95270d1ea8",
              name: "Testing Site",
              __typename: "Facility",
            },
          ],
          __typename: "Organization",
        },
        isDeleted: false,
        __typename: "User",
      },
    },
  },
};
