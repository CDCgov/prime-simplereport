import { ReactiveVar } from "@apollo/client";

// TODO: all realated to patient.

export const usePatient = (patientVar: ReactiveVar<PersonFormData>) => {
  const setCurrentPatient = (patient: PersonFormData) => {
    patientVar(patient);
  };

  const updatePatientField = (field: string, value: any) => {
    patientVar({ ...patientVar(), [field]: value });
  };

  return {
    updatePatientField,
    setCurrentPatient,
  };
};
