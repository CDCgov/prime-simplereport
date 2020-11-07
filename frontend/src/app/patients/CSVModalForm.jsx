import React, { useEffect } from "react";
import moment from "moment";
import Modal from "react-modal";
import { v4 as uuidv4 } from "uuid";

import Button from "../commonComponents/Button";
import { displayFullName } from "../utils";

Modal.setAppElement("#root");

const CSVModalForm = ({ isOpen, onClose, data }) => {
  useEffect(() => {
    Modal.setAppElement("#root");
  });

  const PreviewTable = (data) => {
    if (!data) {
      return null;
    }

    // there are lots of rows -- do we render them all?
    let rows = data.map((row) => {
      const {
        patientID,
        patientLastName,
        patientFirstName,
        patientMiddleName,
        // patientSuffix,
        patientRace,
        patientDOB,
        patientGender,
        patientEthnicity,
        // patientStreet,
        // patientStreet2,
        // patientCity,
        // patientCounty,
        // patientState,
        // patientZipCode,
        // patientPhoneNumber,
        // patientEmail,
        // patientAge,
        // employedInHealthcare,
        // typeOfHealthcareProfessional,
        // residentCongregateSetting,
        // patientResidencyType,
      } = { ...row };

      return (
        <tr key={`patient-${uuidv4()}`}>
          <th scope="row">
            {displayFullName(
              patientFirstName,
              patientMiddleName,
              patientLastName
            )}
          </th>
          <td>{patientID}</td>
          <td>{moment(patientDOB).format("MMM DD YYYY")}</td>
          <td>{patientGender}</td>
          <td>{patientEthnicity}</td>
          <td>{patientRace}</td>
        </tr>
      );
    });

    return (
      <table className="usa-table usa-table--borderless width-full">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Unique ID</th>
            <th scope="col">Date of Birth</th>
            <th scope="col">Gender</th>
            <th scope="col">Ethnicity</th>
            <th scope="col">Race</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  };

  const ErrorTable = (data) => {
    if (!data) {
      return null;
    }
    let rows = data.map((errorRow) => {
      const { message, row } = { ...errorRow };
      const { patientID, patientLastName, patientFirstName } = {
        ...errorRow.original,
      };

      return (
        <tr key={`patient-${uuidv4()}`}>
          <th scope="row">
            {displayFullName(patientFirstName, "", patientLastName)}
          </th>
          <td>{patientID}</td>
          <td>{row}</td>
          <td>{message}</td>
        </tr>
      );
    });

    // alerts styles are currently broken
    const alert = null;
    //   <Alert
    //     type="warning"
    //     title="The following recrods will not be added due to exact matches found in the system"
    //     body={`${data.length} records will not be included in the upload.`}
    //   />
    // );

    return (
      <React.Fragment>
        {alert}
        <p>
          {`The following ${data.length} will not be added due to exact matches found in the system`}{" "}
        </p>
        <table className="usa-table usa-table--borderless width-full">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Unique ID</th>
              <th scope="col">Row #</th>
              <th scope="col">Message</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </React.Fragment>
    );
  };

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
          <h2>Preview:</h2>
          {PreviewTable(data.data)}
        </div>
        <div>
          <h2>Bad Rows:</h2>
          {ErrorTable(data.badRows)}
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
