import React from "react";

import { useSelector } from "react-redux";
import { getPatientsWithLastTestResult } from "../patients/patientSelectors";

import Button from "../commonComponents/Button";
import { v4 as uuidv4 } from "uuid";
import { readString } from "react-papaparse";
import Ajv from "ajv";

// this can't be the best way to handle this?
import * as schemaPatient from "../patient.schema.json";

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schemaPatient.default);

const ManagePatients = () => {
  const patients = useSelector(getPatientsWithLastTestResult());

  var loadFile = (file) => {
    var thisReader = new FileReader();
    thisReader.onloadend = function (e) {
      // then schema validating
      // then separating out the errors and schema validation pieces
      // then worry about displaying something in the UI
      const jsonImport = readString(thisReader.result, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: "greedy",
      });
      // Extract the Bad Rows so we can print them out separately, starting at the end of the array
      // and working backwards to avoid shifting issues. Creating a copy is a bit inefficient on
      // memory in a situation where there are a TON of errors... something to consider later.
      jsonImport.badRows = [];
      jsonImport.errors
        .slice()
        .reverse()
        .forEach((err) => {
          var rem = jsonImport.data.splice(err.row, 1);
          err.original = rem[0];
          jsonImport.badRows.push(err);
        });

      // Now we need to check this data against our JSON Schema, row by row, pull out the rows that
      // don't validate and add them to our badRows, using a similar format for error
      // also check for existing dupes
      jsonImport.data.forEach((row, index) => {
        var valid = validate(row);
        var rem = [];
        var err = {};

        if (!valid) {
          rem = jsonImport.data.splice(index, 1);
          err = {
            type: "InvalidValue",
            code: "InvalidValue",
            message:
              validate.errors[0].dataPath +
              validate.errors[0].keyword +
              validate.errors[0].message,
            original: rem[0],
          };
          jsonImport.badRows.push(err);
        } else if (row.patientID in patients) {
          // Check for duplicates by ID
          // We don't splice these out because they are going to stay in but we want to summarize
          // them? I dunno about this.
          err = {
            type: "WARNING",
            code: "duplicateID",
            message:
              row.patientID + " already exists in local storage, updating data",
            original: jsonImport.data[index],
          };
          jsonImport.badRows.push(err);
        }
      });

      // for debugging...
      //console.log(jsonImport.errors);
      //console.log(jsonImport.meta);
      //console.log(jsonImport.data);
      //console.log(jsonImport.badRows);
      //console.log(patients);

      // Initial experimental output
      console.log("Successfully read", jsonImport.data.length, "rows");
      console.log("Found errors on", jsonImport.badRows.length, "rows");
      jsonImport.badRows.forEach((row, index) => {
        console.log("Error", index, ":", row.code, row.message);
      });

      // Adding filtered content to patient store, this all needs to get updated when we finalize
      // this.
      jsonImport.data.forEach((row, index) => {
        // limit actions to avoid spamming localstorage
        patients[row.patientID] = {
          firstName: row.patientFirstName,
          lastName: row.patientLastName,
          middleName: row.patientMiddleName,
          patientId: row.patientID,
          phone: row.patientPhoneNumber,
          address: row.patientStreet,
          birthDate: row.patientDOB,
        };
      });
      console.log(patients);
    };
    thisReader.readAsText(file);
  };

  const patientRows = (patients) => {
    return patients.map((patient) => (
      <tr key={`patient-${uuidv4()}`}>
        <th scope="row">{patient.displayName}</th>
        <td>{patient.patientId}</td>
        <td> {patient.birthDate}</td>
        <td>
          {patient.lastTestDate === undefined ? "N/A" : patient.lastTestDate}
        </td>
      </tr>
    ));
  };

  let rows = patientRows(patients);

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container usa-card__container">
            <div className="usa-card__header">
              <h1> Add New Patients</h1>
            </div>
            <div className="usa-card__body">
              <Button type="button" onClick={() => {}} label="New Patient" />
              <hr />

              <p>or like do a csv or something:</p>
              <input
                type="file"
                id="uploadCSV"
                className="input-file"
                accept=".csv"
                onChange={(csv) => loadFile(csv.target.files[0])}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container usa-card__container">
            <div className="usa-card__header">
              <h2> Add People</h2>
            </div>
            <div className="usa-card__body">
              <table className="usa-table usa-table--borderless width-full">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Unique ID</th>
                    <th scope="col">Date of Birth</th>
                    <th scope="col">Days since last test</th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ManagePatients;
