import USAGovBanner from "../commonComponents/USAGovBanner";
import siteLogo from "../../img/simplereport-logo-color.svg";

const ErrorPage = () => {
  return (
    <>
      <USAGovBanner />
      <header className="border-bottom border-base-lighter padding-y-1">
        <div className="grid-container">
          <a href={import.meta.env.VITE_PUBLIC_URL || "/"}>
            <img
              className="maxh-4"
              src={siteLogo}
              alt={import.meta.env.VITE_TITLE}
            />
          </a>
        </div>
      </header>
      <main className="usa-section">
        <div className="grid-container usa-prose">
          <h1 className="">Something went wrong :(</h1>
          <p className="usa-intro">Please try refreshing your browser.</p>
          <p>
            If the problem continues, contact{" "}
            <a href="mailto:support@simplereport.gov">
              support@simplereport.gov
            </a>{" "}
            for support.
          </p>
        </div>
      </main>
    </>
  );
};

export default ErrorPage;
