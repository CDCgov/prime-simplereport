import {
  FindUserByEmailDocument,
  GetAllOrganizationsDocument,
  GetFacilitiesByOrgIdDocument,
  GetTestResultCountByOrgDocument,
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

export const getFacilitiesByDisOrgMock = {
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

export const getTestResultCountByOrgMock = {
  request: {
    query: GetTestResultCountByOrgDocument,
    variables: { orgId: "85988325-e5f1-4921-b8e7-4de3a1a8ead6" },
  },
  result: { data: { testResultsCount: 1 } },
};

export const getFacilitiesByDatOrgMock = {
  request: {
    query: GetFacilitiesByOrgIdDocument,
    variables: {
      orgId: "6291c4db-8d4b-4db1-8604-c6c32cc5f2aa",
    },
  },
  result: {
    data: {
      organization: {
        id: "6291c4db-8d4b-4db1-8604-c6c32cc5f2aa",
        externalId: "DAT_ORG",
        name: "Dat Organization",
        type: "urgent_care",
        facilities: [
          {
            name: "Downtown Clinic",
            id: "886ebc8a-16cd-4c27-90d2-648b9357e393",
            city: "New York",
            state: "NY",
            zipCode: "10010",
            __typename: "Facility",
          },
          {
            name: "Uptown Clinic",
            id: "108f5100-ed7a-477d-b31d-51a0b560ba8c",
            city: "New York",
            state: "NY",
            zipCode: "10128",
            __typename: "Facility",
          },
        ],
        __typename: "Organization",
      },
    },
  },
};
