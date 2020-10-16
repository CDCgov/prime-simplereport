import React from "react";
import { Redirect, Route } from "react-router-dom";

const ProtectedRoute = ({ component: Component, isAuthenticated, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        if (isAuthenticated) {
          return <Component {...rest} {...props} />;
        }
        return <Redirect to="/login" />;
      }}
    />
  );
};

export default ProtectedRoute;
