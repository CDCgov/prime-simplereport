import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import { gql, useMutation, useLazyQuery } from "@apollo/client";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";

import Alert from "../../commonComponents/Alert";
import {
  QUEUE_NOTIFICATION_TYPES,
  ALERT_CONTENT,
  MIN_SEARCH_CHARACTER_COUNT,
  SEARCH_DEBOUNCE_TIME,
} from "../constants";
import { showNotification } from "../../utils";
import { useOutsideClick } from "../../utils/hooks";

import SearchResults from "./SearchResults";
import SearchInput from "./SearchInput";
import { useDebounce } from "./useDebounce";

export const QUERY_PATIENT = gql`
  query GetPatientsByFacility($facilityId: ID!, $namePrefixMatch: String) {
    patients(
      facilityId: $facilityId
      pageNumber: 0
      pageSize: 20
      showDeleted: false
      namePrefixMatch: $namePrefixMatch
    ) {
      internalId
      firstName
      lastName
      middleName
      birthDate
      gender
      telephone
      testResultDelivery
    }
  }
`;

const ADD_PATIENT_TO_QUEUE = gql`
  mutation AddPatientToQueue(
    $facilityId: ID!
    $patientId: ID!
    $symptoms: String
    $symptomOnset: LocalDate
    $pregnancy: String
    $firstTest: Boolean
    $priorTestDate: LocalDate
    $priorTestType: String
    $priorTestResult: String
    $noSymptoms: Boolean
    $testResultDelivery: TestResultDeliveryPreference
  ) {
    addPatientToQueue(
      facilityId: $facilityId
      patientId: $patientId
      pregnancy: $pregnancy
      noSymptoms: $noSymptoms
      symptoms: $symptoms
      firstTest: $firstTest
      priorTestDate: $priorTestDate
      priorTestType: $priorTestType
      priorTestResult: $priorTestResult
      symptomOnset: $symptomOnset
      testResultDelivery: $testResultDelivery
    )
  }
`;

const UPDATE_AOE = gql`
  mutation UpdateAOE(
    $patientId: ID!
    $symptoms: String
    $symptomOnset: LocalDate
    $pregnancy: String
    $firstTest: Boolean
    $priorTestDate: LocalDate
    $priorTestType: String
    $priorTestResult: String
    $noSymptoms: Boolean
    $testResultDelivery: TestResultDeliveryPreference
  ) {
    updateTimeOfTestQuestions(
      patientId: $patientId
      pregnancy: $pregnancy
      symptoms: $symptoms
      noSymptoms: $noSymptoms
      firstTest: $firstTest
      priorTestDate: $priorTestDate
      priorTestType: $priorTestType
      priorTestResult: $priorTestResult
      symptomOnset: $symptomOnset
      testResultDelivery: $testResultDelivery
    )
  }
`;

const AddToQueueSearchBox = ({ refetchQueue, facilityId, patientsInQueue }) => {
  const appInsights = useAppInsightsContext();
  const trackAddPatientToQueue = useTrackEvent(
    appInsights,
    "Add Patient to Queue"
  );
  const [queryString, debounced, setDebounced] = useDebounce("", {
    debounceTime: SEARCH_DEBOUNCE_TIME,
    runIf: (q) => q.length >= MIN_SEARCH_CHARACTER_COUNT,
  });

  const [queryPatients, { data, error }] = useLazyQuery(QUERY_PATIENT, {
    fetchPolicy: "no-cache",
    variables: { facilityId, namePrefixMatch: queryString },
  });

  const [mutationError, updateMutationError] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(true);

  const [addPatientToQueue] = useMutation(ADD_PATIENT_TO_QUEUE);
  const [updateAoe] = useMutation(UPDATE_AOE);

  const allowQuery = debounced.length >= MIN_SEARCH_CHARACTER_COUNT;
  const showDropdown = useMemo(() => allowQuery && showSuggestion, [
    allowQuery,
    showSuggestion,
  ]);

  const dropDownRef = useRef(null);
  const hideOnOutsideClick = useCallback(() => {
    setShowSuggestion(false);
  }, []);

  useOutsideClick(dropDownRef, hideOnOutsideClick);

  useEffect(() => {
    if (queryString.trim() !== "") {
      queryPatients();
    }
  }, [queryString, queryPatients]);

  if (error) {
    throw error;
  }
  if (mutationError) {
    throw mutationError;
  }

  const onInputChange = (event) => {
    setShowSuggestion(true);
    setDebounced(event.target.value);
  };

  const onSearchClick = (event) => {
    event.preventDefault();
  };

  const onAddToQueue = (
    patient,
    {
      noSymptoms,
      symptoms,
      symptomOnset,
      pregnancy,
      firstTest,
      priorTestResult,
      priorTestDate,
      priorTestType,
      testResultDelivery,
    },
    createOrUpdate = "create"
  ) => {
    setDebounced("");
    setShowSuggestion(false);
    if(appInsights){
      trackAddPatientToQueue();
    }
    let callback;
    const variables = {
      patientId: patient.internalId,
      noSymptoms,
      symptoms,
      symptomOnset,
      pregnancy,
      firstTest,
      priorTestDate,
      priorTestType,
      priorTestResult,
      testResultDelivery,
    };
    if (createOrUpdate === "create") {
      callback = addPatientToQueue;
      variables.facilityId = facilityId;
    } else {
      callback = updateAoe;
    }
    return callback({ variables })
      .then((res) => {
        let { type, title, body } = {
          ...ALERT_CONTENT[QUEUE_NOTIFICATION_TYPES.ADDED_TO_QUEUE__SUCCESS](
            patient
          ),
        };
        let alert = <Alert type={type} title={title} body={body} />;
        showNotification(toast, alert);
        refetchQueue();
        if (createOrUpdate === "create") {
          return res.data.addPatientToQueue;
        }
      })
      .catch((error) => {
        updateMutationError(error);
      });
  };

  return (
    <React.Fragment>
      <SearchInput
        onSearchClick={onSearchClick}
        onInputChange={onInputChange}
        queryString={debounced}
        disabled={!allowQuery}
      />
      <SearchResults
        page="queue"
        patients={data?.patients || []}
        onAddToQueue={onAddToQueue}
        patientsInQueue={patientsInQueue}
        shouldShowSuggestions={showDropdown}
        loading={debounced !== queryString}
        dropDownRef={dropDownRef}
      />
    </React.Fragment>
  );
};

export default AddToQueueSearchBox;
