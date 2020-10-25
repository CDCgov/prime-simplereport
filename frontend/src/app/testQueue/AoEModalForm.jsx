import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import PropTypes from "prop-types";
import Modal from "react-modal";
// import { displayFullName } from "../utils";

Modal.setAppElement("#root");

const AoEModalForm = ({ isOpen, onClose }) => {
  useEffect(() => {
    Modal.setAppElement("#root");
  });

  return (
    <Modal
      isOpen={isOpen}
      style={{ overlay: { zIndex: 1000 } }}
      contentLabel="Example Modal"
    >
      <div className="grid-container">
        <div className="grid-row">
          <h1>
            {" "}
            Patient Name
            {/* {displayFullName(
              patient.firstName,
              patient.middleName,
              patient.lastName
            )} */}
          </h1>
          <div onClick={onClose}>
            <FontAwesomeIcon icon={"times-circle"} size="2x" />
          </div>
        </div>
        <div className="grid-row">
          <h1> Form goes here </h1>
        </div>
      </div>
    </Modal>
  );
};

AoEModalForm.propTypes = {};

export default AoEModalForm;
