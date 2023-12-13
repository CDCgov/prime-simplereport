import { Route, Routes } from "react-router-dom";

import ProdSmokeTest from "./ProdSmokeTest";

const HealthChecks = () => (
  <Routes>
    <Route path="ping" element={<div>pong</div>} />
    <Route
      path="commit"
      element={<div>{process.env.REACT_APP_CURRENT_COMMIT}</div>}
    />
    <Route path="prod-smoke-test" element={<ProdSmokeTest />} />
  </Routes>
);

export default HealthChecks;
