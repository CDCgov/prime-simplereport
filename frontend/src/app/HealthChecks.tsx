import { Route, Routes } from "react-router-dom";

const HealthChecks = () => (
  <Routes>
    <Route path="ping" element={<div>pong</div>} />
    <Route
      path="commit"
      element={<div>{process.env.REACT_APP_CURRENT_COMMIT}</div>}
    />
  </Routes>
);

export default HealthChecks;
