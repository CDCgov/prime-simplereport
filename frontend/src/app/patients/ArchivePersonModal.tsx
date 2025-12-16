import React from "react";
import { gql, useMutation } from "@apollo/client";
import Modal from "react-modal";

import Button from "../commonComponents/Button/Button";
import { displayFullName } from "../utils";
import { showSuccess } from "../utils/srToast";
import "./ArchivePersonModal.scss";

import { Patient } from "./ManagePatients";

const ARCHIVE_PERSON_RECORD = gql`
  mutation ArchivePerson($id: ID!, $deleted: Boolean!) {
    setPatientIsDeleted(id: $id, deleted: $deleted) {
      internalId
    }
  }
`;

interface Props {
  person: Patient;
  closeModal: () => void;
}
interface ArchivePersonResponse {
  internalId: string;
}
interface ArchivePersonParams {
  id: string;
  deleted: boolean;
}
const ArchivePersonModal = ({ person, closeModal }: Props) => {
  const [archivePersonRecord] = useMutation<
    ArchivePersonResponse,
    ArchivePersonParams
  >(ARCHIVE_PERSON_RECORD);
  const yesArchivePerson = () => {
    archivePersonRecord({
      variables: {
        id: person.internalId,
        deleted: true,
      },
    })
      .then(() => {
        showSuccess("", "Record archived");
      })
      .finally(() => {
        closeModal();
      });
  };

  return (
    <Modal
      isOpen={true}
      className="sr-archive-person-modal-content"
      overlayClassName="sr-archive-person-modal-overlay sr-legacy-application"
      contentLabel="Archive record"
      onRequestClose={closeModal}
    >
      <p>
        Are you sure you want to archive the record for{" "}
        <b>
          {displayFullName(
            person.firstName,
            person.middleName,
            person.lastName
          )}
        </b>
        ?
      </p>
      <div className="sr-archive-person-buttons">
        <Button variant="unstyled" label="No, go back" onClick={closeModal} />
        <Button label="Yes, I'm sure" onClick={yesArchivePerson} />
      </div>
    </Modal>
  );
};

export default ArchivePersonModal;
