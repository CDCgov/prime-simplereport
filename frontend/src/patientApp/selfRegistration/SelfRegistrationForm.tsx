import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Button from "../../app/commonComponents/Button/Button";
import Modal from "../../app/commonComponents/Modal";
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
  const [isDuplicate, setIsDuplicate] = useState<boolean>(true);

  const onBlur = ({
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
    async function checkForDuplicates() {
      setIsDuplicate(true);
    }

    if (firstName && lastName && zipCode && birthDate?.isValid()) {
      checkForDuplicates();
    }
  }, [identifyData]);

  return (
    <div
      id="registration-container"
      className="grid-container maxw-tablet padding-y-3"
    >
      <DuplicateModal showModal={!!isDuplicate} />
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

type DuplicateModalProps = {
  showModal: boolean;
};

const DuplicateModal: React.FC<DuplicateModalProps> = ({ showModal }) => {
  return (
    <Modal
      onClose={() => {}}
      showModal={showModal}
      showClose={false}
      variant="warning"
    >
      <Modal.Header>You already have a profile at [Facility].</Modal.Header>
      <p>
        Our records show someone has registered with the same name, date of
        birth, and ZIP code. Please check in with your testing site staff. You
        do not need to register again.
      </p>
      <Button className="margin-right-auto">Exit sign up</Button>
    </Modal>
  );
};
