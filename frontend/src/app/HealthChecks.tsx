import { Route, Routes } from "react-router-dom";

import DeploySmokeTest from "./DeploySmokeTest";

const HealthChecks = () => (
  <Routes>
    <Route path="ping" element={<div>pong</div>} />
    <Route
      path="commit"
      element={<div>{process.env.REACT_APP_CURRENT_COMMIT}</div>}
    />
    <Route path="deploy-smoke-test" element={<DeploySmokeTest />} />
  </Routes>
);

export default HealthChecks;
