import { useReactiveVar } from "@apollo/client";

import { patient as patientVar } from "../storage/store";

// TODO: all realated to patient.

export const usePatient = () => {
  const patient = useReactiveVar(patientVar);

  const setCurrentPatient = (patient: PersonFormData) => {
    patientVar(patient);
  };

  const updatePatientField = (field: string, value: any) => {
    patientVar({ ...patientVar(), [field]: value });
  };

  return {
    patient,
    setCurrentPatient,
    updatePatientField,
  };
};
