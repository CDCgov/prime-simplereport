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
    const variables = {
      facilityId: person.facilityId,
      firstName: person.firstName,
      middleName: person.middleName,
      lastName: person.lastName,
      birthDate: person.birthDate,
      street: person.street,
      streetTwo: person.streetTwo,
      city: person.city,
      state: person.state,
      zipCode: person.zipCode,
      telephone: person.telephone,
      role: person.role,
      email: person.email,
      county: person.county,
      race: person.race,
      ethnicity: person.ethnicity,
      gender: person.gender,
      residentCongregateSetting: person.residentCongregateSetting === "YES",
      employedInHealthcare: person.employedInHealthcare === "YES",
    };
    // due to @JsonIgnores on Person to avoid duplicate recording, we have to
    // inline the address so that it can be deserialized outside the context
    // of GraphQL, which understands the flattened shape in its schema
    const {
      street,
      streetTwo,
      city,
      state,
      county,
      zipCode,
      ...withoutAddress
    } = variables;
    const updatedPatientFromApi = await PxpApi.updatePatient(
      plid,
      patientInStore.birthDate,
      {
        ...withoutAddress,
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

    const residentCongregateSetting = updatedPatientFromApi.residentCongregateSetting
      ? "YES"
      : "NO";
    const employedInHealthcare = updatedPatientFromApi.employedInHealthcare
      ? "YES"
      : "NO";

    dispatch(
      reduxSetPatient({
        ...updatedPatientFromApi,
        residentCongregateSetting,
        employedInHealthcare,
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
