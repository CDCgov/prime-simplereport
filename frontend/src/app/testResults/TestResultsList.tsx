import qs from "querystring";

import { useHistory } from "react-router-dom";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import React, {
  ChangeEventHandler,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import moment from "moment";
import classnames from "classnames";
import { faSlidersH } from "@fortawesome/free-solid-svg-icons";
import { DatePicker, Label } from "@trussworks/react-uswds";

import { PATIENT_TERM_CAP } from "../../config/constants";
import { displayFullName } from "../utils";
import { isValidDate } from "../utils/date";
import { ActionsMenu } from "../commonComponents/ActionsMenu";
import { getParameterFromUrl, getUrl } from "../utils/url";
import { useDocumentTitle, useOutsideClick } from "../utils/hooks";
import Pagination from "../commonComponents/Pagination";
import {
  COVID_RESULTS,
  ROLE_VALUES,
  TEST_RESULT_DESCRIPTIONS,
} from "../constants";
import "./TestResultsList.scss";
import Button from "../commonComponents/Button/Button";
import { useDebounce } from "../testQueue/addToQueue/useDebounce";
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

import TestResultPrintModal from "./TestResultPrintModal";
import EmailTestResultModal from "./EmailTestResultModal";
import TestResultCorrectionModal from "./TestResultCorrectionModal";
import TestResultDetailsModal from "./TestResultDetailsModal";

type Results = keyof typeof TEST_RESULT_DESCRIPTIONS;

function hasSymptoms(noSymptoms: boolean, symptoms: string) {
  if (noSymptoms) {
    return "No";
  }
  const symptomsList: Record<string, string> = JSON.parse(symptoms);
  for (let key in symptomsList) {
    if (symptomsList[key] === "true") {
      return "Yes";
    }
  }
  return "Unknown";
}

function testResultRows(
  testResults: any,
  setPrintModalId: SetStateAction<any>,
  setMarkErrorId: SetStateAction<any>,
  setDetailsModalId: SetStateAction<any>,
  setEmailModalTestResultId: SetStateAction<any>
) {
  const byDateTested = (a: any, b: any) => {
    // ISO string dates sort nicely
    if (a.dateTested === b.dateTested) return 0;
    if (a.dateTested < b.dateTested) return 1;
    return -1;
  };

  if (testResults.length === 0) {
    return (
      <tr>
        <td>No results</td>
      </tr>
    );
  }

  // `sort` mutates the array, so make a copy
  return [...testResults].sort(byDateTested).map((r) => {
    const removed = r.correctionStatus === "REMOVED";
    const actionItems = [
      { name: "Print result", action: () => setPrintModalId(r.internalId) },
      {
        name: "Email result",
        action: () => setEmailModalTestResultId(r.internalId),
      },
      { name: "View details", action: () => setDetailsModalId(r.internalId) },
    ];
    if (!removed) {
      actionItems.push({
        name: "Mark as error",
        action: () => setMarkErrorId(r.internalId),
      });
    }
    return (
      <tr
        key={r.internalId}
        title={removed ? "Marked as error" : ""}
        className={classnames(
          "sr-test-result-row",
          removed && "sr-test-result-row--removed"
        )}
        data-patient-link={
          r.patientLink
            ? `${getUrl()}pxp?plid=${r.patientLink.internalId}`
            : null
        }
      >
        <th scope="row">
          {displayFullName(
            r.patient.firstName,
            r.patient.middleName,
            r.patient.lastName
          )}
          <span className="display-block text-base font-ui-2xs">
            DOB: {moment(r.patient.birthDate).format("MM/DD/YYYY")}
          </span>
        </th>
        <td>{moment(r.dateTested).format("MM/DD/YYYY h:mma")}</td>
        <td>{TEST_RESULT_DESCRIPTIONS[r.result as Results]}</td>
        <td>{r.deviceType.name}</td>
        <td>{hasSymptoms(r.noSymptoms, r.symptoms)}</td>
        <td>
          {displayFullName(
            r.createdBy.nameInfo.firstName,
            r.createdBy.nameInfo.middleName,
            r.createdBy.nameInfo.lastName
          )}
        </td>
        <td>
          <ActionsMenu items={actionItems} />
        </td>
      </tr>
    );
  });
}

export type FilterParams = {
  patientId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  role?: string | null;
  result?: string | null;
};

interface DetachedTestResultsListProps {
  data: any;
  refetch: () => void;
  loading: boolean;
  loadingTotalResults: boolean;
  pageNumber: number;
  entriesPerPage: number;
  totalEntries: number;
  filterParams: FilterParams;
  setFilterParams: (filter: keyof FilterParams) => (val: string | null) => void;
  clearFilterParams: () => void;
  facilityId: string;
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

const getFilteredPatientName = (params: FilterParams, data: any) => {
  const person = data?.testResults[0]?.patient;
  if (params.patientId && person) {
    return displayFullName(
      person.firstName,
      person.middleName,
      person.lastName
    );
  }
  return null;
};

export const DetachedTestResultsList = ({
  data,
  refetch,
  pageNumber,
  entriesPerPage,
  loading,
  loadingTotalResults,
  totalEntries,
  facilityId,
  filterParams,
  setFilterParams,
  clearFilterParams,
}: DetachedTestResultsListProps) => {
  const [printModalId, setPrintModalId] = useState(undefined);
  const [markErrorId, setMarkErrorId] = useState(undefined);
  const [detailsModalId, setDetailsModalId] = useState<string>();
  const [
    emailModalTestResultId,
    setEmailModalTestResultId,
  ] = useState<string>();
  const [showSuggestion, setShowSuggestion] = useState(true);
  const [startDateError, setStartDateError] = useState<string | undefined>();
  const [endDateError, setEndDateError] = useState<string | undefined>();
  const [resetCount, setResetCount] = useState<number>(0);

  const [queryString, debounced, setDebounced] = useDebounce("", {
    debounceTime: SEARCH_DEBOUNCE_TIME,
    runIf: (q) => q.length >= MIN_SEARCH_CHARACTER_COUNT,
  });

  const allowQuery = debounced.length >= MIN_SEARCH_CHARACTER_COUNT;

  const [
    queryPatients,
    { data: patientData, loading: patientLoading },
  ] = useLazyQuery(QUERY_PATIENT, {
    fetchPolicy: "no-cache",
    variables: { facilityId, namePrefixMatch: queryString },
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
    const patientName = getFilteredPatientName(filterParams, data);
    if (patientName) {
      setDebounced(patientName);
      setShowSuggestion(false);
    }
  }, [filterParams, data, setDebounced]);

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
  const showDropdown = useMemo(() => allowQuery && showSuggestion, [
    allowQuery,
    showSuggestion,
  ]);
  const hideOnOutsideClick = useCallback(() => {
    setShowSuggestion(false);
  }, []);

  useOutsideClick(dropDownRef, hideOnOutsideClick);

  if (printModalId) {
    return (
      <TestResultPrintModal
        testResultId={printModalId}
        closeModal={() => setPrintModalId(undefined)}
      />
    );
  }
  if (emailModalTestResultId) {
    return (
      <EmailTestResultModal
        testResultId={emailModalTestResultId}
        closeModal={() => setEmailModalTestResultId(undefined)}
      />
    );
  }
  if (markErrorId) {
    return (
      <TestResultCorrectionModal
        testResultId={markErrorId}
        closeModal={() => {
          setMarkErrorId(undefined);
          refetch();
        }}
      />
    );
  }

  const testResults = data?.testResults || [];

  const rows = testResultRows(
    testResults,
    setPrintModalId,
    setMarkErrorId,
    setDetailsModalId,
    setEmailModalTestResultId
  );

  const processStartDate = (value: string | undefined) => {
    if (value) {
      if (!isValidDate(value, true)) {
        setStartDateError("Date must be in format MM/DD/YYYY");
      } else {
        const startDate = moment(value, "MM/DD/YYYY").startOf("day");
        setStartDateError(undefined);
        setFilterParams("startDate")(startDate.toISOString());
      }
    } else {
      setFilterParams("startDate")("");
    }
  };

  const processEndDate = (value: string | undefined) => {
    if (value) {
      if (!isValidDate(value)) {
        setEndDateError("Date must be in format MM/DD/YYYY");
      } else {
        const endDate = moment(value, "MM/DD/YYYY").endOf("day");
        if (
          isValidDate(filterParams.startDate || "") &&
          endDate.isBefore(moment(filterParams.startDate))
        ) {
          setEndDateError("End date cannot be before start date");
          setFilterParams("endDate")("");
        } else {
          setEndDateError(undefined);
          setFilterParams("endDate")(endDate.toISOString());
        }
      }
    } else {
      setFilterParams("endDate")("");
    }
  };

  return (
    <main className="prime-home">
      {detailsModalId && (
        <TestResultDetailsModal
          testResultId={detailsModalId}
          closeModal={() => {
            setDetailsModalId(undefined);
          }}
        />
      )}
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container sr-test-results-list">
            <div className="usa-card__header">
              <h2>
                Test results
                {!loadingTotalResults && (
                  <span className="sr-showing-results-on-page">
                    {getResultCountText(
                      totalEntries,
                      pageNumber,
                      entriesPerPage
                    )}
                  </span>
                )}
              </h2>
              <div>
                <Button
                  className="sr-active-button"
                  icon={faSlidersH}
                  onClick={() => {
                    setDebounced("");
                    clearFilterParams();
                    // The DatePicker component contains bits of state that represent the selected date
                    // as represented internally to the component and displayed externally to the DOM. Directly
                    // changing the value of the date via props does not cause the internal state to be updated.
                    // This hack forces the DatePicker component to be fully re-mounted whenever the filters are
                    // cleared, therefore resetting the external date display.
                    setResetCount(resetCount + 1);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </div>
            <div
              id="test-results-search-by-patient-input"
              className="position-relative bg-base-lightest"
            >
              <div className="display-flex grid-row grid-gap flex-row flex-align-end padding-x-3 padding-y-2">
                <div className="person-search">
                  <SearchInput
                    onInputChange={onInputChange}
                    queryString={debounced}
                    disabled={!allowQuery}
                    label={"Search by name"}
                    placeholder={""}
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
                  />
                </div>
                <div className="usa-form-group date-filter-group">
                  <Label htmlFor="start-date">Date range (start)</Label>
                  {startDateError && (
                    <span className="usa-error-message" role="alert">
                      <span className="usa-sr-only">Error: </span>
                      {startDateError}
                    </span>
                  )}
                  <DatePicker
                    id="start-date"
                    key={resetCount}
                    name="start-date"
                    defaultValue={filterParams.startDate || ""}
                    data-testid="start-date"
                    minDate="2000-01-01T00:00"
                    maxDate={moment().format("YYYY-MM-DDThh:mm")}
                    onChange={processStartDate}
                  />
                </div>
                <div className="usa-form-group date-filter-group">
                  <Label htmlFor="end-date">Date range (end)</Label>
                  {endDateError && (
                    <span className="usa-error-message" role="alert">
                      <span className="usa-sr-only">Error: </span>
                      {endDateError}
                    </span>
                  )}
                  <DatePicker
                    id="end-date"
                    key={resetCount + 1}
                    name="end-date"
                    defaultValue={filterParams.endDate || ""}
                    data-testid="end-date"
                    minDate={filterParams.startDate || "2000-01-01T00:00"}
                    maxDate={moment().format("YYYY-MM-DDThh:mm")}
                    onChange={processEndDate}
                  />
                </div>
                <Select
                  label="Result"
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
              </div>
            </div>
            <div className="usa-card__body" title="filtered-result">
              <table className="usa-table usa-table--borderless width-full">
                <thead>
                  <tr>
                    <th scope="col">{PATIENT_TERM_CAP}</th>
                    <th scope="col">Test date</th>
                    <th scope="col">Result</th>
                    <th scope="col">Device</th>
                    <th scope="col">Symptoms</th>
                    <th scope="col">Submitter</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </table>
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
      </div>
    </main>
  );
};

export const resultsCountQuery = gql`
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

export const testResultQuery = gql`
  query GetFacilityResults(
    $facilityId: ID
    $patientId: ID
    $result: String
    $role: String
    $startDate: DateTime
    $endDate: DateTime
    $pageNumber: Int
    $pageSize: Int
  ) {
    testResults(
      facilityId: $facilityId
      patientId: $patientId
      result: $result
      role: $role
      startDate: $startDate
      endDate: $endDate
      pageNumber: $pageNumber
      pageSize: $pageSize
    ) {
      internalId
      dateTested
      result
      correctionStatus
      deviceType {
        internalId
        name
      }
      patient {
        internalId
        firstName
        middleName
        lastName
        birthDate
        gender
        lookupId
      }
      createdBy {
        nameInfo {
          firstName
          middleName
          lastName
        }
      }
      patientLink {
        internalId
      }
      symptoms
      noSymptoms
    }
  }
`;

type TestResultsListProps = {
  pageNumber: number;
};

const TestResultsList = (props: TestResultsListProps) => {
  useDocumentTitle("Results");

  const [facility] = useSelectedFacility();
  const activeFacilityId = facility?.id || "";

  const history = useHistory();

  const patientId = getParameterFromUrl("patientId", history.location);
  const startDate = getParameterFromUrl("startDate", history.location);
  const endDate = getParameterFromUrl("endDate", history.location);
  const role = getParameterFromUrl("role", history.location);
  const result = getParameterFromUrl("result", history.location);

  const filterParams: FilterParams = {
    ...(patientId && { patientId: patientId }),
    ...(startDate && { startDate: startDate }),
    ...(endDate && { endDate: endDate }),
    ...(result && { result: result }),
    ...(role && { role: role }),
  };

  const filter = (params: FilterParams) => {
    history.push({
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

  const refetch = () => history.go(0);

  const clearFilterParams = () =>
    history.push({
      pathname: "/results/1",
      search: qs.stringify({ facility: activeFacilityId }),
    });

  const entriesPerPage = 20;
  const pageNumber = props.pageNumber || 1;

  const resultsQueryVariables: {
    patientId?: string | null;
    facilityId: string;
    result?: string | null;
    role?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    pageNumber: number;
    pageSize: number;
  } = {
    facilityId: activeFacilityId,
    pageNumber: pageNumber - 1,
    pageSize: entriesPerPage,
    ...filterParams,
  };
  const countQueryVariables: {
    patientId?: string | null;
    facilityId: string;
    result?: string | null;
    role?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  } = {
    facilityId: activeFacilityId,
    ...filterParams,
  };

  const count = useQuery(resultsCountQuery, {
    fetchPolicy: "no-cache",
    variables: countQueryVariables,
  });
  const results = useQuery(testResultQuery, {
    fetchPolicy: "no-cache",
    variables: resultsQueryVariables,
  });

  if (!activeFacilityId) {
    return <div>"No facility selected"</div>;
  }

  if (results.error || count.error) {
    throw results.error || count.error;
  }

  const totalEntries = count.data?.testResultsCount || 0;

  return (
    <DetachedTestResultsList
      data={results.data}
      loading={results.loading}
      pageNumber={pageNumber}
      loadingTotalResults={count.loading}
      entriesPerPage={entriesPerPage}
      totalEntries={totalEntries}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      clearFilterParams={clearFilterParams}
      facilityId={activeFacilityId}
      refetch={refetch}
    />
  );
};

export default TestResultsList;
