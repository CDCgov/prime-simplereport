import { useSelector } from "react-redux";
import { Route, Redirect } from "react-router-dom";

const GuardedRoute = ({ component: Component, auth, ...rest }: any) => {
  const plid = useSelector((state: any) => state.plid);
  return (
    <Route
      {...rest}
      render={(props) =>
        auth === true ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/",
              search: `?plid=${plid}`,
            }}
          />
        )
      }
    />
  );
};

export default GuardedRoute;
