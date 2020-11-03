import React, { useEffect } from "react";
// import PropTypes from "prop-types";
import Modal from "react-modal";
import Button from "../commonComponents/Button";

Modal.setAppElement("#root");

const CSVModalForm = ({ isOpen, onClose, data }) => {
  useEffect(() => {
    Modal.setAppElement("#root");
  });

  return (
    <Modal
      isOpen={isOpen}
      style={{ overlay: { zIndex: 1000 } }}
      overlayClassName={"prime-modal-overlay"}
      // className={"prime-modal"}
      contentLabel="Example Modal"
    >
      <div className="grid-container">
        <div className="grid-row">
          <h1>CSV Import</h1>
        </div>
        <div className="grid-row">
          <Button type="button" onClick={onClose} label="Cancel" />
          <Button type="button" onClick={() => {}} label="Confirm Import" />
        </div>
        <div>
          <h2>Good Rows:</h2>
          {
            // note this doesn't handle duplicate keys well we
            data.data &&
              data.data.map((r) => <p key={r.patientID}>{JSON.stringify(r)}</p>)
          }
        </div>
        <div>
          <h2>Bad Rows:</h2>
          {
            // note this doesn't handle duplicate keys well we
            data.badRows &&
              data.badRows.map((r) => (
                <p key={r.original.patientID}>{JSON.stringify(r)}</p>
              ))
          }
        </div>
        <div className="grid-row">
          <Button type="button" onClick={onClose} label="Cancel" />
          <Button type="button" onClick={() => {}} label="Confirm Import" />
        </div>
      </div>
    </Modal>
  );
};

CSVModalForm.propTypes = {};

export default CSVModalForm;
