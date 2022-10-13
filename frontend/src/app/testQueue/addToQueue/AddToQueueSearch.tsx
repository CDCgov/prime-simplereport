import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { gql, useMutation, useLazyQuery, useQuery } from "@apollo/client";

import {
  QUEUE_NOTIFICATION_TYPES,
  ALERT_CONTENT,
  MIN_SEARCH_CHARACTER_COUNT,
  SEARCH_DEBOUNCE_TIME,
} from "../constants";
import { showAlertNotification } from "../../utils/srToast";
import { useOutsideClick } from "../../utils/hooks";
import { Patient } from "../../patients/ManagePatients";
import { AoEAnswersDelivery } from "../AoEForm/AoEForm";
import { getAppInsights } from "../../TelemetryService";

import SearchResults from "./SearchResults";
import SearchInput from "./SearchInput";
import { useDebounce } from "./useDebounce";

interface AoEAnswersForPatient extends AoEAnswersDelivery {
  patientId: string;
  facilityId?: string;
}

export const QUERY_SINGLE_PATIENT = gql`
  query GetPatient($internalId: ID!) {
    patient(id: $internalId) {
      internalId
      firstName
      lastName
      middleName
      birthDate
      gender
      telephone
      phoneNumbers {
        type
        number
      }
      emails
      testResultDelivery
    }
  }
`;

export const QUERY_PATIENT = gql`
  query GetPatientsByFacilityForQueue(
    $facilityId: ID
    $namePrefixMatch: String
    $includeArchived: Boolean = false
    $includeArchivedFacilities: Boolean
  ) {
    patients(
      facilityId: $facilityId
      pageNumber: 0
      pageSize: 100
      includeArchived: $includeArchived
      namePrefixMatch: $namePrefixMatch
      includeArchivedFacilities: $includeArchivedFacilities
    ) {
      internalId
      firstName
      lastName
      middleName
      birthDate
      gender
      telephone
      email
      emails
      phoneNumbers {
        type
        number
      }
      testResultDelivery
    }
  }
`;

export const ADD_PATIENT_TO_QUEUE = gql`
  mutation AddPatientToQueue(
    $facilityId: ID!
    $patientId: ID!
    $symptoms: String
    $symptomOnset: LocalDate
    $pregnancy: String
    $noSymptoms: Boolean
    $testResultDelivery: TestResultDeliveryPreference
  ) {
    addPatientToQueue(
      facilityId: $facilityId
      patientId: $patientId
      pregnancy: $pregnancy
      noSymptoms: $noSymptoms
      symptoms: $symptoms
      symptomOnset: $symptomOnset
      testResultDelivery: $testResultDelivery
    )
  }
`;

export const UPDATE_AOE = gql`
  mutation UpdateAOE(
    $patientId: ID!
    $symptoms: String
    $symptomOnset: LocalDate
    $pregnancy: String
    $noSymptoms: Boolean
    $testResultDelivery: TestResultDeliveryPreference
  ) {
    updateTimeOfTestQuestions(
      patientId: $patientId
      pregnancy: $pregnancy
      symptoms: $symptoms
      noSymptoms: $noSymptoms
      symptomOnset: $symptomOnset
      testResultDelivery: $testResultDelivery
    )
  }
`;

export type StartTestProps = {
  patientId: string;
};

interface Props {
  refetchQueue: () => void;
  facilityId: string;
  patientsInQueue: string[];
  startTestPatientId: string | null;
  setStartTestPatientId: any;
}

const AddToQueueSearchBox = ({
  refetchQueue,
  facilityId,
  patientsInQueue,
  startTestPatientId,
  setStartTestPatientId,
}: Props) => {
  const appInsights = getAppInsights();

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
  const [selectedPatient, setSelectedPatient] = useState<Patient>();

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

  useQuery<{ patient: Patient }>(QUERY_SINGLE_PATIENT, {
    fetchPolicy: "no-cache",
    //variables: { internalId: patientIdParam },
    variables: { internalId: startTestPatientId },
    onCompleted: (response) => {
      setSelectedPatient(response.patient);
    },
    skip: !startTestPatientId || patientsInQueue.includes(startTestPatientId),
  });

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

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowSuggestion(true);
    setDebounced(event.target.value);
  };

  const onSearchClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const onAddToQueue = (
    patient: Patient,
    {
      noSymptoms,
      symptoms,
      symptomOnset,
      pregnancy,
      testResultDelivery,
    }: AoEAnswersDelivery,
    createOrUpdate = "create"
  ): Promise<string | void> => {
    setDebounced("");
    setShowSuggestion(false);
    if (appInsights) {
      appInsights.trackEvent({ name: "Add Patient To Queue" });
    }
    let callback;
    const variables: AoEAnswersForPatient = {
      patientId: patient.internalId,
      noSymptoms,
      symptoms,
      symptomOnset,
      pregnancy,
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
        const { type, title, body } = {
          ...ALERT_CONTENT[QUEUE_NOTIFICATION_TYPES.ADDED_TO_QUEUE__SUCCESS](
            patient
          ),
        };
        showAlertNotification(type, title, body);
        refetchQueue();
        setStartTestPatientId(null);
        if (createOrUpdate === "create") {
          return res.data.addPatientToQueue;
        }
      })
      .catch((err) => {
        updateMutationError(err);
      });
  };

  return (
    <React.Fragment>
      <SearchInput
        onSearchClick={onSearchClick}
        onInputChange={onInputChange}
        queryString={debounced}
        disabled={!allowQuery}
        placeholder={"Search for a person to start their test"}
      />
      <SearchResults
        page="queue"
        patients={data?.patients || []}
        selectedPatient={selectedPatient}
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
