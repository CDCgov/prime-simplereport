import { gql, useLazyQuery, useQuery } from "@apollo/client";
import React, {
  ChangeEventHandler,
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import classnames from "classnames";
import { faSlidersH } from "@fortawesome/free-solid-svg-icons";

import { PATIENT_TERM_CAP } from "../../config/constants";
import { displayFullName, displayFullNameInOrder } from "../utils";
import {
  InjectedQueryWrapperProps,
  QueryWrapper,
} from "../commonComponents/QueryWrapper";
import { ActionsMenu } from "../commonComponents/ActionsMenu";
import { getUrl } from "../utils/url";
import Pagination from "../commonComponents/Pagination";
import { TEST_RESULT_DESCRIPTIONS } from "../constants";
import "./TestResultsList.scss";
import Button from "../commonComponents/Button";
import { useDebounce } from "../testQueue/addToQueue/useDebounce";
import {
  MIN_SEARCH_CHARACTER_COUNT,
  SEARCH_DEBOUNCE_TIME,
} from "../testQueue/constants";
import SearchInput from "../testQueue/addToQueue/SearchInput";
import { QUERY_PATIENT } from "../testQueue/addToQueue/AddToQueueSearch";
import { Patient } from "../patients/ManagePatients";

import TestResultPrintModal from "./TestResultPrintModal";
import TestResultCorrectionModal from "./TestResultCorrectionModal";
import TestResultsByPatientSearch from "./TestResultsByPatientSearch";

type Results = keyof typeof TEST_RESULT_DESCRIPTIONS;

export const testResultQuery = gql`
  query GetFacilityResults($facilityId: ID!, $pageNumber: Int, $pageSize: Int) {
    testResults(
      facilityId: $facilityId
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

export const testResultByPatientQuery = gql`
  query GetPatientResults($patientId: ID!, $pageNumber: Int, $pageSize: Int) {
    testResultsByPatient(
      patientId: $patientId
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
  page: number;
  entriesPerPage: number;
  totalEntries: number;
  setSelectedPatientId: Dispatch<SetStateAction<string>>;
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

export const DetachedTestResultsList: any = ({
  data,
  refetch,
  page,
  entriesPerPage,
  totalEntries,
  setSelectedPatientId,
  facilityId,
}: Props) => {
  const [printModalId, setPrintModalId] = useState(undefined);
  const [markErrorId, setMarkErrorId] = useState(undefined);
  const [showFilters, setShowFilters] = useState(false);

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
    setDebounced(event.target.value);
  };

  const onSearchClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
  };

  const onPatientSelect = (patient: Patient) => {
    setDebounced("");
    setSelectedPatientId(patient.internalId);
  };

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

  const testResultRows = () => {
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
  };

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container sr-test-results-list">
            <div className="usa-card__header">
              <h2>
                Test Results
                <span className="sr-showing-results-on-page">
                  Showing {Math.min(entriesPerPage, totalEntries)} of{" "}
                  {totalEntries}
                </span>
              </h2>
              <div>
                <Button
                  variant={!showFilters ? "outline" : undefined}
                  className={showFilters ? "sr-active-button" : undefined}
                  icon={faSlidersH}
                  onClick={() => {
                    if (showFilters) {
                      setDebounced("");
                    }
                    setShowFilters(!showFilters);
                  }}
                >
                  {showFilters ? "Clear filters" : "Filter"}
                </Button>
              </div>
            </div>
            {showFilters && (
              <div
                id="test-results-search-by-patient-input"
                className="display-flex flex-row position-relative bg-base-lightest padding-x-3 padding-y-2"
              >
                <SearchInput
                  onSearchClick={onSearchClick}
                  onInputChange={onInputChange}
                  queryString={debounced}
                  disabled={!allowQuery}
                  placeholder={"Filter test results by a specific patient"}
                />
                <TestResultsByPatientSearch
                  patients={patientData?.patients || []}
                  onPatientSelect={onPatientSelect}
                  shouldShowSuggestions={allowQuery}
                  loading={debounced !== queryString}
                />
              </div>
            )}
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
                <tbody>{testResultRows()}</tbody>
              </table>
            </div>
            <div className="usa-card__footer">
              <Pagination
                baseRoute="/results"
                currentPage={page}
                entriesPerPage={entriesPerPage}
                totalEntries={totalEntries}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export const resultsCountQuery = gql`
  query GetResultsCountByFacility($facilityId: ID!) {
    testResultsCount(facilityId: $facilityId)
  }
`;
export const resultsCountByPatientQuery = gql`
  query GetResultsCountByPatient($patientId: ID!) {
    testResultsCountByPatient(patientId: $patientId)
  }
`;

const TestResultsList = (
  props: Omit<
    Props,
    | InjectedQueryWrapperProps
    | "pageCount"
    | "entriesPerPage"
    | "totalEntries"
    | "facilityId"
    | "setSelectedPatientId"
  >
) => {
  const activeFacilityId = useSelector(
    (state) => (state as any).facility.id as string
  );

  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  const entriesPerPage = 20;
  const pageNumber = props.page || 1;

  let query, countQuery, countQueryVariables;
  const queryVariables: {
    patientId?: string;
    facilityId?: string;
    pageNumber: number;
    pageSize: number;
  } = {
    pageNumber: pageNumber - 1,
    pageSize: entriesPerPage,
  };

  if (selectedPatientId) {
    query = testResultByPatientQuery;
    countQuery = resultsCountByPatientQuery;
    queryVariables.patientId = selectedPatientId;
    countQueryVariables = { patientId: selectedPatientId };
  } else {
    query = testResultQuery;
    countQuery = resultsCountQuery;
    queryVariables.facilityId = activeFacilityId;
    countQueryVariables = { facilityId: activeFacilityId };
  }

  const {
    data: totalResults,
    loading,
    error,
    refetch: refetchCount,
  } = useQuery(countQuery, {
    variables: countQueryVariables,
    fetchPolicy: "no-cache",
  });

  if (activeFacilityId.length < 1) {
    return <div>"No facility selected"</div>;
  }

  if (loading) {
    return <p>Loading</p>;
  }
  if (error) {
    throw error;
  }

  const totalEntries = totalResults.testResultsCount;

  return (
    <QueryWrapper<Props>
      query={query}
      queryOptions={{
        variables: queryVariables,
      }}
      onRefetch={refetchCount}
      Component={DetachedTestResultsList}
      componentProps={{
        ...props,
        page: pageNumber,
        totalEntries,
        entriesPerPage,
        setSelectedPatientId,
        facilityId: activeFacilityId,
      }}
    />
  );
};

export default TestResultsList;
