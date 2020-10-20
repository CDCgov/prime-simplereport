import React from "react";
import {
  Route,
  Switch,
  Redirect,
  // useParams,
  useLocation,
  useRouteMatch,
} from "react-router-dom";
import { useSelector } from "react-redux";
// import { useEffect } from "react";

import OrganizationHome from "./OrganizationHome";
// import { loadPatients } from "../patients/state/patientActions";
import TestQueue from "../testQueue/TestQueue";
import AddToQueue from "../testQueue/addToQueue/AddToQueue";
import { getPatients } from "../patients/patientSelectors";
import ManagePatients from "../patients/ManagePatients";

const OrganizationHomeContainer = () => {
  // const { organizationId } = useParams();
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(loadPatients(organizationId));
  // }, [organizationId, dispatch]);

  const patients = useSelector(getPatients);

  let match = useRouteMatch();
  const location = useLocation();

  return (
    <React.Fragment>
      <Switch>
        <Route
          // exact
          path={`${match.path}/queue`}
          render={() => {
            return <TestQueue />;
          }}
        />
        {/* <Route
          path={`${match.path}/queue/add`}
          render={() => {
            return <AddToQueue />;
          }}
        /> */}
        <Route
          path={`${match.path}/results`}
          render={() => {
            return <OrganizationHome patients={patients} />;
          }}
        />
        <Route
          path={`${match.path}/patients`}
          render={() => {
            return <ManagePatients />;
          }}
        />
        <Route path={`${match.path}/`}>
          {/* default to the queue */}
          <Redirect to={`${location.pathname}/queue`} />
        </Route>
      </Switch>
    </React.Fragment>
  );
};

export default OrganizationHomeContainer;
