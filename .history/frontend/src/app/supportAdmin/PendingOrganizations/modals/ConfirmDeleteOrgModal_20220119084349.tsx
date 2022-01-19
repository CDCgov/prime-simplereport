import React from "react";
import Modal from "react-modal";

import { DeletionModalProps } from "./modal_utils";

const ConfirmDeleteOrgModal: React.FC<DeletionModalProps> = ({
  organization,
  handleClose,
  handleDelete,
}) => {
  return <Modal isOpen={true}></Modal>;
};

export default ConfirmDeleteOrgModal;
