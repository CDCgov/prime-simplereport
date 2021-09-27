import { Route, RouteComponentProps, Switch } from "react-router-dom";

import { useDocumentTitle } from "../utils/hooks";
import { Analytics } from "../analytics/Analytics";

import ManageOrganizationContainer from "./ManageOrganizationContainer";
import ManageFacilitiesContainer from "./Facility/ManageFacilitiesContainer";
import FacilityFormContainer from "./Facility/FacilityFormContainer";
import ManageUsersContainer from "./Users/ManageUsersContainer";
import SettingsNav from "./SettingsNav";
import { ManageSelfRegistrationLinksContainer } from "./ManageSelfRegistrationLinksContainer";

interface Params {
  facilityId: string;
}

const Settings: React.FC<RouteComponentProps<{}>> = ({ match }) => {
  useDocumentTitle("Settings");
  return (
    <main className="prime-home">
      <div className="grid-container">
        <SettingsNav />
        <Switch>
          <Route
            path={match.url + "/facilities"}
            component={ManageFacilitiesContainer}
          />
          <Route
            path={match.url + "/facility/:facilityId"}
            render={({ match }: RouteComponentProps<Params>) => (
              <FacilityFormContainer facilityId={match.params.facilityId} />
            )}
          />
          <Route
            path={match.url + "/add-facility/"}
            render={({ match }: RouteComponentProps<Params>) => (
              <FacilityFormContainer facilityId={match.params.facilityId} />
            )}
          />
          <Route
            path={match.url + "/organization"}
            component={ManageOrganizationContainer}
          />
          <Route
            path={match.url + "/self-registration"}
            component={ManageSelfRegistrationLinksContainer}
          />
          <Route
            path={match.url + "/manage-users"}
            component={ManageUsersContainer}
          />
          <Route component={Analytics} />
        </Switch>
      </div>
    </main>
  );
};

export default Settings;
