import React, { useEffect, useState, useMemo } from "react";
import { useMutation, useLazyQuery, useQuery } from "@apollo/client";

import {
  QUEUE_NOTIFICATION_TYPES,
  ALERT_CONTENT,
  MIN_SEARCH_CHARACTER_COUNT,
  SEARCH_DEBOUNCE_TIME,
} from "../constants";
import { showAlertNotification } from "../../utils/srToast";
import { Patient } from "../../patients/ManagePatients";
import { AoEAnswersDelivery } from "../AoEForm/AoEForm";
import { getAppInsights } from "../../TelemetryService";
import { PATIENT_TERM } from "../../../config/constants";
import {
  AddPatientToQueueDocument,
  GetPatientDocument,
  GetPatientsByFacilityForQueueDocument,
  UpdateAoeDocument,
} from "../../../generated/graphql";
import useComponentVisible from "../../commonComponents/ComponentVisible";

import SearchResults from "./SearchResults";
import SearchInput from "./SearchInput";
import { useDebounce } from "./useDebounce";

interface AoEAnswersForPatient extends AoEAnswersDelivery {
  patientId: string;
  facilityId?: string;
}

export const QUERY_SINGLE_PATIENT = GetPatientDocument;

export const QUERY_PATIENT = GetPatientsByFacilityForQueueDocument;

export const ADD_PATIENT_TO_QUEUE = AddPatientToQueueDocument;

export const UPDATE_AOE = UpdateAoeDocument;

export type StartTestProps = {
  patientId: string;
};

interface Props {
  refetchQueue: () => void;
  facilityId: string;
  patientsInQueue: string[];
  startTestPatientId: string | null;
  setStartTestPatientId: any;
  canAddPatient: boolean;
  addPatientToQueue?: (patient: Patient) => Promise<void>;
}

const AddToQueueSearchBox = ({
  refetchQueue,
  facilityId,
  patientsInQueue,
  startTestPatientId,
  setStartTestPatientId,
  canAddPatient,
  addPatientToQueue,
}: Props) => {
  const appInsights = getAppInsights();

  const [queryString, debounced, setDebounced] = useDebounce("", {
    debounceTime: SEARCH_DEBOUNCE_TIME,
    runIf: (q) => q.length >= MIN_SEARCH_CHARACTER_COUNT,
  });

  const [queryPatients, { data, error, loading }] = useLazyQuery(
    QUERY_PATIENT,
    {
      fetchPolicy: "no-cache",
      variables: { facilityId, namePrefixMatch: queryString },
    }
  );

  const [mutationError, updateMutationError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient>();

  const [addPatientToQueueMutation] = useMutation(ADD_PATIENT_TO_QUEUE);
  const [updateAoe] = useMutation(UPDATE_AOE);
  const {
    ref: dropDownRef,
    isComponentVisible: showSuggestion,
    setIsComponentVisible: setShowSuggestion,
  } = useComponentVisible(true);
  const allowQuery = debounced.length >= MIN_SEARCH_CHARACTER_COUNT;
  const showDropdown = useMemo(
    () => allowQuery && showSuggestion,
    [allowQuery, showSuggestion]
  );

  useQuery<{ patient: Patient }>(QUERY_SINGLE_PATIENT, {
    fetchPolicy: "no-cache",
    variables: { internalId: startTestPatientId },
    onCompleted: async (response) => {
      setSelectedPatient(response.patient);
      if (addPatientToQueue) {
        await addPatientToQueue(response.patient);
        setSelectedPatient(undefined);
      }
    },
    skip: !startTestPatientId || patientsInQueue.includes(startTestPatientId),
  });

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
      callback = addPatientToQueueMutation;
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
          return res.data.addPatientToQueueMutation;
        }
      })
      .catch((err) => {
        updateMutationError(err);
      });
  };

  return (
    <React.Fragment>
      <SearchInput
        onInputChange={onInputChange}
        queryString={debounced}
        disabled={!allowQuery}
        placeholder={`Search for a ${PATIENT_TERM} to start their test`}
        showSubmitButton={false}
      />
      <SearchResults
        page="queue"
        patients={data?.patients || []}
        selectedPatient={selectedPatient}
        onAddToQueue={onAddToQueue}
        addPatientToQueue={addPatientToQueue}
        patientsInQueue={patientsInQueue}
        shouldShowSuggestions={showDropdown}
        loading={debounced !== queryString || loading}
        dropDownRef={dropDownRef}
        canAddPatient={canAddPatient}
      />
    </React.Fragment>
  );
};

export default AddToQueueSearchBox;
