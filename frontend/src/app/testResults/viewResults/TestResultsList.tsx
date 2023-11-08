import { useLocation, useNavigate, useParams } from "react-router-dom";
import React, { useState } from "react";
import { faSlidersH } from "@fortawesome/free-solid-svg-icons";

import { useDocumentTitle } from "../../utils/hooks";
import Pagination from "../../commonComponents/Pagination";
import { TEST_RESULT_DESCRIPTIONS } from "../../constants";
import "./TestResultsList.scss";
import Button from "../../commonComponents/Button/Button";
import { useDebounce } from "../../testQueue/addToQueue/useDebounce";
import {
  MIN_SEARCH_CHARACTER_COUNT,
  SEARCH_DEBOUNCE_TIME,
} from "../../testQueue/constants";
import { useSelectedFacility } from "../../facilitySelect/useSelectedFacility";
import {
  GetResultsMultiplexWithCountQuery,
  Result,
  useGetResultsMultiplexWithCountQuery,
} from "../../../generated/graphql";

import DownloadResultsCSVButton from "./DownloadResultsCsvButton";
import ResultsTable, { generateTableHeaders } from "./ResultsTable";
import TestResultsFilters from "./TestResultsFilters";
import { getFiltersFromUrl } from "./utils";

export const ALL_FACILITIES_ID = "all";

export type Results = keyof typeof TEST_RESULT_DESCRIPTIONS;

export const byDateTested = (a: any, b: any) => {
  // ISO string dates sort nicely
  if (a.dateTested === b.dateTested) return 0;
  if (a.dateTested < b.dateTested) return 1;
  return -1;
};

/**
 * DetachedTestResultsList
 */

interface DetachedTestResultsListProps {
  data: GetResultsMultiplexWithCountQuery | undefined;
  loading: boolean;
  pageNumber: number;
  entriesPerPage: number;
  totalEntries: number;
  filterParams: FilterParams;
  setFilterParams: (filter: keyof FilterParams) => (val: string | null) => void;
  clearFilterParams: () => void;
  activeFacilityId: string;
  maxDate?: string;
}

const getResultCountText = (
  totalEntries: number,
  pageNumber: number,
  entriesPerPage: number
) => {
  const from = totalEntries === 0 ? 0 : (pageNumber - 1) * entriesPerPage + 1;
  const to = Math.min(entriesPerPage * pageNumber, totalEntries);

  return `Showing results for ${from}-${to} of ${totalEntries} tests`;
};

const isClearFilterBtnDisabled = (
  filterParams: FilterParams,
  activeFacilityId: string
) => {
  return (
    Object.keys(filterParams).length === 0 ||
    (Object.keys(filterParams).length === 1 &&
      filterParams.filterFacilityId === activeFacilityId)
  );
};

export interface ResultsQueryVariables {
  patientId?: string | null;
  facilityId: string | null;
  result?: string | null;
  role?: string | null;
  disease?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  pageNumber: number;
  pageSize: number;
}

const TestResultsList = () => {
  useDocumentTitle("Results");

  /**
   * Handling of filters by url
   */
  const urlParams = useParams();

  const [facility] = useSelectedFacility();
  const activeFacilityId = facility?.id || "";

  const navigate = useNavigate();
  const location = useLocation();

  const filterParams: FilterParams = getFiltersFromUrl(location);
  const { filterFacilityId, ...queryParams } = filterParams;
  const filter = (params: FilterParams) => {
    const searchParams = {
      facility: activeFacilityId,
      ...filterParams,
      ...params,
    };
    const nonNullSearchParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, v]) => v !== null)
    ) as Record<string, string>;

    navigate({
      pathname: "/results/1",
      search: new URLSearchParams(nonNullSearchParams).toString(),
    });
  };

  const [queryString, debounced, setDebounced] = useDebounce("", {
    debounceTime: SEARCH_DEBOUNCE_TIME,
    runIf: (q) => q.length >= MIN_SEARCH_CHARACTER_COUNT,
  });

  const setFilterParams = (key: keyof FilterParams) => (val: string | null) => {
    filter({ [key]: val });
  };

  const [startDateError, setStartDateError] = useState<string | undefined>();
  const [endDateError, setEndDateError] = useState<string | undefined>();
  const [startDate, setStartDate] = useState<string | null>("0");
  const [endDate, setEndDate] = useState<string | null>("0");

  const handleClearFilters = () => {
    setDebounced("");
    navigate({
      pathname: "/results/1",
      search: new URLSearchParams({ facility: activeFacilityId }).toString(),
    });
    (document.getElementById("start-date") as HTMLInputElement).value = "";
    (document.getElementById("end-date") as HTMLInputElement).value = "";
    setStartDateError("");
    setEndDateError("");
  };

  /**
   * Pagination
   */
  const entriesPerPage = 20;
  const pageNumber = Number(urlParams.pageNumber) || 1;

  /**
   * Test results data retrieval
   */
  const resultsQueryVariables: ResultsQueryVariables = {
    facilityId:
      filterFacilityId === ALL_FACILITIES_ID
        ? null
        : filterFacilityId || activeFacilityId,
    pageNumber: pageNumber - 1,
    pageSize: entriesPerPage,
    ...queryParams,
  };

  const { data, loading, error } = useGetResultsMultiplexWithCountQuery({
    fetchPolicy: "no-cache",
    variables: resultsQueryVariables,
  });

  const testResults = data?.resultsPage?.content ?? [];
  const totalEntries = data?.resultsPage?.totalElements || 0;

  /**
   * Adjusting of table columns
   */
  const displayFacilityColumn =
    filterParams.filterFacilityId === ALL_FACILITIES_ID ||
    activeFacilityId === ALL_FACILITIES_ID;

  const hasMultiplexResults = testResults.some(
    (result: any) =>
      result.results?.length &&
      result.results.some((r: any) => r.disease.name !== "COVID-19")
  );

  /**
   * HTML (content)
   */

  if (error) {
    throw error;
  }

  if (!activeFacilityId) {
    return <div>"No facility selected"</div>;
  }

  return (
    <div className="grid-row">
      <div className="prime-container card-container sr-test-results-list">
        <div className="sticky-heading">
          <div className="usa-card__header">
            <div className="display-flex flex-align-center">
              <h1 className="font-sans-lg margin-y-0">Test results</h1>
              {!loading && (
                <span className="sr-showing-results-on-page margin-left-4">
                  {getResultCountText(totalEntries, pageNumber, entriesPerPage)}
                </span>
              )}
            </div>
            <div>
              <DownloadResultsCSVButton
                filterParams={filterParams}
                totalEntries={totalEntries}
                activeFacilityId={activeFacilityId}
              />
              <Button
                className="sr-active-button"
                icon={faSlidersH}
                onClick={handleClearFilters}
                disabled={isClearFilterBtnDisabled(
                  filterParams,
                  activeFacilityId
                )}
              >
                Clear filters
              </Button>
            </div>
          </div>
          <TestResultsFilters
            data={data}
            setFilterParams={setFilterParams}
            filterParams={filterParams}
            startDate={startDate}
            setEndDate={setEndDate}
            activeFacilityId={activeFacilityId}
            endDate={endDate}
            endDateError={endDateError}
            setEndDateError={setEndDateError}
            setStartDate={setStartDate}
            setStartDateError={setStartDateError}
            startDateError={startDateError}
          />
          <table
            className="usa-table usa-table--borderless width-full"
            aria-hidden="true"
          >
            <thead>{generateTableHeaders(displayFacilityColumn)}</thead>
          </table>
        </div>
        <ResultsTable
          results={testResults as Result[]}
          hasMultiplexResults={hasMultiplexResults}
          hasFacility={displayFacilityColumn}
        />
        <div className="usa-card__footer">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Pagination
              baseRoute="/results"
              currentPage={pageNumber}
              entriesPerPage={entriesPerPage}
              totalEntries={totalEntries}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TestResultsList;
