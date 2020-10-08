import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useParams,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";

import OrganizationHome from "./OrganizationHome";
import TestResultView from "../TestResultView";
import { loadPatients } from "../patients/state/patientActions";

const OrganizationHomeContainer = () => {
  console.log("process.env", process.env);
  const { organizationId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadPatients(organizationId));
  }, [organizationId, dispatch]);

  const patients = useSelector((state) => state.patients);
  return (
    <React.Fragment>
      <Router>
        <Switch>
          <Route
            exact
            path="/organization/:organizationId/"
            render={() => <OrganizationHome patients={patients} />}
          />
          <Route
            path="/organization/:organizationId/testResult/:patientId"
            render={(props) => <TestResultView {...props} />}
          />
        </Switch>
      </Router>
    </React.Fragment>
  );
};

export default OrganizationHomeContainer;
