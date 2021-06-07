import { useReactiveVar } from "@apollo/client";

import { patient as patientVar } from "../storage/store";


export const usePatient = () => {
  const patient = useReactiveVar(patientVar);

  const setCurrentPatient = (patient: Patient) => {
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
