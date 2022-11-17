import { connect, useSelector } from "react-redux";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { UserPermission } from "../generated/graphql";

import ProtectedRoute from "./commonComponents/ProtectedRoute";
import Page from "./commonComponents/Page/Page";
import { RootState } from "./store";
import TestResultsList from "./testResults/TestResultsList";
import CleanTestResultsList from "./testResults/CleanTestResultsList";
import TestQueueContainer from "./testQueue/TestQueueContainer";
import ManagePatientsContainer from "./patients/ManagePatientsContainer";
import EditPatientContainer from "./patients/EditPatientContainer";
import AddPatient from "./patients/AddPatient";
import SupportAdminRoutes from "./supportAdmin/SupportAdminRoutes";
import WithFacility from "./facilitySelect/WithFacility";
import { appPermissions, hasPermission } from "./permissions";
import Settings from "./Settings/Settings";
import VersionEnforcer from "./VersionEnforcer";
import { TrainingNotification } from "./commonComponents/TrainingNotification";
import { MaintenanceBanner } from "./commonComponents/MaintenanceBanner";
import { Analytics } from "./analytics/Analytics";
import Uploads from "./testResults/uploads/Uploads";
import Schema from "./testResults/uploads/CsvSchemaDocumentation";
import Submission from "./testResults/submissions/Submission";
import Submissions from "./testResults/submissions/Submissions";
import ResultsNavWrapper from "./testResults/ResultsNavWrapper";
import DeviceLookupContainer from "./uploads/DeviceLookup/DeviceLookupContainer";
import MainHeader from "./commonComponents/MainHeader";
import WithAuthenticatedUser from "./withAuthenticatedUser/WithAuthenticatedUser";

const App = () => {
  const location = useLocation();
  const dataLoaded = useSelector<RootState, boolean>(
    (state) => state.dataLoaded
  );
  const isSupportAdmin = useSelector<RootState, boolean>(
    (state) => state.user.isAdmin
  );
  const permissions = useSelector<RootState, UserPermission[]>(
    (state) => state.user.permissions
  );
  const isOrgAdmin = hasPermission(
    permissions,
    appPermissions.settings.canView
  );

  let homepagePath: string;

  if (isSupportAdmin) {
    homepagePath = "admin";
  } else if (isOrgAdmin) {
    homepagePath = "dashboard";
  } else {
    homepagePath = "queue";
  }

  const canViewResults = appPermissions.results.canView;
  const canViewPeople = appPermissions.people.canView;
  const canEditPeople = appPermissions.people.canEdit;
  const canViewSettings = appPermissions.settings.canView;

  return (
    <WithAuthenticatedUser>
      <VersionEnforcer />
      {process.env.REACT_APP_DISABLE_MAINTENANCE_BANNER === "true" ? null : (
        <MaintenanceBanner />
      )}
      {process.env.REACT_APP_IS_TRAINING_SITE === "true" && (
        <TrainingNotification />
      )}
      <WithFacility>
        <Page
          header={<MainHeader />}
          children={
            // todo: talk about whether this is ok - could lead to flickering? but possibly not any more than we already do
            // don't return routes until user data loaded to redux store
            dataLoaded && (
              <Routes>
                <Route
                  path="/"
                  element={
                    <Navigate
                      to={{ pathname: homepagePath, search: location.search }}
                    />
                  }
                />
                <Route path="queue" element={<TestQueueContainer />} />
                <Route
                  path="results/:pageNumber"
                  element={
                    <ProtectedRoute
                      requiredPermissions={canViewResults}
                      userPermissions={permissions}
                      element={
                        <ResultsNavWrapper>
                          <TestResultsList />
                        </ResultsNavWrapper>
                      }
                    />
                  }
                />
                <Route
                  path="results"
                  element={
                    <ProtectedRoute
                      requiredPermissions={canViewResults}
                      userPermissions={permissions}
                      element={
                        <ResultsNavWrapper>
                          <CleanTestResultsList />
                        </ResultsNavWrapper>
                      }
                    />
                  }
                />
                <Route
                  path="results/upload/submit/code-lookup"
                  element={
                    <ProtectedRoute
                      requiredPermissions={canViewResults}
                      userPermissions={permissions}
                      element={
                        <ResultsNavWrapper>
                          <DeviceLookupContainer />
                        </ResultsNavWrapper>
                      }
                    />
                  }
                />
                <Route
                  path="results/upload/submit"
                  element={
                    <ProtectedRoute
                      requiredPermissions={canViewResults}
                      userPermissions={permissions}
                      element={
                        <ResultsNavWrapper>
                          <Uploads />
                        </ResultsNavWrapper>
                      }
                    />
                  }
                />
                <Route
                  path="results/upload/submit/guide"
                  element={
                    <ProtectedRoute
                      requiredPermissions={canViewResults}
                      userPermissions={permissions}
                      element={
                        <ResultsNavWrapper>
                          <Schema />
                        </ResultsNavWrapper>
                      }
                    />
                  }
                />

                <Route
                  path="results/upload/history/submission/:id"
                  element={
                    <ProtectedRoute
                      requiredPermissions={canViewResults}
                      userPermissions={permissions}
                      element={
                        <ResultsNavWrapper>
                          <Submission />
                        </ResultsNavWrapper>
                      }
                    />
                  }
                />
                <Route
                  path={"results/upload/history"}
                  element={
                    <ProtectedRoute
                      requiredPermissions={canViewResults}
                      userPermissions={permissions}
                      element={
                        <ResultsNavWrapper>
                          <Submissions />
                        </ResultsNavWrapper>
                      }
                    />
                  }
                />
                <Route
                  path={"results/upload/history/:pageNumber"}
                  element={
                    <ProtectedRoute
                      requiredPermissions={canViewResults}
                      userPermissions={permissions}
                      element={
                        <ResultsNavWrapper>
                          <Submissions />
                        </ResultsNavWrapper>
                      }
                    />
                  }
                />
                <Route path="patients">
                  <Route
                    path=":pageNumber"
                    element={
                      <ProtectedRoute
                        requiredPermissions={canViewPeople}
                        userPermissions={permissions}
                        element={<ManagePatientsContainer />}
                      />
                    }
                  />
                  <Route
                    path=""
                    element={
                      <ProtectedRoute
                        requiredPermissions={canViewPeople}
                        userPermissions={permissions}
                        element={<ManagePatientsContainer />}
                      />
                    }
                  />
                </Route>
                <Route
                  path="patient/:patientId"
                  element={
                    <ProtectedRoute
                      requiredPermissions={canEditPeople}
                      userPermissions={permissions}
                      element={<EditPatientContainer />}
                    />
                  }
                />
                <Route
                  path="add-patient"
                  element={
                    <ProtectedRoute
                      requiredPermissions={canEditPeople}
                      userPermissions={permissions}
                      element={<AddPatient />}
                    />
                  }
                />
                <Route
                  path="settings/*"
                  element={
                    <ProtectedRoute
                      requiredPermissions={canViewSettings}
                      userPermissions={permissions}
                      element={<Settings />}
                    />
                  }
                />
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute
                      requiredPermissions={canViewSettings}
                      userPermissions={permissions}
                      element={<Analytics />}
                    />
                  }
                />
                <Route
                  path="admin/*"
                  element={<SupportAdminRoutes isAdmin={isSupportAdmin} />}
                />
              </Routes>
            )
          }
        />
      </WithFacility>
    </WithAuthenticatedUser>
  );
};

export default connect()(App);
