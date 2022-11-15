import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

import VersionEnforcer from "../VersionEnforcer";
import { MaintenanceBanner } from "../commonComponents/MaintenanceBanner";
import { TrainingNotification } from "../commonComponents/TrainingNotification";
import Uploads from "../testResults/uploads/Uploads";
import ProtectedRoute from "../commonComponents/ProtectedRoute";
import Page from "../commonComponents/Page/Page";
import { appPermissions } from "../permissions";
import Schema from "../testResults/uploads/CsvSchemaDocumentation";
import Submission from "../testResults/submissions/Submission";
import Submissions from "../testResults/submissions/Submissions";
import WithAuthenticatedUser from "../withAuthenticatedUser/WithAuthenticatedUser";
import { RootState } from "../store";
import { UserPermission } from "../../generated/graphql";

import UploaderHeader from "./UploaderHeader";
import DeviceLookupContainer from "./DeviceLookup/DeviceLookupContainer";

const UploadResultsApp = () => {
  const dataLoaded = useSelector<RootState, boolean>(
    (state) => state.dataLoaded
  );
  const permissions = useSelector<RootState, UserPermission[]>(
    (state) => state.user.permissions
  );

  const canViewResults = appPermissions.results.canView;

  console.log(`dataLoaded: ${dataLoaded}`);
  return (
    <WithAuthenticatedUser>
      <VersionEnforcer />
      {process.env.REACT_APP_DISABLE_MAINTENANCE_BANNER === "true" ? null : (
        <MaintenanceBanner />
      )}
      {process.env.REACT_APP_IS_TRAINING_SITE === "true" && (
        <TrainingNotification />
      )}
      <Page
        header={<UploaderHeader />}
        children={
          dataLoaded && (
            // don't render routes until data is loaded
            <Routes>
              <Route path="/" element={<Navigate to="submit" />} />
              <Route
                path="submit"
                element={
                  <ProtectedRoute
                    requiredPermissions={canViewResults}
                    userPermissions={permissions}
                    element={<Uploads />}
                  />
                }
              />
              <Route
                path="code-lookup"
                element={
                  <ProtectedRoute
                    requiredPermissions={canViewResults}
                    userPermissions={permissions}
                    element={<DeviceLookupContainer />}
                  />
                }
              />
              <Route
                path="guide"
                element={
                  <ProtectedRoute
                    requiredPermissions={canViewResults}
                    userPermissions={permissions}
                    element={<Schema />}
                  />
                }
              />
              <Route
                path="history/submission/:id"
                element={
                  <ProtectedRoute
                    requiredPermissions={canViewResults}
                    userPermissions={permissions}
                    element={<Submission />}
                  />
                }
              />
              <Route
                path={"history"}
                element={
                  <ProtectedRoute
                    requiredPermissions={canViewResults}
                    userPermissions={permissions}
                    element={<Submissions />}
                  />
                }
              />
              <Route
                path={"history/:pageNumber"}
                element={
                  <ProtectedRoute
                    requiredPermissions={canViewResults}
                    userPermissions={permissions}
                    element={<Submissions />}
                  />
                }
              />
            </Routes>
          )
        }
      />
    </WithAuthenticatedUser>
  );
};

export default UploadResultsApp;
