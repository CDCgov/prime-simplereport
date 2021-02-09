import { Route, Redirect } from "react-router-dom";
import ManageOrganizationContainer from "./ManageOrganizationContainer";
import ManageFacilitiesContainer from "./Facility/ManageFacilitiesContainer";
import FacilityFormContainer from "./Facility/FacilityFormContainer";
import ManageUsersContainer from "./Users/ManageUsersContainer";
import SettingsNav from "./SettingsNav";

interface Props {
  match: any;
}

const Settings: React.FC<Props> = ({ match }) => {
  return (
    <main className="prime-home">
      <div className="grid-container">
        <SettingsNav />
        <Route exact path={match.url} component={ManageOrganizationContainer} />
        <Route
          path={match.url + "/facilities"}
          component={ManageFacilitiesContainer}
        />
        <Route
          path={match.url + "/facility/:facilityId"}
          render={({ match }) => (
            <FacilityFormContainer facilityId={match.params.facilityId} />
          )}
        />
        <Route
          path={match.url + "/add-facility/"}
          render={({ match }) => (
            <FacilityFormContainer facilityId={match.params.facilityId} />
          )}
        />
        <Route path={match.url + "/users"} component={ManageUsersContainer} />
        <Redirect exact to={"/settings"} />
      </div>
    </main>
  );
};

export default Settings;
