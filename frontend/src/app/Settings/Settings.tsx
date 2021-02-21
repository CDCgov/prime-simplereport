import { Route, Redirect, RouteComponentProps } from "react-router-dom";
import ManageOrganizationContainer from "./ManageOrganizationContainer";
import ManageFacilitiesContainer from "./Facility/ManageFacilitiesContainer";
import FacilityFormContainer from "./Facility/FacilityFormContainer";
import ManageUsersContainer from "./Users/ManageUsersContainer";
import SettingsNav from "./SettingsNav";
import PrimeErrorBoundary from "../PrimeErrorBoundary";
import Button from "../commonComponents/Button";

interface Params {
  facilityId: string;
}

const Settings: React.FC<RouteComponentProps<{}>> = ({ match }) => {
  return (
    <main className="prime-home">
      <div className="grid-container">
        <PrimeErrorBoundary
          onError={(error: any) => (
            <div className="grid-row">
              <div className="prime-container usa-card__container">
                <div className="usa-card__header">
                  <h1>There was an error. Please try refreshing.</h1>
                </div>
                <div className="usa-card__body">
                  <h2>Technical details for reporting purposes:</h2>
                  <div className="font-mono-2xs bg-base-lightest padding-2 radius-md">
                    {JSON.stringify(error, null, 2)}
                  </div>
                </div>
                <div className="usa-card__footer">
                  <Button onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                </div>
              </div>
            </div>
          )}
        >
          <SettingsNav />
          <Route
            exact
            path={match.url}
            component={ManageOrganizationContainer}
          />
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
          <Route path={match.url + "/users"} component={ManageUsersContainer} />
          <Redirect exact to={"/settings"} />
        </PrimeErrorBoundary>
      </div>
    </main>
  );
};

export default Settings;
