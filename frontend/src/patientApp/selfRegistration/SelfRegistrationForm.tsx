import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Button from "../../app/commonComponents/Button/Button";
import Modal from "../../app/commonComponents/Modal";
import { EMPTY_PERSON } from "../../app/patients/AddPatient";
import PersonForm, {
  PersonFormView,
} from "../../app/patients/Components/PersonForm";
import { PxpApi } from "../PxpApiService";

type Props = {
  savePerson: (data: any) => void;
  onDuplicate: (person: Pick<PersonFormData, "firstName" | "lastName">) => void;
  entityName: string;
  registrationLink: string;
};

type IdentifyingData = {
  firstName: string;
  lastName: string;
  zipCode: string;
  birthDate: moment.Moment;
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
  >({ firstName: null, lastName: null, zipCode: null, birthDate: null });
  const [isDuplicate, setIsDuplicate] = useState<boolean>();

  const onBlur = ({
    firstName,
    lastName,
    zipCode,
    birthDate,
  }: Nullable<PersonFormData>) => {
    if (
      firstName !== identifyingData.firstName ||
      lastName !== identifyingData.lastName ||
      zipCode !== identifyingData.zipCode ||
      !moment(birthDate).isSame(identifyingData.birthDate)
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
    async function checkForDuplicates(data: IdentifyingData) {
      const { firstName, lastName, zipCode } = data;
      const birthDate = moment(data.birthDate).format("YYYY-MM-DD") as ISODate;
      try {
        const { unique } = await PxpApi.checkDuplicateRegistrant({
          firstName,
          lastName,
          birthDate,
          zipCode,
          registrationLink,
        });
        setIsDuplicate(!unique);
      } catch (e) {
        // A failure to check duplicate shouldn't disrupt registration
        console.error(e);
      }
    }

    const { firstName, lastName, zipCode, birthDate } = identifyingData;
    if (firstName && lastName && zipCode && birthDate?.isValid()) {
      checkForDuplicates({ firstName, lastName, zipCode, birthDate });
    }
  }, [identifyingData, registrationLink]);

  return (
    <div
      id="registration-container"
      className="grid-container maxw-tablet padding-y-3"
    >
      <DuplicateModal
        showModal={!!isDuplicate}
        onDuplicate={() => {
          const { firstName, lastName } = identifyingData;
          onDuplicate({ firstName: firstName || "", lastName: lastName || "" });
        }}
        entityName={entityName}
      />
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
  onDuplicate: () => void;
  entityName: string;
};

const DuplicateModal: React.FC<DuplicateModalProps> = ({
  showModal,
  onDuplicate,
  entityName,
}) => {
  return (
    <Modal
      onClose={() => {}}
      showModal={showModal}
      showClose={false}
      variant="warning"
    >
      <Modal.Header>You already have a profile at {entityName}.</Modal.Header>
      <p>
        Our records show someone has registered with the same name, date of
        birth, and ZIP code. Please check in with your testing site staff. You
        do not need to register again.
      </p>
      <Modal.Footer>
        <Button
          onClick={() => {
            onDuplicate();
          }}
        >
          Exit sign up
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
