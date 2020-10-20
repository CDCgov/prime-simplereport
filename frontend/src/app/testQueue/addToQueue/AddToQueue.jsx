import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import Button from "../../commonComponents/Button";
import SearchBar from "../../commonComponents/SearchBar";
import { searchPatients } from "../../query/patients";
import { displayFullName } from "../../utils";
import Autocomplete from "react-autocomplete";
import AddToQueueSearchResultItem from "./AddToQueueSearchResultItem";

const AddToQueue = () => {
  let history = useHistory();

  const [patientSearchResults, updatePatientSearchResults] = useState([]);

  const onSearchClick = (event, searchQuery) => {
    event.preventDefault();
    let searchResults = searchPatients(searchQuery);
    updatePatientSearchResults(searchResults);
  };

  const [value, updateValue] = useState("");

  //   const renderSearchResults = () => {
  //     if (patientSearchResults.length === 0) {
  //       return null;
  //     }
  //     let rows = patientSearchResults.map((patient) => (
  //       <tr key={`patient-${uuidv4()}`}>
  //         <th scope="row">
  //           {displayFullName(
  //             patient.firstName,
  //             patient.middleName,
  //             patient.lastName
  //           )}
  //         </th>
  //         <td>{patient.patientId}</td>
  //         <td>{patient.birthDate}</td>
  //         <td>Add to Queue</td>
  //       </tr>
  //     ));
  //     return (
  //       <React.Fragment>
  //         <h1> Results: </h1>
  //         <table className="usa-table usa-table--borderless">
  //           <thead>
  //             <tr>
  //               <th scope="col">Full Name</th>
  //               <th scope="col">Unique ID</th>
  //               <th scope="col">Date of Birth</th>
  //               <th scope="col">Actions</th>
  //             </tr>
  //           </thead>
  //           <tbody>{rows}</tbody>
  //         </table>
  //       </React.Fragment>
  //     );
  //   };

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          {/* <div className="grid-col"> */}
          {/* <Button */}
          {/* icon="arrow-left" */}
          {/* type="button" */}
          {/* onClick={() => history.goBack()} */}
          {/* label="  Go Back" */}
          {/* /> */}
          {/* <div className="prime-container"> */}
          {/* <SearchBar onSearchClick={onSearchClick} /> */}
          {/* {renderSearchResults()} */}
          <Autocomplete
            getItemValue={(item) => item.label}
            shouldItemRender={(item, value) =>
              item.label.toLowerCase().indexOf(value.toLowerCase()) > -1 ||
              item.id.indexOf(value) > -1
            }
            items={[
              { label: "apple", id: "ABC123" },
              { label: "banana", id: "DEF123" },
              { label: "pear", id: "GHI789" },
            ]}
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
            renderItem={(item, isHighlighted) => (
              <tr>
                <td>{item.label}</td>
                <td>{item.label}</td>
                <td>{item.id}</td>
                <td>
                  <a href="">Add to Queue</a>
                </td>
              </tr>
            )}
            value={value}
            onChange={(e) => updateValue(e.target.value)}
            onSelect={() => {}} //(val) => updateValue(val)}
            open={true}
            inputProps={{
              class: "usa-input",
              placeholder:
                "Search by Unique Patient ID, Name, or Date of Birth",
            }}
          />
          {/* </div> */}
          {/* </div> */}
        </div>
      </div>
    </main>
  );
};

export default AddToQueue;
