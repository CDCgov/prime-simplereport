import { useTranslation } from "react-i18next";

import Button from "../../app/commonComponents/Button/Button";
import { EMPTY_PERSON } from "../../app/patients/AddPatient";
import PersonForm, {
  PersonFormView,
} from "../../app/patients/Components/PersonForm";

type Props = {
  savePerson: (data: any) => void;
};

export const SelfRegistrationForm = ({ savePerson }: Props) => {
  const { t } = useTranslation();

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
      />
    </div>
  );
};
