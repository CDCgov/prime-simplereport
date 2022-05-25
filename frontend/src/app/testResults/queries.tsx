import { gql } from "@apollo/client";

export const RESULTS_COUNT_QUERY = gql`
  query GetResultsCountByFacility(
    $facilityId: ID
    $patientId: ID
    $result: String
    $role: String
    $startDate: DateTime
    $endDate: DateTime
  ) {
    testResultsCount(
      facilityId: $facilityId
      patientId: $patientId
      result: $result
      role: $role
      startDate: $startDate
      endDate: $endDate
    )
  }
`;
