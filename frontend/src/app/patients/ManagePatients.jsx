import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";

import { displayFullName } from "../utils";

import { NavLink } from "react-router-dom";
import { readString } from "react-papaparse";
import Ajv from "ajv";

import CSVModalForm from "./CSVModalForm";
// this can't be the best way to handle this?
import * as schemaPatient from "../patient.schema.json";
import {
  PATIENT_TERM_CAP,
  PATIENT_TERM_PLURAL_CAP,
} from "../../config/constants";

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schemaPatient.default);

const patientQuery = gql`
  {
    patients {
      id
      lookupId
      firstName
      lastName
      middleName
      birthDate
    }
  }
`;

const ManagePatients = () => {
  const { data, loading, error } = useQuery(patientQuery);
  const [isCSVModalOpen, updateIsCSVModalOpen] = useState(false);

  const openCSVModal = () => {
    updateIsCSVModalOpen(true);
  };

  const closeCSVModal = () => {
    updateIsCSVModalOpen(false);
  };

  const [CSVdata, setCSVData] = useState({});

  var loadFile = (file, patients) => {
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

      // NOTE: WE NEED TO REMOVE DUPLICATES WITHIN THIS FILE ITSELF BY KEY!!

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
      // jsonImport.data.forEach((row, index) => {
      //   // limit actions to avoid spamming localstorage
      //   patients[row.patientID] = {
      //     firstName: row.patientFirstName,
      //     lastName: row.patientLastName,
      //     middleName: row.patientMiddleName,
      //     patientId: row.patientID,
      //     phone: row.patientPhoneNumber,
      //     address: row.patientStreet,
      //     birthDate: row.patientDOB,
      //   };
      // });
      //console.log(patients);

      // react state confuses me, not sure if this is doubling memory or just creating a pointer?
      setCSVData(jsonImport);
      openCSVModal();
    };
    thisReader.readAsText(file);
  };

  const patientRows = (patients) => {
    return patients.map((patient) => (
      <tr key={patient.lookupId}>
        <th scope="row">
          <NavLink to={`patient/${patient.id}`}>
            {displayFullName(
              patient.firstName,
              patient.middleName,
              patient.lastName
            )}
          </NavLink>
        </th>
        <td>{patient.lookupId}</td>
        <td> {patient.birthDate}</td>
        <td>
          {patient.lastTestDate === undefined
            ? "N/A"
            : `${patient.lastTestDate} days`}
        </td>
      </tr>
    ));
  };

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container usa-card__container">
            <div className="usa-card__header">
              <h2> Add New {PATIENT_TERM_CAP}</h2>
            </div>
            <div className="usa-card__body">
              <div style={{ display: "inline-block" }}>
                <NavLink className="usa-button" to={"patient/new"}>
                  New {PATIENT_TERM_CAP}
                </NavLink>
              </div>
              - OR - &nbsp;
              <input
                type="file"
                id="uploadCSV"
                className="input-file"
                accept=".csv"
                onChange={(csv) =>
                  loadFile(csv.target.files[0], data ? data.patients : {})
                }
              />
              <CSVModalForm
                isOpen={isCSVModalOpen}
                onClose={closeCSVModal}
                data={CSVdata}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container usa-card__container">
            <div className="usa-card__header">
              <h2> All {PATIENT_TERM_PLURAL_CAP}</h2>
            </div>
            <div className="usa-card__body">
              {error ? (
                <p>Error in loading patients</p>
              ) : loading ? (
                <p>Loading patients...</p>
              ) : data ? (
                <table className="usa-table usa-table--borderless width-full">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Unique ID</th>
                      <th scope="col">Date of Birth</th>
                      <th scope="col">Days since last test</th>
                    </tr>
                  </thead>
                  <tbody>{patientRows(data.patients)}</tbody>
                </table>
              ) : (
                <p> no patients found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ManagePatients;
