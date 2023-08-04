import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";
import iconSprite from "../../../../node_modules/@uswds/uswds/dist/img/sprite.svg";
import "./CsvSchemaDocumentation.scss";
import { getAppInsights } from "../../TelemetryService";
import ScrollToTopOnMount from "../../commonComponents/ScrollToTopOnMount";
import { getFacilityIdFromUrl } from "../../utils/url";

import { schemaBuilder } from "./schemaBuilder";

export type CsvSchemaItem = {
  name: string;
  colHeader: string;
  required: boolean;
  requested: boolean;
  acceptedValues?: string[];
  description?: string[];
  subHeader?: string[];
  format?: string;
  examples?: string[];
};

type CsvSchemaItemProps = {
  item: CsvSchemaItem;
  className?: string;
};

export const CsvSchemaDocumentationItem: React.FC<CsvSchemaItemProps> = ({
  item,
  className,
}) => {
  return (
    <div className={className}>
      <h5
        id={`${item.colHeader}`}
        className="margin-bottom-2"
        data-testid="header"
      >
        {item.name}
        {item.required && (
          <span className="text-normal bg-white border-1px border-secondary font-body-3xs padding-x-1 padding-y-05 text-secondary margin-left-2 text-bottom">
            Required
          </span>
        )}

        {!item.required && item.requested && (
          <span className="text-normal bg-white border-1px border-base font-body-3xs padding-x-1 padding-y-05 text-base margin-left-2 text-bottom">
            Requested
          </span>
        )}

        {!item.required && !item.requested && (
          <span className="text-normal bg-white border-1px border-base font-body-3xs padding-x-1 padding-y-05 text-base margin-left-2 text-bottom">
            Optional
          </span>
        )}
      </h5>
      <div data-testid="subheader" className="margin-bottom-3">
        {item.subHeader?.map((subHeader) => (
          <p
            key={`${item.colHeader}-subheader-${subHeader}`}
            dangerouslySetInnerHTML={{ __html: `${subHeader}` }}
          />
        ))}
      </div>
      <div className="grid-row margin-bottom-05" data-testid="column-header">
        <div className="grid-col-4 text-base">Column header</div>
        <div className="grid-col-auto">
          <code>{item.colHeader}</code>
        </div>
      </div>
      {item.description && item.description.length > 0 && (
        <div
          className="grid-row margin-bottom-05 border-base-lighter border-top-1px padding-top-1"
          data-testid="description"
        >
          <div className="grid-col-4 text-base">Description</div>
          <div className="grid-col-8">
            {item.description?.map((line) => (
              <div
                className="margin-bottom-1"
                key={`${item.colHeader}-description-${line}`}
                dangerouslySetInnerHTML={{ __html: `${line}` }}
              />
            ))}
          </div>
        </div>
      )}
      {item.format && (
        <div
          className="grid-row margin-bottom-05 border-base-lighter border-top-1px padding-top-1"
          data-testid="format"
        >
          <div className="grid-col-4 text-base">Format</div>
          <div
            className="grid-col-8 prime-ul margin-top-0"
            dangerouslySetInnerHTML={{ __html: `${item.format}` }}
          />
        </div>
      )}
      {item.examples && item.examples.length > 0 && (
        <div
          className="grid-row margin-bottom-05 border-base-lighter border-top-1px padding-top-1"
          data-testid="examples"
        >
          <div className="grid-col-4 text-base">
            Example{item.examples.length > 1 && "s"}
          </div>
          <ul className="grid-col-8 prime-ul margin-top-0">
            {item.examples?.map((value) => (
              <li
                className={item.examples!.length > 1 ? "bullet-list" : ""}
                key={`${item.colHeader}-examples-${value}`}
                dangerouslySetInnerHTML={{ __html: `<em>${value}</em>` }}
              />
            ))}
          </ul>
        </div>
      )}
      {item.acceptedValues && item.acceptedValues.length > 0 && (
        <div
          className="grid-row margin-bottom-05 border-base-lighter border-top-1px padding-top-1"
          data-testid="accepted-values"
        >
          <div className="grid-col-4 text-base">Accepted values</div>
          <ul className="grid-col-8 prime-ul margin-top-0">
            {item.acceptedValues?.map((value) => (
              <li
                className={item.acceptedValues!.length > 1 ? "bullet-list" : ""}
                key={`${item.colHeader}-accepted-values-${value}`}
                dangerouslySetInnerHTML={{ __html: `${value}` }}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const getPageTitle = (hash: string) => {
  let srPageTitle = " | SimpleReport";
  let bulkResultsPageTitle = "Bulk results upload guide";
  if (hash === "#preparing-upload") {
    return bulkResultsPageTitle + " - preparing upload" + srPageTitle;
  } else if (hash === "#formatting-guidelines") {
    return bulkResultsPageTitle + " - formatting guidelines" + srPageTitle;
  } else {
    return bulkResultsPageTitle + srPageTitle;
  }
};

/* eslint-disable jsx-a11y/anchor-has-content */
const CsvSchemaDocumentation = () => {
  let location = useLocation();
  let locationHash = location.hash;
  let pageTitle = getPageTitle(locationHash);
  useEffect(() => {
    document.title = pageTitle;
    document.getElementById(location.hash.replace("#", ""))?.scrollIntoView();
  }, [location, pageTitle]);

  const appInsights = getAppInsights();
  const activeFacilityId = getFacilityIdFromUrl(location);
  const schema = schemaBuilder(activeFacilityId);

  return (
    <div className="prime-container card-container csv-guide-container">
      <ScrollToTopOnMount />
      <div className="usa-card__header">
        <div>
          <div className="display-flex flex-align-center">
            <svg
              className="usa-icon text-base margin-left-neg-2px"
              aria-hidden="true"
              focusable="false"
              role="img"
            >
              <use xlinkHref={iconSprite + "#arrow_back"}></use>
            </svg>
            <LinkWithQuery
              to={`/results/upload/submit`}
              className="margin-left-05"
            >
              Upload spreadsheet
            </LinkWithQuery>
          </div>
          <div>
            <h1 className="margin-top-2">Bulk results upload guide</h1>
          </div>
        </div>
      </div>
      <div className="tablet:grid-col-8 usa-prose usa-card__body">
        <section id="anchor-top">
          <p className="text-base sub-header">
            How to format and upload a CSV file to report test results in bulk
            through SimpleReport.
          </p>
          <p>
            SimpleReport’s bulk results uploader lets you report multiple test
            results at once using a CSV file. When you submit your results, the
            uploader tool verifies the data, then sends your results to the
            relevant state and/or local health department(s).
            <br />
            <br />
            The results uploader is connected with all{" "}
            <a
              href="/getting-started/organizations-and-testing-facilities/where-does-simplereport-work"
              className="usa-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              states partnered with SimpleReport
            </a>
            . If you report to multiple jurisdictions, you can share results
            with them using one spreadsheet. SimpleReport routes data to the
            appropriate health departments based on the facility location and
            patient address fields in your CSV.
          </p>
          <iframe
            width="640"
            height="360"
            title="SimpleReport bulk results uploader tutorial video"
            src="https://www.youtube.com/embed/qqhC7PFBdek"
          />
          <h2>In this guide</h2>
          <ul>
            <li>
              <a href="#formatting-guidelines" className="usa-link">
                Data formatting guide
              </a>
            </li>
            <li>
              <a href="#preparing-upload" className="usa-link">
                Preparing and uploading a spreadsheet
              </a>
            </li>
          </ul>
          <h2>Resources</h2>
          <ul>
            <li>
              <a
                href="/assets/resources/test_results_example_10-3-2022.csv"
                className="usa-link"
                onClick={() => {
                  appInsights?.trackEvent({
                    name: "Download spreadsheet template",
                  });
                }}
              >
                SimpleReport spreadsheet template with example data [CSV
                download]
              </a>
            </li>
            <li>
              <a href="https://youtu.be/qqhC7PFBdek" className="usa-link">
                Spreadsheet results uploader training video [Youtube video]
              </a>
            </li>
            <li>
              <LinkWithQuery to={`/results/upload/submit/code-lookup`}>
                Device code lookup tool
              </LinkWithQuery>
            </li>
            <li>
              <a href="mailto:support@simplereport.gov" className="usa-link">
                SimpleReport support email
              </a>
            </li>
          </ul>
        </section>
        <section className="border-top-1px border-ink margin-top-9">
          <h2 id="formatting-guidelines">Data formatting guide</h2>
          <p>
            The SimpleReport results spreadsheet template is a blend of the
            Department of Health and Human Service’s (HHS){" "}
            <a
              href="https://www.hhs.gov/coronavirus/testing/covid-19-diagnostic-data-reporting/index.html"
              target="_blank"
              rel="noreferrer noopener"
              className="usa-link"
            >
              requirements for COVID-19 test data
            </a>{" "}
            as well as those of many jurisdictions. This standard data format
            will be accepted by state, tribal, local, or territorial (STLT){" "}
            <a
              href="/getting-started/organizations-and-testing-facilities/where-does-simplereport-work"
              className="usa-link"
            >
              health departments partnered with SimpleReport.
            </a>{" "}
          </p>

          <h3 className="margin-top-4">Formatting rules</h3>
          <h4>Include all SimpleReport columns</h4>
          <p>
            Include all columns in the SimpleReport template, with no extras.
            The order doesn’t matter.
          </p>
          <h4>Match SimpleReport field names exactly</h4>
          <p>
            Write column headers exactly as they are in the guidelines and the
            template. For example, if you have a “date of birth” column, you
            must rename it “patient_dob” to match our template.
          </p>
          <h4>Include data for all required fields</h4>
          <p>
            The data template has three field types: required, requested, and
            optional. SimpleReport won’t accept files with missing or incorrect
            headers and values in required fields. Requested fields are not
            required by HHS, but the data is helpful to jurisdictions. The tags
            next to data element names listed below show field type:
          </p>
          <p>
            <span className="text-normal bg-white border-1px border-secondary font-body-1xs padding-x-1 padding-y-05 text-secondary margin-right-1 text-middle">
              Required
            </span>
            <span className="text-normal bg-white border-1px border-base font-body-1xs padding-x-1 padding-y-05 text-base margin-right-1 text-middle">
              Requested
            </span>
            <span className="text-normal bg-white border-1px border-base font-body-1xs padding-x-1 padding-y-05 text-base margin-right-1 text-middle">
              Optional
            </span>
          </p>
        </section>

        <section className="margin-top-5">
          <h3>Data elements</h3>
          {schema.fields.map((field) => {
            const sectionTitles = field?.sections
              .map((val) => val.title)
              .reduce((acc, cur) => acc + cur);
            return (
              <ul key={`toc-${sectionTitles}`} className="">
                {field.sections?.map((section) => {
                  return (
                    <li key={`${sectionTitles}-link-${section.title}`}>
                      <a href={`#${section.slug}`} className="usa-link">
                        {section.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            );
          })}
        </section>

        {schema.fields.map((field) => {
          const sectionTitles = field?.sections
            .map((val) => val.title)
            .reduce((acc, cur) => acc + cur);
          return (
            <div
              data-testid="fieldDiv"
              key={`field-${sectionTitles}`}
              className="margin-bottom-5"
            >
              {field.sections?.map((section) => {
                return (
                  <div
                    key={`sectionTiles-section-${section.title}`}
                    className="margin-top-9"
                  >
                    <h4 id={`${section.slug}`}>{section.title}</h4>

                    {section.items?.map((item) => {
                      return (
                        <CsvSchemaDocumentationItem
                          item={item}
                          key={item.name}
                          className="rs-documentation__values margin-top-6"
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
        <section className="border-top-1px border-ink margin-top-9 ">
          <h2 id="preparing-upload">Preparing and uploading a spreadsheet</h2>
          <ol className="usa-process-list">
            <li className="usa-process-list__item">
              <h3 className="usa-process-list__heading">
                Create or export your spreadsheet
              </h3>
              <p className="margin-top-05">
                If your organization already uses a set spreadsheet format for
                results, you need to adjust it to match the SimpleReport
                template. If you don’t have one, use the{" "}
                <a
                  href="/assets/resources/test_results_example_10-3-2022.csv"
                  className="usa-link"
                  onClick={() => {
                    appInsights?.trackEvent({
                      name: "Download spreadsheet template",
                    });
                  }}
                >
                  spreadsheet template
                </a>{" "}
                as a starting point.
              </p>
            </li>
            <li className="usa-process-list__item">
              <h3 className="usa-process-list__heading">
                Format using the SimpleReport template
              </h3>
              <p>
                In your spreadsheet, include all column headers in the
                spreadsheet, exactly as written in the template and guidelines,
                with no extras. Copy column header names exactly. Be sure to
                include every column in the template, even if you don’t have
                data for every field.
              </p>
            </li>
            <li className="usa-process-list__item">
              <h3 className="usa-process-list__heading">Enter your data</h3>
              <p>
                Following the{" "}
                <a href="#formatting-guidelines" className="usa-link">
                  spreadsheet guidelines
                </a>
                , enter properly formatted values in the relevant fields. Some
                fields require data, while others don’t.
              </p>
            </li>
            <li className="usa-process-list__item">
              <h3 className="usa-process-list__heading">
                Export or save your CSV
              </h3>
              <p>
                Make sure your spreadsheet is in a CSV format. SimpleReport
                doesn’t accept .XLS, .XLXS, or other formats.
              </p>
              <p>
                Note: If your spreadsheet is larger than 50 MB or 10,000 rows,
                please separate it into multiple files.
              </p>
            </li>
            <li className="usa-process-list__item">
              <h3 className="usa-process-list__heading">
                Use the uploader on SimpleReport
              </h3>
              <p>
                Visit the{" "}
                <LinkWithQuery to={"/results/upload/submit"}>
                  "Upload spreadsheet"
                </LinkWithQuery>{" "}
                tab under “Results” in the main SimpleReport navigation. Select
                your CSV by dragging the file from a folder to the upload area,
                or browse your computer to find and open it. Once you click
                Upload your CSV, SimpleReport will check your file to see if it
                matches the template. If it accepts the file, you’ll see a
                confirmation message.
              </p>
            </li>
            <li className="usa-process-list__item">
              <h3 className="usa-process-list__heading">Fix any errors</h3>
              <p>
                If SimpleReport finds any errors in the spreadsheet formatting
                or data, it will recommend how to fix them. Once you’ve made the
                recommended changes in your spreadsheet, save it, and then
                upload it again.
              </p>
            </li>
          </ol>
        </section>
        <p className="margin-top-8">
          <a href="#anchor-top" className="usa-link">
            Return to top
          </a>
        </p>
      </div>
    </div>
  );
};

export default CsvSchemaDocumentation;
