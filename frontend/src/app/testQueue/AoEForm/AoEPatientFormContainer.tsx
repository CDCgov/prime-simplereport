import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { getFacilityIdFromUrl } from '../../utils/url';
import AoEForm from './AoEForm';
import StepIndicator from '../../commonComponents/StepIndicator';
import PatientProfile from './PatientProfile';

interface Props {
  patientId: string;
  page: string;
}

const GET_PATIENT = gql`
  query GetPatientDetails($id: String!) {
    patient(id: $id) {
      internalId
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
    }
  }
`;
const AoEPatientFormContainer = ({ patientId, page }: Props) => {
  const { data, loading, error } = useQuery(GET_PATIENT, {
    variables: { id: patientId || '' },
    fetchPolicy: 'no-cache',
  });

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>error loading patient with id {patientId}...</p>;
  }

  const residentCongregateSetting = data.patient.residentCongregateSetting
    ? 'YES'
    : 'NO';

  const facilityId = getFacilityIdFromUrl();
  const employedInHealthcare = data.patient.employedInHealthcare ? 'YES' : 'NO';

  const steps = [
    {
      label: 'Profile information',
      value: 'profile',
      order: 0,
      isCurrent: page === 'profile',
    },
    {
      label: 'Symptoms and history',
      value: 'symptoms',
      order: 1,
      isCurrent: page === 'symptoms',
    },
  ];

  return (
    <main className="patient-app patient-app--form padding-bottom-4">
      <div className="grid-container maxw-tablet">
        <StepIndicator steps={steps} />
        {page === 'symptoms' && (
          <AoEForm
            patient={{
              ...data.patient,
              residentCongregateSetting,
              employedInHealthcare,
            }}
            facilityId={facilityId}
            isModal={false}
            saveButtonText="Submit"
            noValidation={false}
          />
        )}
        {page === 'profile' && (
          <PatientProfile
            patient={{
              ...data.patient,
              residentCongregateSetting,
              employedInHealthcare,
            }}
          />
        )}
      </div>
    </main>
  );
};

export default AoEPatientFormContainer;
