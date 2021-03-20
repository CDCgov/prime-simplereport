import React, { useEffect, useState } from "react";
import { connect, useSelector, useDispatch } from "react-redux";
import { useHistory, Redirect } from "react-router-dom";
import { toast } from "react-toastify";

import { setPatient as reduxSetPatient } from "../../app/store";
import { PxpApi } from "../../patientApp/PxpApiService";
import PersonForm from "../../app/patients/Components/PersonForm";
import PatientTimeOfTestContainer from "../PatientTimeOfTestContainer";
import { showNotification } from "../../app/utils";
import Alert from "../../app/commonComponents/Alert";

const PatientFormContainer = () => {
  const [prevPage, setPrevPage] = useState(false);
  const [nextPage, setNextPage] = useState(false);
  const patient = useSelector((state: any) => state.patient);
  const facility = useSelector((state: any) => state.facility);

  const dispatch = useDispatch();

  const plid = useSelector((state: any) => state.plid);
  const patientInStore = useSelector((state: any) => state.patient);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const history = useHistory();
  history.listen((_loc, action) => {
    if (action === "POP") {
      setPrevPage(true);
    }
  });

  if (prevPage) {
    return (
      <Redirect
        to={{
          pathname: "/patient-info-confirm",
        }}
      />
    );
  }

  if (nextPage) {
    return (
      <Redirect
        push
        to={{
          pathname: "/patient-info-symptoms",
        }}
      />
    );
  }

  const savePerson = async (person: Nullable<PersonFormData>) => {
    const {
      street,
      streetTwo,
      city,
      state,
      county,
      zipCode,
      residentCongregateSetting,
      employedInHealthcare,
      ...withoutAddress
    } = person;
    const updatedPatientFromApi = await PxpApi.updatePatient(
      plid,
      patientInStore.birthDate,
      {
        ...withoutAddress,
        residentCongregateSetting: person.residentCongregateSetting === "YES",
        employedInHealthcare: person.employedInHealthcare === "YES",
        address: {
          street: [street, streetTwo],
          city,
          state,
          county,
          zipCode,
        },
      }
    );
    showNotification(
      toast,
      <Alert type="success" title={`Your profile changes have been saved`} />
    );

    dispatch(
      reduxSetPatient({
        ...updatedPatientFromApi,
        residentCongregateSetting: updatedPatientFromApi.residentCongregateSetting
          ? "YES"
          : "NO",
        employedInHealthcare: updatedPatientFromApi.employedInHealthcare
          ? "YES"
          : "NO",
      })
    );

    setNextPage(true);
  };

  return (
    <PatientTimeOfTestContainer currentPage={"profile"}>
      <PersonForm
        patient={{
          ...patient,
          facilityId: patient.facility === null ? null : patient.facility?.id,
        }}
        activeFacilityId={facility.id}
        patientId={patient.internalId}
        isPxpView={true}
        hideFacilitySelect={true}
        backCallback={() => {
          setPrevPage(true);
        }}
        savePerson={savePerson}
      />
    </PatientTimeOfTestContainer>
  );
};

export default connect()(PatientFormContainer);
