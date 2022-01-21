import { useEffect, useState } from "react";
import { connect, useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";

import { setPatient as reduxSetPatient } from "../../app/store";
import { PxpApi } from "../../patientApp/PxpApiService";
import PersonForm, {
  PersonFormView,
} from "../../app/patients/Components/PersonForm";
import PatientTimeOfTestContainer from "../PatientTimeOfTestContainer";
import { showNotification } from "../../app/utils";
import Alert from "../../app/commonComponents/Alert";
import Button from "../../app/commonComponents/Button/Button";

const PatientFormContainer = () => {
  const navigate = useNavigate();
  const [nextPage, setNextPage] = useState(false);
  const patient = useSelector((state: any) => state.patient);

  const dispatch = useDispatch();

  const plid = useSelector((state: any) => state.plid);
  const patientInStore = useSelector((state: any) => state.patient);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (nextPage) {
    return (
      <Navigate
        to={{
          pathname: "/patient-info-symptoms",
          search: `?plid=${plid}`,
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
      ...withoutAddress
    } = person;
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
      <Alert type="success" title={`Your profile changes have been saved`} />
    );

    dispatch(
      reduxSetPatient({
        ...updatedPatientFromApi,
      })
    );

    setNextPage(true);
  };

  return (
    <PatientTimeOfTestContainer currentPage={"profile"}>
      <main className={"prime-edit-patient prime-home padding-top-0"}>
        <div>
          <PersonForm
            patient={{
              ...patient,
              facilityId:
                patient.facility === null ? null : patient.facility?.id,
            }}
            patientId={patient.internalId}
            hideFacilitySelect={true}
            savePerson={savePerson}
            view={PersonFormView.PXP}
            getFooter={(onSave, formChanged) => (
              <div className="mobile-lg:display-flex flex-justify-end margin-top-2">
                <Button
                  id="edit-patient-save-lower"
                  disabled={!formChanged}
                  onClick={onSave}
                  label="Save and continue"
                />
                <Button
                  className="margin-top-1 mobile-lg:margin-top-0 margin-right-0"
                  variant="outline"
                  label={"Back"}
                  onClick={() => navigate(-1)}
                />
              </div>
            )}
          />
        </div>
      </main>
    </PatientTimeOfTestContainer>
  );
};

export default connect()(PatientFormContainer);
