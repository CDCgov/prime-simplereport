import React from "react";
import Modal from "react-modal";

import { ModalProps } from "./modal_utils";

const ConfirmDeleteOrgModal: React.FC<ModalProps> = ({
  organization,
  handleClose,
}) => {
  return <Modal isOpen={true}></Modal>;
};

export default ConfirmDeleteOrgModal;
