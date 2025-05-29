import { GetResultsForDownloadQuery } from "../../generated/graphql";

export type QueriedTestResult = NonNullable<
  NonNullable<GetResultsForDownloadQuery["resultsPage"]>["content"]
>[number];
