import React, { useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { ToastContainer } from 'react-toastify';
import { useDispatch, connect } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import { Redirect, Route, Switch } from 'react-router-dom';
import { AppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { reactPlugin } from './AppInsights';

import PrimeErrorBoundary from './PrimeErrorBoundary';
import Header from './commonComponents/Header';
import USAGovBanner from './commonComponents/USAGovBanner';
import { setInitialState } from './store';
import { getPatientLinkIdFromUrl } from './utils/url';
import TimeOfTest from './TimeOfTest/TimeOfTest';

const PATIENT_LINK_QUERY = gql`
  query PatientLinkById($plid: String!) {
    patientLinkById(internalId: $plid) {
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
            <Header />
            <Switch>
              <Route
                path="/"
                exact
                render={({ location }) => (
                  <Redirect to={{ ...location, pathname: '/time-of-test' }} />
                )}
              />
              <Route path="/time-of-test" component={TimeOfTest} />
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

export default connect()(PatientApp);
