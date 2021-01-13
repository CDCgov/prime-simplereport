import React from "react";
import { gql, useQuery } from "@apollo/client";
import { getFacilityIdFromUrl } from "../../utils/url";
import AoEForm from "./AoEForm";
import StepIndicator from "../../commonComponents/StepIndicator";

interface Props {
  patientId: string;
}
const GET_PATIENT = gql`
  query GetPatientDetails($id: String!) {
    patient(id: $id) {
      lookupId
      firstName
      middleName
      lastName
      birthDate
      street
      streetTwo
      city
      state
      zipCode
      telephone
      role
      email
      county
      race
      ethnicity
      gender
      residentCongregateSetting
      employedInHealthcare
      testResults {
        internalId
        dateTested
        result
      }
    }
  }
`;
const AoEPatientFormContainer = (props: Props) => {
  const { data, loading, error } = useQuery(GET_PATIENT, {
    variables: { id: props.patientId || "" },
    fetchPolicy: "no-cache",
  });

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>error loading patient with id {props.patientId}...</p>;
  }

  const residentCongregateSetting = data.patient.residentCongregateSetting
    ? "YES"
    : "NO";

  const facilityId = getFacilityIdFromUrl();

  const employedInHealthcare = data.patient.employedInHealthcare ? "YES" : "NO";
  return (
    <main className="patient-app patient-app--form padding-bottom-4">
      <div className="grid-container maxw-tablet">
        <StepIndicator></StepIndicator>
        <AoEForm
          patient={{
            ...data.patient,
            residentCongregateSetting,
            employedInHealthcare,
          }}
          facilityId={facilityId}
          isModal={false}
          saveButtonText="Submit"
          onClose={null}
          saveCallback={null}
        />
      </div>
    </main>
  );
};

export default AoEPatientFormContainer;
