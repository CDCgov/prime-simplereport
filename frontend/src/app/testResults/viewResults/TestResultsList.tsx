import { useLocation, useNavigate, useParams } from "react-router-dom";
import React, { useState } from "react";
import { faSlidersH } from "@fortawesome/free-solid-svg-icons";

import { useDocumentTitle } from "../../utils/hooks";
import Pagination from "../../commonComponents/Pagination";
import { TEST_RESULT_DESCRIPTIONS } from "../../constants";
import "./TestResultsList.scss";
import Button from "../../commonComponents/Button/Button";
import { useSelectedFacility } from "../../facilitySelect/useSelectedFacility";
import {
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

export interface DateRangeFilter {
  startDate: string | null;
  endDate: string | null;
  startDateError: string | undefined;
  endDateError: string | undefined;
}

const dateRangeInitialState = {
  startDate: "0",
  endDate: "0",
  startDateError: undefined,
  endDateError: undefined,
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
   * Handling of setting filters in url
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

  const setFilterParams = (key: keyof FilterParams) => (val: string | null) => {
    filter({ [key]: val });
  };

  /**
   * Filter controls integration
   */
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>(
    dateRangeInitialState
  );

  const handleClearFilters = () => {
    navigate({
      pathname: "/results/1",
      search: new URLSearchParams({ facility: activeFacilityId }).toString(),
    });
    (document.getElementById("start-date") as HTMLInputElement).value = "";
    (document.getElementById("end-date") as HTMLInputElement).value = "";
    setDateRangeFilter({
      startDate: "",
      endDate: "",
      startDateError: undefined,
      endDateError: undefined,
    });
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
        : filterFacilityId ?? activeFacilityId,
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
            dateRange={dateRangeFilter}
            setDateRange={setDateRangeFilter}
            activeFacilityId={activeFacilityId}
          />
          {totalEntries > 0 && (
            <table
              className="usa-table usa-table--borderless width-full"
              aria-hidden="true"
            >
              <thead>{generateTableHeaders(displayFacilityColumn)}</thead>
            </table>
          )}
        </div>
        {totalEntries > 0 && (
          <>
            <ResultsTable
              results={testResults as Result[]}
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
          </>
        )}
      </div>
      {totalEntries <= 0 && !loading && (
        <div className={"prime-container margin-top-2"}>
          <div
            className={
              "display-flex flex-column flex-align-center flex-justify-center"
            }
          >
            <h2 className={"margin-bottom-0 font-sans-md"}>No results found</h2>
            <p>
              Please note: test results are only stored for 30 days due to our{" "}
              <a
                href={
                  "https://www.simplereport.gov/using-simplereport/data-retention-limits/"
                }
              >
                data retention limits
              </a>
              {/*
               */}
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultsList;
