import qs from "querystring";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useLazyQuery } from "@apollo/client";
import React, {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import moment from "moment";
import { faSlidersH } from "@fortawesome/free-solid-svg-icons";
import { Label } from "@trussworks/react-uswds";

import { displayFullName, facilityDisplayName } from "../utils";
import { isValidDate } from "../utils/date";
import { getParameterFromUrl } from "../utils/url";
import { useDocumentTitle, useOutsideClick } from "../utils/hooks";
import { useAppSelector } from "../store";
import Pagination from "../commonComponents/Pagination";
import {
  COVID_RESULTS,
  ROLE_VALUES,
  TEST_RESULT_DESCRIPTIONS,
} from "../constants";
import "./TestResultsList.scss";
import Button from "../commonComponents/Button/Button";
import {
  useDebounce,
  useDebouncedEffect,
} from "../testQueue/addToQueue/useDebounce";
import {
  MIN_SEARCH_CHARACTER_COUNT,
  SEARCH_DEBOUNCE_TIME,
} from "../testQueue/constants";
import SearchInput from "../testQueue/addToQueue/SearchInput";
import { QUERY_PATIENT } from "../testQueue/addToQueue/AddToQueueSearch";
import { Patient } from "../patients/ManagePatients";
import SearchResults from "../testQueue/addToQueue/SearchResults";
import Select from "../commonComponents/Select";
import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";
import { appPermissions, hasPermission } from "../permissions";
import {
  ArchivedStatus,
  GetFacilityResultsMultiplexWithCountQuery,
  Maybe,
  TestResult,
  useGetAllFacilitiesQuery,
  useGetFacilityResultsMultiplexWithCountQuery,
} from "../../generated/graphql";
import { waitForElement } from "../utils/elements";

import TestResultPrintModal from "./TestResultPrintModal";
import TestResultTextModal from "./TestResultTextModal";
import EmailTestResultModal from "./EmailTestResultModal";
import TestResultCorrectionModal from "./TestResultCorrectionModal";
import TestResultDetailsModal from "./TestResultDetailsModal";
import DownloadResultsCSVButton from "./DownloadResultsCsvButton";
import ResultsTable, {
  generateTableHeaders,
} from "./resultsTable/ResultsTable";

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
  data: GetFacilityResultsMultiplexWithCountQuery | undefined;
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

  return `Showing ${from}-${to} of ${totalEntries}`;
};

const getFilteredPatientName = (
  params: FilterParams,
  data: GetFacilityResultsMultiplexWithCountQuery
) => {
  const firstLoadedContentEntry =
    data?.testResultsPage?.content && data?.testResultsPage?.content[0];
  const person = firstLoadedContentEntry && firstLoadedContentEntry.patient;
  if (params.patientId && person) {
    return displayFullName(
      person.firstName,
      person.middleName,
      person.lastName
    );
  }
  return null;
};

const setFocusOnActionMenu = (id: string, actionName: string) => {
  const buttonSelector = `#action_${id}`;
  const printButtonSelector = `#${actionName}_${id}`;
  waitForElement(buttonSelector).then((actionButton) => {
    (actionButton as HTMLElement)?.click();
    waitForElement(printButtonSelector).then((printButton) => {
      (printButton as HTMLElement)?.focus();
      const event = new MouseEvent("mouseover", {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      printButton?.dispatchEvent(event);
    });
  });
};

const ErrorMessage: React.FC<{ message: string | undefined }> = ({
  message,
}) => {
  if (message) {
    return (
      <span className="usa-error-message" role="alert">
        <span className="usa-sr-only">Error: </span>
        {message}
      </span>
    );
  }
  return null;
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

export const DetachedTestResultsList = ({
  data,
  pageNumber,
  entriesPerPage,
  loading,
  totalEntries,
  activeFacilityId,
  filterParams,
  setFilterParams,
  clearFilterParams,
  maxDate = moment().format("YYYY-MM-DD"),
}: DetachedTestResultsListProps) => {
  const [printModalId, setPrintModalId] = useState<Maybe<string> | undefined>(
    undefined
  );
  const [markCorrectionId, setMarkCorrectionId] = useState<
    Maybe<string> | undefined
  >(undefined);
  const [detailsModalId, setDetailsModalId] = useState<
    Maybe<string> | undefined
  >();
  const [textModalId, setTextModalId] = useState<Maybe<string> | undefined>();
  const [emailModalTestResultId, setEmailModalTestResultId] = useState<
    Maybe<string> | undefined
  >();
  const [showSuggestion, setShowSuggestion] = useState(true);
  const [startDateError, setStartDateError] = useState<string | undefined>();
  const [endDateError, setEndDateError] = useState<string | undefined>();
  const [startDate, setStartDate] = useState<string | null>("0");
  const [endDate, setEndDate] = useState<string | null>("0");

  const [queryString, debounced, setDebounced] = useDebounce("", {
    debounceTime: SEARCH_DEBOUNCE_TIME,
    runIf: (q) => q.length >= MIN_SEARCH_CHARACTER_COUNT,
  });

  const allowQuery = debounced.length >= MIN_SEARCH_CHARACTER_COUNT;

  const isOrgAdmin = hasPermission(
    useAppSelector((state) => state.user.permissions),
    appPermissions.settings.canView
  );

  const canAddPatient = hasPermission(
    useAppSelector((state) => state.user.permissions),
    appPermissions.people.canEdit
  );

  const [queryPatients, { data: patientData, loading: patientLoading }] =
    useLazyQuery(QUERY_PATIENT, {
      fetchPolicy: "no-cache",
      variables: {
        archivedStatus: isOrgAdmin
          ? ArchivedStatus.All
          : ArchivedStatus.Unarchived,
        facilityId:
          filterParams.filterFacilityId === ALL_FACILITIES_ID
            ? null
            : filterParams.filterFacilityId || activeFacilityId,
        namePrefixMatch: queryString,
        includeArchivedFacilities: isOrgAdmin,
      },
    });

  const { data: facilitiesData } = useGetAllFacilitiesQuery({
    fetchPolicy: "no-cache",
    variables: {
      showArchived: isOrgAdmin,
    },
  });

  useEffect(() => {
    if (queryString.trim() !== "") {
      queryPatients();
    }
  }, [queryString, queryPatients]);

  useEffect(() => {
    if (!filterParams.patientId) {
      setDebounced("");
    }
  }, [filterParams, setDebounced]);

  useEffect(() => {
    if (data) {
      const patientName = getFilteredPatientName(filterParams, data);
      if (patientName) {
        setDebounced(patientName);
        setShowSuggestion(false);
      }
    }
  }, [filterParams, data, setDebounced]);

  useDebouncedEffect(
    () => {
      if (startDate !== "0") {
        setFilterParams("startDate")(startDate);
      }
    },
    [startDate],
    SEARCH_DEBOUNCE_TIME
  );
  useDebouncedEffect(
    () => {
      if (endDate !== "0") {
        setFilterParams("endDate")(endDate);
      }
    },
    [endDate],
    SEARCH_DEBOUNCE_TIME
  );

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.target.value === "") {
      setFilterParams("patientId")(null);
    }
    setShowSuggestion(true);
    if (event.target.value !== queryString) {
      setDebounced(event.target.value);
    }
  };

  const onPatientSelect = (patient: Patient) => {
    setFilterParams("patientId")(patient.internalId);
    setDebounced(
      displayFullName(patient.firstName, patient.middleName, patient.lastName)
    );
    setShowSuggestion(false);
  };

  const dropDownRef = useRef(null);
  const showDropdown = useMemo(
    () => allowQuery && showSuggestion,
    [allowQuery, showSuggestion]
  );
  const hideOnOutsideClick = useCallback(() => {
    setShowSuggestion(false);
  }, []);

  useOutsideClick(dropDownRef, hideOnOutsideClick);

  if (printModalId) {
    return (
      <TestResultPrintModal
        testResultId={printModalId}
        closeModal={() => {
          setFocusOnActionMenu(printModalId, "print");
          setPrintModalId(undefined);
        }}
      />
    );
  }
  if (textModalId) {
    return (
      <TestResultTextModal
        testResultId={textModalId}
        closeModal={() => {
          setFocusOnActionMenu(textModalId, "text");
          setTextModalId(undefined);
        }}
      />
    );
  }
  if (emailModalTestResultId) {
    return (
      <EmailTestResultModal
        testResultId={emailModalTestResultId}
        closeModal={() => {
          setFocusOnActionMenu(emailModalTestResultId, "email");
          setEmailModalTestResultId(undefined);
        }}
      />
    );
  }
  if (markCorrectionId) {
    return (
      <TestResultCorrectionModal
        testResultId={markCorrectionId}
        isFacilityDeleted={
          data?.testResultsPage?.content?.find(
            (content) => content?.internalId === markCorrectionId
          )?.facility?.isDeleted ?? false
        }
        closeModal={() => {
          setFocusOnActionMenu(markCorrectionId, "correct");
          setMarkCorrectionId(undefined);
        }}
      />
    );
  }
  if (detailsModalId) {
    return (
      <TestResultDetailsModal
        testResultId={detailsModalId}
        closeModal={() => {
          setFocusOnActionMenu(detailsModalId, "view");
          setDetailsModalId(undefined);
        }}
      />
    );
  }

  const testResults = data?.testResultsPage?.content || [];
  const displayFacilityColumn =
    filterParams.filterFacilityId === ALL_FACILITIES_ID ||
    activeFacilityId === ALL_FACILITIES_ID;

  const hasMultiplexResults = testResults.some(
    (result: any) =>
      result.results?.length &&
      result.results.some((r: any) => r.disease.name !== "COVID-19")
  );

  const processStartDate = (value: string | undefined) => {
    if (value) {
      if (!isValidDate(value, true)) {
        setStartDateError("Date must be in format MM/DD/YYYY");
      } else {
        const startDate = moment(value, "YYYY-MM-DD").startOf("day");
        setStartDateError(undefined);
        setStartDate(startDate.toISOString());
      }
    } else {
      setStartDate("");
    }
  };

  const processEndDate = (value: string | undefined) => {
    if (value) {
      if (!isValidDate(value)) {
        setEndDateError("Date must be in format MM/DD/YYYY");
      } else {
        const endDate = moment(value, "YYYY-MM-DD").endOf("day");
        if (
          isValidDate(filterParams.startDate || "") &&
          endDate.isBefore(moment(filterParams.startDate))
        ) {
          setEndDateError("End date cannot be before start date");
          setEndDate("");
        } else {
          setEndDateError(undefined);
          setEndDate(endDate.toISOString());
        }
      }
    } else {
      setEndDate("");
    }
  };

  const viewableFacilities: any[] = (facilitiesData?.facilities || []).filter(
    (e) => e != null
  );
  viewableFacilities.sort((a, b) => {
    if (a.isDeleted && !b.isDeleted) return 1;
    if (!a.isDeleted && b.isDeleted) return -1;
    return 0;
  });
  const facilityOptions = (
    isOrgAdmin
      ? [
          {
            label: "All facilities",
            value: ALL_FACILITIES_ID,
          },
        ]
      : []
  ).concat(
    viewableFacilities.map((f) => ({
      label: facilityDisplayName(f.name, !!f.isDeleted),
      value: f.id,
    }))
  );

  function getDateOrEmptyString(date: string | null | undefined) {
    return date ? moment(date).format("YYYY-MM-DD") : "";
  }

  return (
    <div className="grid-row">
      <div className="prime-container card-container sr-test-results-list">
        <div className="sticky-heading">
          <div className="usa-card__header">
            <h1 className="font-sans-lg">
              Test results
              {!loading && (
                <span className="sr-showing-results-on-page">
                  {getResultCountText(totalEntries, pageNumber, entriesPerPage)}
                </span>
              )}
            </h1>
            <div>
              <DownloadResultsCSVButton
                filterParams={filterParams}
                totalEntries={totalEntries}
                activeFacilityId={activeFacilityId}
              />
              <Button
                className="sr-active-button"
                icon={faSlidersH}
                onClick={() => {
                  setDebounced("");
                  clearFilterParams();
                  (
                    document.getElementById("start-date") as HTMLInputElement
                  ).value = "";
                  (
                    document.getElementById("end-date") as HTMLInputElement
                  ).value = "";
                  setStartDateError("");
                  setEndDateError("");
                }}
                disabled={isClearFilterBtnDisabled(
                  filterParams,
                  activeFacilityId
                )}
              >
                Clear filters
              </Button>
            </div>
          </div>
          <div
            id="test-results-search-by-patient-input"
            className="position-relative bg-base-lightest"
            role="search"
          >
            <div className="display-flex grid-row grid-gap flex-row flex-align-end padding-x-3 padding-y-2">
              <div className="person-search">
                <SearchInput
                  onSearchClick={(e) => e.preventDefault()}
                  onInputChange={onInputChange}
                  queryString={debounced}
                  disabled={!allowQuery}
                  label={"Search by name"}
                  className="usa-form-group search-input_without_submit_button"
                  showSubmitButton={false}
                />
                <SearchResults
                  page="test-results"
                  patients={patientData?.patients || []}
                  onPatientSelect={onPatientSelect}
                  shouldShowSuggestions={showDropdown}
                  loading={debounced !== queryString || patientLoading}
                  dropDownRef={dropDownRef}
                  canAddPatient={canAddPatient}
                />
              </div>
              <div className="usa-form-group date-filter-group">
                <Label htmlFor="start-date">Date range (start)</Label>
                <ErrorMessage message={startDateError} />
                <input
                  id="start-date"
                  type="date"
                  className="usa-input"
                  min="2000-01-01"
                  max={maxDate}
                  onChange={(e) => processStartDate(e.target.value)}
                  defaultValue={getDateOrEmptyString(filterParams.startDate)}
                />
              </div>
              <div className="usa-form-group date-filter-group">
                <Label htmlFor="end-date">Date range (end)</Label>
                <ErrorMessage message={endDateError} />
                <input
                  id="end-date"
                  type="date"
                  className="usa-input"
                  min="2000-01-01"
                  max={maxDate}
                  onChange={(e) => processEndDate(e.target.value)}
                  defaultValue={getDateOrEmptyString(filterParams.endDate)}
                />
              </div>
              <Select
                label="Test result"
                name="result"
                value={filterParams.result || ""}
                options={[
                  {
                    value: COVID_RESULTS.POSITIVE,
                    label: TEST_RESULT_DESCRIPTIONS.POSITIVE,
                  },
                  {
                    value: COVID_RESULTS.NEGATIVE,
                    label: TEST_RESULT_DESCRIPTIONS.NEGATIVE,
                  },
                  {
                    value: COVID_RESULTS.INCONCLUSIVE,
                    label: TEST_RESULT_DESCRIPTIONS.UNDETERMINED,
                  },
                ]}
                defaultSelect
                onChange={setFilterParams("result")}
              />
              <Select
                label="Role"
                name="role"
                value={filterParams.role || ""}
                options={ROLE_VALUES}
                defaultSelect
                onChange={setFilterParams("role")}
              />
              {facilityOptions?.length > 1 ? (
                <Select
                  label="Testing facility"
                  name="facility"
                  value={filterParams.filterFacilityId || activeFacilityId}
                  options={facilityOptions}
                  onChange={setFilterParams("filterFacilityId")}
                  selectClassName={"usa-select-narrow"}
                />
              ) : null}
            </div>
          </div>
          <table
            className="usa-table usa-table--borderless width-full"
            aria-hidden="true"
          >
            <thead>
              {generateTableHeaders(hasMultiplexResults, displayFacilityColumn)}
            </thead>
          </table>
        </div>
        <div title="filtered-result">
          <ResultsTable
            results={testResults as TestResult[]}
            setPrintModalId={setPrintModalId}
            setMarkCorrectionId={setMarkCorrectionId}
            setDetailsModalId={setDetailsModalId}
            setTextModalId={setTextModalId}
            setEmailModalTestResultId={setEmailModalTestResultId}
            hasMultiplexResults={hasMultiplexResults}
            hasFacility={displayFacilityColumn}
          />
        </div>
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

export interface ResultsQueryVariables {
  patientId?: string | null;
  facilityId: string | null;
  result?: string | null;
  role?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  pageNumber: number;
  pageSize: number;
}

const TestResultsList = () => {
  useDocumentTitle("Results");
  const urlParams = useParams();

  const [facility] = useSelectedFacility();
  const activeFacilityId = facility?.id || "";

  const navigate = useNavigate();
  const location = useLocation();

  const patientId = getParameterFromUrl("patientId", location);
  const startDate = getParameterFromUrl("startDate", location);
  const endDate = getParameterFromUrl("endDate", location);
  const role = getParameterFromUrl("role", location);
  const result = getParameterFromUrl("result", location);
  const filterFacilityId = getParameterFromUrl("filterFacilityId", location);

  const queryParams = {
    ...(patientId && { patientId: patientId }),
    ...(startDate && { startDate: startDate }),
    ...(endDate && { endDate: endDate }),
    ...(result && { result: result }),
    ...(role && { role: role }),
  };

  const filterParams: FilterParams = {
    ...queryParams,
    ...(filterFacilityId && { filterFacilityId: filterFacilityId }),
  };

  const filter = (params: FilterParams) => {
    navigate({
      pathname: "/results/1",
      search: qs.stringify({
        facility: activeFacilityId,
        ...filterParams,
        ...params,
      }),
    });
  };

  const setFilterParams = (key: keyof FilterParams) => (val: string | null) => {
    filter({ [key]: val });
  };

  const clearFilterParams = () =>
    navigate({
      pathname: "/results/1",
      search: qs.stringify({ facility: activeFacilityId }),
    });

  const entriesPerPage = 20;
  const pageNumber = Number(urlParams.pageNumber) || 1;

  const resultsQueryVariables: ResultsQueryVariables = {
    facilityId:
      filterFacilityId === ALL_FACILITIES_ID
        ? null
        : filterFacilityId || activeFacilityId,
    pageNumber: pageNumber - 1,
    pageSize: entriesPerPage,
    ...queryParams,
  };

  const results = useGetFacilityResultsMultiplexWithCountQuery({
    fetchPolicy: "no-cache",
    variables: resultsQueryVariables,
  });

  if (!activeFacilityId) {
    return <div>"No facility selected"</div>;
  }

  if (results.error) {
    throw results.error;
  }
  const totalEntries = results.data?.testResultsPage?.totalElements || 0;

  return (
    <DetachedTestResultsList
      data={results.data}
      loading={results.loading}
      pageNumber={pageNumber}
      entriesPerPage={entriesPerPage}
      totalEntries={totalEntries}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      clearFilterParams={clearFilterParams}
      activeFacilityId={activeFacilityId}
    />
  );
};

export default TestResultsList;
