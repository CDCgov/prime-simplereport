import React, { useState } from "react";
import { toast } from "react-toastify";
import { gql, useQuery, useMutation } from "@apollo/client";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";

import Alert from "../../commonComponents/Alert";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import { QUEUE_NOTIFICATION_TYPES, ALERT_CONTENT } from "../constants";
import { showNotification } from "../../utils";
import { displayFullName } from "../../utils";

const MIN_SEARCH_CHARACTER_COUNT = 3;

const QUERY_PATIENT = gql`
  query GetPatientsByFacility($facilityId: String!) {
    patients(facilityId: $facilityId) {
      internalId
      lookupId
      firstName
      lastName
      middleName
      birthDate
      gender
    }
  }
`;

const ADD_PATIENT_TO_QUEUE = gql`
  mutation AddPatientToQueue(
    $facilityId: String!
    $patientId: String!
    $symptoms: String
    $symptomOnset: String
    $pregnancy: String
    $firstTest: Boolean
    $priorTestDate: String
    $priorTestType: String
    $priorTestResult: String
    $noSymptoms: Boolean
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
    )
  }
`;

const AddToQueueSearchBox = ({ refetchQueue, facilityId }) => {
  const appInsights = useAppInsightsContext();
  const trackAddPatientToQueue = useTrackEvent(
    appInsights,
    "Add Patient to Queue"
  );

  const { data, loading, error } = useQuery(QUERY_PATIENT, {
    fetchPolicy: "no-cache",
    variables: { facilityId },
  });

  const [mutationError, updateMutationError] = useState(null);
  const [addPatientToQueue] = useMutation(ADD_PATIENT_TO_QUEUE);
  const [queryString, setQueryString] = useState("");
  const [suggestions, updateSuggestions] = useState([]);

  if (loading) {
    return <p> Loading patient data... </p>;
  }
  if (error) {
    throw error;
  }
  if (mutationError) {
    throw mutationError;
  }

  let shouldShowSuggestions = queryString.length >= MIN_SEARCH_CHARACTER_COUNT;

  const getSuggestionsFromQueryString = (queryString) => {
    if (data && data.patients) {
      let formattedQueryString = queryString.toLowerCase();
      let searchResults = data.patients.filter((patient) => {
        let doesMatchPatientName =
          displayFullName(
            patient.firstName,
            patient.middleName,
            patient.lastName
          )
            .toLowerCase()
            .indexOf(formattedQueryString) > -1;

        let doesMatchLookupId = patient.lookupId
          ? patient.lookupId.toLowerCase().indexOf(formattedQueryString) > -1
          : false;
        return doesMatchPatientName || doesMatchLookupId;
      });
      return searchResults;
    }
    return [];
  };

  const onInputChange = (event) => {
    let newValue = event.target.value;
    setQueryString(newValue);
    if (newValue.length > 2) {
      updateSuggestions(getSuggestionsFromQueryString(newValue));
    }
  };

  const onSearchClick = (event) => {
    event.preventDefault();
    updateSuggestions(getSuggestionsFromQueryString(queryString));
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
    }
  ) => {
    updateSuggestions([]);
    setQueryString("");
    trackAddPatientToQueue();
    addPatientToQueue({
      variables: {
        facilityId: facilityId,
        patientId: patient.internalId,
        noSymptoms,
        symptoms,
        symptomOnset,
        pregnancy,
        firstTest,
        priorTestDate,
        priorTestType,
        priorTestResult,
      },
    })
      .then((res) => {
        let { type, title, body } = {
          ...ALERT_CONTENT[QUEUE_NOTIFICATION_TYPES.ADDED_TO_QUEUE__SUCCESS](
            patient
          ),
        };
        let alert = <Alert type={type} title={title} body={body} />;
        showNotification(toast, alert);
        refetchQueue();
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
        queryString={queryString}
        disabled={!shouldShowSuggestions}
      />
      <SearchResults
        suggestions={suggestions}
        shouldDisplay={shouldShowSuggestions}
        onAddToQueue={onAddToQueue}
        facilityId={facilityId}
      />
    </React.Fragment>
  );
};

export default AddToQueueSearchBox;
