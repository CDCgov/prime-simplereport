import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { ToastContainer } from "react-toastify";
import { useDispatch, connect } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { Redirect, Route, Switch } from "react-router-dom";
import { AppInsightsContext } from "@microsoft/applicationinsights-react-js";
import { reactPlugin } from "./AppInsights";

import PrimeErrorBoundary from "./PrimeErrorBoundary";
import Header from "./commonComponents/Header";
import USAGovBanner from "./commonComponents/USAGovBanner";
import LoginView from "./LoginView";
import { setInitialState } from "./store";
import TestResultsListContainer from "./testResults/TestResultsListContainer";
import TestQueueContainer from "./testQueue/TestQueueContainer";
import ManagePatientsContainer from "./patients/ManagePatientsContainer";
import EditPatientContainer from "./patients/EditPatientContainer";
import AddPatient from "./patients/AddPatient";
import ManageOrganizationContainer from "./Settings/ManageOrganizationContainer";
import ManageFacilitiesContainer from "./Settings/Facility/ManageFacilitiesContainer";
import FacilityFormContainer from "./Settings/Facility/FacilityFormContainer";
import { getFacilityIdFromUrl } from "./utils/url";
import Admin from "./admin/Admin";
import OrganizationFormContainer from "./admin/Organization/OrganizationFormContainer";

const WHOAMI_QUERY = gql`
  query WhoAmI {
    whoami {
      id
      firstName
      middleName
      lastName
      suffix
      email
      organization {
        name
        testingFacility {
          id
          name
        }
      }
    }
  }
`;

const SettingsRoutes = ({ match }: any) => (
  <>
    {/* note the addition of the exact property here */}
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
  </>
);

const App = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useQuery(WHOAMI_QUERY, {
    fetchPolicy: "no-cache",
  });
  const [facilityId, updateFacilityId] = useState<string | null>("");

  useEffect(() => {
    if (!data) return;

    const getDefaultFacilityId = () => {
      const queryParamsFacilityId = getFacilityIdFromUrl();
      if (queryParamsFacilityId) {
        return queryParamsFacilityId;
      }

      const tucsonMountains = data.whoami.organization.testingFacility.find(
        (f: Facility) => f.name === "Tucson Mountains"
      );
      if (tucsonMountains) {
        return tucsonMountains.id;
      }

      return data.whoami.organization.testingFacility[0].id;
    };

    // if facilityId is not a query param, we need to refresh the page and add it
    if (!getFacilityIdFromUrl()) {
      window.location.href = `${
        window.location.pathname
      }?facility=${getDefaultFacilityId()}`;
    }

    const getDefaultFacility = () => {
      let facilityId = getDefaultFacilityId();
      return data.whoami.organization.testingFacility.find(
        (f: Facility) => f.id === facilityId
      );
    };

    dispatch(
      setInitialState({
        organization: {
          name: data.whoami.organization.name,
        },
        facilities: data.whoami.organization.testingFacility,
        facility: getDefaultFacility(),
        user: {
          id: data.whoami.id,
          firstName: data.whoami.firstName,
          middleName: data.whoami.middleName,
          lastName: data.whoami.lastName,
          suffix: data.whoami.suffix,
          email: data.whoami.email,
        },
      })
    );

    updateFacilityId(getFacilityIdFromUrl());
    // eslint-disable-next-line
  }, [data]);

  if (loading) {
    return <p>Loading account information...</p>;
  }

  if (error) {
    throw error;
  }

  return (
    <AppInsightsContext.Provider value={reactPlugin}>
      <PrimeErrorBoundary
        onError={(error: any) => (
          <div>
            <h1> There was an error. Please try refreshing</h1>
            <pre> {JSON.stringify(error, null, 2)} </pre>
          </div>
        )}
      >
        <div className="App">
          <div id="main-wrapper">
            <USAGovBanner />
            <Header facilityId={facilityId} />
            <Switch>
              <Route path="/login" component={LoginView} />
              <Route
                path="/queue"
                render={() => {
                  return <TestQueueContainer />;
                }}
              />
              <Route
                path="/"
                render={() => {
                  return <Redirect to="/queue" />;
                }}
                exact
              />
              <Route
                path="/results"
                render={() => {
                  return <TestResultsListContainer />;
                }}
              />
              <Route
                path={`/patients`}
                render={() => {
                  return <ManagePatientsContainer />;
                }}
              />
              <Route
                path={`/patient/:patientId`}
                render={({ match }) => (
                  <EditPatientContainer patientId={match.params.patientId} />
                )}
              />
              <Route path={`/add-patient/`} render={() => <AddPatient />} />
              <Route path="/settings" component={SettingsRoutes} />
              <Route
                path={"/admin/create-organization"}
                render={() => <OrganizationFormContainer />}
              />
              <Route path={"/admin"} render={() => <Admin />} />
            </Switch>
            <ToastContainer
              autoClose={5000}
              closeButton={false}
              limit={2}
              position="bottom-center"
              hideProgressBar={true}
            />
          </div>
        </div>
      </PrimeErrorBoundary>
    </AppInsightsContext.Provider>
  );
};

export default connect()(App);
