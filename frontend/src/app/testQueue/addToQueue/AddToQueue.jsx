import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Autocomplete from "react-autocomplete";

import Button from "../../commonComponents/Button";
import SearchBar from "../../commonComponents/SearchBar";
import { searchPatients } from "../../query/patients";
import { displayFullName } from "../../utils";
import AddToQueueSearchResultItem from "./AddToQueueSearchResultItem";
import { addPatientToQueue } from "../state/testQueueActions";
import { patientSearch } from "../testQueueSelectors";

const AddToQueue = () => {
  let history = useHistory();
  const dispatch = useDispatch();

  const [patientSearchResults, updatePatientSearchResults] = useState([]);

  const onSearchClick = (event, searchQuery) => {
    event.preventDefault();
    let searchResults = searchPatients(searchQuery);
    updatePatientSearchResults(searchResults);
  };

  const patientsToSearch = useSelector(patientSearch);

  const addToQueue = (patientId) => {
    dispatch(addPatientToQueue(patientId));
  };

  const [value, updateValue] = useState("");

  const addToQueueButton = (patient) =>
    patient.isInQueue ? (
      "Already in queue"
    ) : (
      <a href="#" onClick={() => addToQueue(patient.patientId)}>
        Add to Queue
      </a>
    );

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <Autocomplete
            getItemValue={(item) => item.name}
            shouldItemRender={(item, value) =>
              item.name.toLowerCase().indexOf(value.toLowerCase()) > -1 ||
              item.patientId.indexOf(value) > -1
            }
            items={patientsToSearch}
            renderMenu={(items, value) => {
              return (
                <div children={items}>
                  <table className="usa-table usa-table--borderless">
                    <thead>
                      <tr>
                        <th scope="col">Full name</th>
                        <th scope="col">Date of Birth</th>
                        <th scope="col">Unique ID</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>{items}</tbody>
                  </table>
                </div>
              );
            }}
            renderItem={(patient, isHighlighted) => (
              <tr>
                <td>{patient.name}</td>
                <td>{patient.birthDate}</td>
                <td>{patient.patientId}</td>
                <td>{addToQueueButton(patient)}</td>
              </tr>
            )}
            value={value}
            onChange={(e) => updateValue(e.target.value)}
            onSelect={() => {}} //(val) => updateValue(val)}
            // open={true}
            inputProps={{
              class: "usa-input",
              placeholder:
                "Search by Unique Patient ID, Name, or Date of Birth",
            }}
          />
        </div>
      </div>
    </main>
  );
};

export default AddToQueue;
