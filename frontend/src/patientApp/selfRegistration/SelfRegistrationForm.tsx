import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Button from "../../app/commonComponents/Button/Button";
import { EMPTY_PERSON } from "../../app/patients/AddPatient";
import PersonForm, {
  PersonFormView,
} from "../../app/patients/Components/PersonForm";
import {
  DuplicatePatientModal,
  IdentifyingData,
} from "../../app/patients/Components/DuplicatePatientModal";
import { PxpApi } from "../PxpApiService";
import { useDocumentTitle } from "../../app/utils/hooks";

type Props = {
  savePerson: (data: any) => void;
  onDuplicate: (person: Pick<PersonFormData, "firstName" | "lastName">) => void;
  entityName: string;
  registrationLink: string | undefined;
};

export const SelfRegistrationForm = ({
  savePerson,
  onDuplicate,
  entityName,
  registrationLink,
}: Props) => {
  const { t } = useTranslation();
  const [identifyingData, setIdentifyingData] = useState<
    Nullable<IdentifyingData>
  >({ firstName: null, lastName: null, birthDate: null });
  const [isDuplicate, setIsDuplicate] = useState<boolean>();

  useDocumentTitle(t("selfRegistration.title"));

  const onBlur = ({
    firstName,
    lastName,
    birthDate,
  }: Nullable<PersonFormData>) => {
    if (
      firstName !== identifyingData.firstName ||
      lastName !== identifyingData.lastName ||
      !moment(birthDate).isSame(identifyingData.birthDate)
    ) {
      setIdentifyingData({
        firstName,
        lastName,
        birthDate: moment(birthDate),
      });
    }
  };

  useEffect(() => {
    async function checkForDuplicates(data: IdentifyingData) {
      const birthDate = moment(data.birthDate).format("YYYY-MM-DD") as ISODate;
      try {
        const isDuplicate = await PxpApi.checkDuplicateRegistrant({
          firstName: data.firstName,
          lastName: data.lastName,
          birthDate,
          registrationLink,
        });
        setIsDuplicate(isDuplicate);
      } catch (e: any) {
        // A failure to check duplicate shouldn't disrupt registration
        console.error(e);
      }
    }

    const { firstName, lastName, birthDate } = identifyingData;
    if (firstName && lastName && birthDate?.isValid()) {
      checkForDuplicates({ firstName, lastName, birthDate });
    }
  }, [identifyingData, registrationLink]);

  return (
    <div
      id="registration-container"
      className="grid-container maxw-tablet padding-y-3"
    >
      <DuplicatePatientModal
        showModal={!!isDuplicate}
        onDuplicate={() => {
          const { firstName, lastName } = identifyingData;
          onDuplicate({ firstName: firstName || "", lastName: lastName || "" });
        }}
        entityName={entityName}
      />
      <PersonForm
        patient={EMPTY_PERSON}
        savePerson={savePerson}
        getFooter={(onSave) => (
          <Button
            className="self-registration-button margin-top-3"
            onClick={() => onSave()}
          >
            {t("common.button.submit")}
          </Button>
        )}
        view={PersonFormView.SELF_REGISTRATION}
        onBlur={onBlur}
      />
    </div>
  );
};
