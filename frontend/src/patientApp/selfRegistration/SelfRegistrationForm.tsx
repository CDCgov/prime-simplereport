import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Button from "../../app/commonComponents/Button/Button";
import { EMPTY_PERSON } from "../../app/patients/AddPatient";
import PersonForm, {
  PersonFormView,
} from "../../app/patients/Components/PersonForm";

type Props = {
  savePerson: (data: any) => void;
};

type IdentifyingData = {
  firstName: string;
  lastName: string;
  zipCode: string;
  birthDate: moment.Moment;
};

export const SelfRegistrationForm = ({ savePerson }: Props) => {
  const { t } = useTranslation();
  const [identifyData, setIdentifyingData] = useState<
    Nullable<IdentifyingData>
  >({ firstName: null, lastName: null, zipCode: null, birthDate: null });

  const onBlur = async ({
    firstName,
    lastName,
    zipCode,
    birthDate,
  }: Nullable<PersonFormData>) => {
    if (
      firstName !== identifyData.firstName ||
      lastName !== identifyData.lastName ||
      zipCode !== identifyData.zipCode ||
      !moment(birthDate).isSame(identifyData.birthDate)
    ) {
      setIdentifyingData({
        firstName,
        lastName,
        zipCode,
        birthDate: moment(birthDate),
      });
    }
  };

  useEffect(() => {
    const { firstName, lastName, zipCode, birthDate } = identifyData;
    if (!firstName || !lastName || !zipCode || !birthDate?.isValid()) {
      return;
    }
    console.log("check for unique");
  }, [identifyData]);

  return (
    <div
      id="registration-container"
      className="grid-container maxw-tablet padding-y-3"
    >
      <PersonForm
        activeFacilityId=""
        patient={EMPTY_PERSON}
        savePerson={savePerson}
        getFooter={(onSave) => (
          <Button
            className="self-registration-button margin-top-3"
            onClick={onSave}
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
