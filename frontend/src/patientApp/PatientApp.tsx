import React, { useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { ToastContainer } from 'react-toastify';
import { useDispatch, connect } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import {
  Redirect,
  Route,
  Switch,
  BrowserRouter as Router,
} from 'react-router-dom';
import { AppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { reactPlugin } from '../app/AppInsights';

import PrimeErrorBoundary from '../app/PrimeErrorBoundary';
import USAGovBanner from '../app/commonComponents/USAGovBanner';
import { setInitialState } from '../app/store';
import { getPatientLinkIdFromUrl } from '../app/utils/url';
import TimeOfTest from './timeOfTest/TimeOfTest';
import ErrorPage from './ErrorPage';

const PATIENT_LINK_QUERY = gql`
  query PatientLinkById($plid: String!) {
    patientLink(internalId: $plid) {
      internalId
    }
  }
`;

const PatientApp = () => {
  const dispatch = useDispatch();

  const plid = getPatientLinkIdFromUrl();
  if (plid == null) {
    throw new Error('Patient Link ID from URL was null');
  }

  const { data, loading, error } = useQuery(PATIENT_LINK_QUERY, {
    variables: { plid },
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (!data) return;

    dispatch(setInitialState({}));
    // eslint-disable-next-line
  }, [data]);

  if (loading) {
    return <p>Loading account information...</p>;
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
            {error ? (
              <ErrorPage error={error} />
            ) : (
              <Router basename={`${process.env.PUBLIC_URL}/pxp`}>
                <Switch>
                  <Route
                    path="/"
                    exact
                    render={({ location }) => (
                      <Redirect
                        to={{ ...location, pathname: '/time-of-test' }}
                      />
                    )}
                  />
                  <Route path="/time-of-test" component={TimeOfTest} />
                </Switch>
              </Router>
            )}
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

export default connect()(PatientApp);
