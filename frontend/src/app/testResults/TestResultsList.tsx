import { gql, useLazyQuery, useQuery } from "@apollo/client";
import React, {
  ChangeEventHandler,
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import classnames from "classnames";
import { faSlidersH } from "@fortawesome/free-solid-svg-icons";
import { DatePicker, Label } from "@trussworks/react-uswds";

import { PATIENT_TERM_CAP } from "../../config/constants";
import { displayFullName, displayFullNameInOrder } from "../utils";
import { isValidDate } from "../utils/date";
import {
  InjectedQueryWrapperProps,
  QueryWrapper,
} from "../commonComponents/QueryWrapper";
import { ActionsMenu } from "../commonComponents/ActionsMenu";
import { getUrl } from "../utils/url";
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

import TestResultPrintModal from "./TestResultPrintModal";
import TestResultCorrectionModal from "./TestResultCorrectionModal";
import TestResultDetailsModal from "./TestResultDetailsModal";

type Results = keyof typeof TEST_RESULT_DESCRIPTIONS;

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

interface Props {
  data: any;
  trackAction: () => void;
  refetch: () => void;
  loading: boolean;
  loadingTotalResults: boolean;
  page: number;
  entriesPerPage: number;
  totalEntries: number;
  setSelectedPatientId: Dispatch<SetStateAction<string>>;
  setResultFilter: Dispatch<SetStateAction<string>>;
  resultFilter: string;
  setRoleFilter: Dispatch<SetStateAction<string>>;
  roleFilter: string;
  setStartDateFilter: Dispatch<SetStateAction<string>>;
  startDateFilter: string;
  setEndDateFilter: Dispatch<SetStateAction<string>>;
  endDateFilter: string;
  facilityId: string;
}

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
  setDetailsModalId: SetStateAction<any>
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
        name: "View details",
        action: () => setDetailsModalId(r.internalId),
      },
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
          {displayFullNameInOrder(
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

export const DetachedTestResultsList: any = ({
  data,
  refetch,
  page,
  entriesPerPage,
  loading,
  loadingTotalResults,
  totalEntries,
  setSelectedPatientId,
  setResultFilter,
  resultFilter,
  setRoleFilter,
  roleFilter,
  setStartDateFilter,
  startDateFilter,
  setEndDateFilter,
  endDateFilter,
  facilityId,
}: Props) => {
  const [printModalId, setPrintModalId] = useState(undefined);
  const [markErrorId, setMarkErrorId] = useState(undefined);
  const [detailsModalId, setDetailsModalId] = useState<string>();
  const [showSuggestion, setShowSuggestion] = useState(true);
  const [startDateEntry, setStartDateEntry] = useState<string>();
  const [endDateEntry, setEndDateEntry] = useState<string>();
  const [startDateError, setStartDateError] = useState<string | undefined>();
  const [endDateError, setEndDateError] = useState<string | undefined>();

  const [queryString, debounced, setDebounced] = useDebounce("", {
    debounceTime: SEARCH_DEBOUNCE_TIME,
    runIf: (q) => q.length >= MIN_SEARCH_CHARACTER_COUNT,
  });

  const allowQuery = debounced.length >= MIN_SEARCH_CHARACTER_COUNT;

  const [queryPatients, { data: patientData }] = useLazyQuery(QUERY_PATIENT, {
    fetchPolicy: "no-cache",
    variables: { facilityId, namePrefixMatch: queryString },
  });

  useEffect(() => {
    if (queryString.trim() !== "") {
      queryPatients();
    }
  }, [queryString, queryPatients]);

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.target.value === "") {
      setSelectedPatientId("");
    }
    setShowSuggestion(true);
    setDebounced(event.target.value);
  };

  const onSearchClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
  };

  const onPatientSelect = (patient: Patient) => {
    setSelectedPatientId(patient.internalId);
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
    setDetailsModalId
  );

  function processDates() {
    var validStart = false;
    if (startDateEntry) {
      if (!isValidDate(startDateEntry)) {
        setStartDateError("Date must be in format MM/DD/YYYY or MM-DD-YYYY");
        setStartDateFilter("");
      } else {
        validStart = true;
        const startDate = moment(startDateEntry).startOf("day");
        setStartDateError(undefined);
        setStartDateFilter(startDate.toISOString());
      }
    }
    if (endDateEntry) {
      if (!isValidDate(endDateEntry)) {
        setEndDateError("Date must be in format MM/DD/YYYY or MM-DD-YYYY");
      } else {
        const endDate = moment(endDateEntry).endOf("day");
        if (validStart && endDate.isBefore(moment(startDateFilter))) {
          setEndDateError("End date cannot be before start date");
          setEndDateFilter("");
        } else {
          setEndDateError(undefined);
          setEndDateFilter(endDate.toISOString());
        }
      }
    }
  }

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
                Test Results
                {!loadingTotalResults && (
                  <span className="sr-showing-results-on-page">
                    Showing{" "}
                    {totalEntries === 0 ? 0 : (page - 1) * entriesPerPage + 1}-
                    {Math.min(entriesPerPage * page, totalEntries)} of{" "}
                    {totalEntries}
                  </span>
                )}
              </h2>
              <div>
                <Button
                  className="sr-active-button"
                  icon={faSlidersH}
                  onClick={() => {
                    setDebounced("");
                    setSelectedPatientId("");
                    setResultFilter("");
                    setRoleFilter("");
                    setStartDateFilter("");
                    setEndDateFilter("");
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
                    onSearchClick={onSearchClick}
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
                    loading={debounced !== queryString}
                    dropDownRef={dropDownRef}
                  />
                </div>
                <div className="usa-form-group date-filter-group">
                  <Label htmlFor="meeting-time">Date range (start)</Label>
                  {startDateError && (
                    <span className="usa-error-message" role="alert">
                      <span className="usa-sr-only">Error: </span>
                      {startDateError}
                    </span>
                  )}
                  <DatePicker
                    id="start-date"
                    name="start-date"
                    data-testid="start-date"
                    value={startDateEntry}
                    minDate="2000-01-01T00:00"
                    maxDate={moment().format("YYYY-MM-DDThh:mm")}
                    onChange={(v) => setStartDateEntry(v || "")}
                    onBlur={processDates}
                  />
                </div>
                <div className="usa-form-group date-filter-group">
                  <Label htmlFor="meeting-time">Date range (end)</Label>
                  {endDateError && (
                    <span className="usa-error-message" role="alert">
                      <span className="usa-sr-only">Error: </span>
                      {endDateError}
                    </span>
                  )}
                  <DatePicker
                    id="end-date"
                    name="end-date"
                    data-testid="end-date"
                    value={endDateEntry}
                    minDate={startDateFilter || "2000-01-01T00:00"}
                    maxDate={moment().format("YYYY-MM-DDThh:mm")}
                    onChange={(v) => setEndDateEntry(v || "")}
                    onBlur={processDates}
                  />
                </div>
                <Select
                  label="Result"
                  name="result"
                  value={resultFilter}
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
                  onChange={setResultFilter}
                />
                <Select
                  label="Role"
                  name="role"
                  value={roleFilter}
                  options={ROLE_VALUES}
                  defaultSelect
                  onChange={setRoleFilter}
                />
              </div>
            </div>
            <div className="usa-card__body">
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
                  currentPage={page}
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

type OmittedProps =
  | InjectedQueryWrapperProps
  | "pageCount"
  | "entriesPerPage"
  | "totalEntries"
  | "loadingTotalResults"
  | "facilityId"
  | "setSelectedPatientId"
  | "setResultFilter"
  | "resultFilter"
  | "setRoleFilter"
  | "roleFilter"
  | "setStartDateFilter"
  | "startDateFilter"
  | "setEndDateFilter"
  | "endDateFilter";

type TestResultsListProps = Omit<Props, OmittedProps>;

const TestResultsList = (props: TestResultsListProps) => {
  useDocumentTitle("Results");

  const activeFacilityId = useSelector(
    (state) => (state as any).facility.id as string
  );

  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [resultFilter, setResultFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");

  const entriesPerPage = 20;
  const pageNumber = props.page || 1;

  const queryVariables: {
    patientId?: string;
    facilityId: string;
    result?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    pageNumber: number;
    pageSize: number;
  } = {
    facilityId: activeFacilityId,
    pageNumber: pageNumber - 1,
    pageSize: entriesPerPage,
  };

  const countQueryVariables: {
    patientId?: string;
    facilityId: string;
    result?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
  } = { facilityId: activeFacilityId };

  if (selectedPatientId) {
    queryVariables.patientId = selectedPatientId;
    countQueryVariables.patientId = selectedPatientId;
  }

  if (resultFilter) {
    queryVariables.result = resultFilter;
    countQueryVariables.result = resultFilter;
  }

  if (roleFilter) {
    queryVariables.role = roleFilter;
    countQueryVariables.role = roleFilter;
  }

  if (startDateFilter) {
    queryVariables.startDate = startDateFilter;
    countQueryVariables.startDate = startDateFilter;
  }

  if (endDateFilter) {
    queryVariables.endDate = endDateFilter;
    countQueryVariables.endDate = endDateFilter;
  }

  const {
    data: totalResults,
    loading: loadingTotalResults,
    error,
    refetch: refetchCount,
  } = useQuery(resultsCountQuery, {
    variables: countQueryVariables,
    fetchPolicy: "no-cache",
  });

  if (activeFacilityId.length < 1) {
    return <div>"No facility selected"</div>;
  }

  if (error) {
    throw error;
  }

  const totalEntries = totalResults?.testResultsCount || 0;

  return (
    <QueryWrapper<Props>
      query={testResultQuery}
      queryOptions={{
        variables: queryVariables,
      }}
      onRefetch={refetchCount}
      Component={DetachedTestResultsList}
      displayLoadingIndicator={false}
      componentProps={{
        ...props,
        page: pageNumber,
        loadingTotalResults,
        totalEntries,
        entriesPerPage,
        setSelectedPatientId,
        setResultFilter,
        resultFilter,
        setRoleFilter,
        roleFilter,
        setStartDateFilter,
        startDateFilter,
        setEndDateFilter,
        endDateFilter,
        facilityId: activeFacilityId,
      }}
    />
  );
};

export default TestResultsList;
