import siteLogo from "../../img/simplereport-logo-color.svg";
import "./ErrorPage.scss";

const ErrorPage = () => {
    return (
      <main>
        <div className="error-img-container">
            <div className="usa-logo">
                <img src={siteLogo}
                alt = "{process.env.REACT_APP_TITLE}"/>
            </div>
        </div>
        <div className="grid-container maxw-tablet error-text-container">
          <h1 className="error-h1">Something went wrong :(</h1>
          <p>
            Please try refreshing your browser.
          </p>
          <p>If the problem continues, contact support@simplereport.gov for support.</p>
        </div>
      </main>
    );
  };
  
  export default ErrorPage;