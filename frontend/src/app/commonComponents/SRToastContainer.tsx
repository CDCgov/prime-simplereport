import React from "react";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "./SRToastContainer.scss";

const SRToastContainer = () => {
  const autoClose = 5000;
  const closeButton = true;
  const hideProgressBar = true;
  const limit = 2;
  const position = "bottom-left";

  return (
    <ToastContainer
      autoClose={autoClose}
      closeButton={closeButton}
      hideProgressBar={hideProgressBar}
      limit={limit}
      position={position}
    />
  );
};

export default SRToastContainer;
