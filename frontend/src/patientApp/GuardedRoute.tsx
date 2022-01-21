import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

interface Props {
  auth: boolean;
  element: any;
}

const GuardedRoute = ({ auth, element }: Props) => {
  const plid = useSelector((state: any) => state.plid);

  if (auth) {
    return element;
  } else {
    return (
      <Navigate
        to={{
          pathname: "/",
          search: `?plid=${plid}`,
        }}
        replace
      />
    );
  }
};

export default GuardedRoute;
