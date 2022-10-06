import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";
import { useDocumentTitle } from "../../utils/hooks";
import iconSprite from "../../../../node_modules/uswds/dist/img/sprite.svg";

import "./CsvSchemaDocumentation.scss";
import schema from "./schema.json";

export type CsvSchemaItem = {
  name: string;
  colHeader: string;
  required: boolean;
  requested: boolean;
  acceptedFormat: boolean;
  acceptedValues: boolean;
  acceptedExample: boolean;
  valueType: string;
  values: string[];
  notes: string[];
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
      <h3
        id={`doc-${item.colHeader}`}
        className="margin-bottom-2"
        data-testid="header"
      >
        {item.name}
        {item.required && (
          <span className="text-normal bg-white border-1px border-secondary font-body-3xs padding-x-1 padding-y-05 text-secondary margin-left-2 text-ttbottom">
            Required
          </span>
        )}

        {!item.required && item.requested && (
          <span className="text-normal bg-white border-1px border-base font-body-3xs padding-x-1 padding-y-05 text-base margin-left-2 text-ttbottom">
            Requested
          </span>
        )}

        {!item.required && !item.requested && (
          <span className="text-normal bg-white border-1px border-base font-body-3xs padding-x-1 padding-y-05 text-base margin-left-2 text-ttbottom">
            Optional
          </span>
        )}
      </h3>
      <div data-testid="notes" className="margin-bottom-3">
        {item.notes?.map((note, noteIndex) => (
          <p
            key={`${item.colHeader}-note-${noteIndex}`}
            dangerouslySetInnerHTML={{ __html: `${note}` }}
          />
        ))}
      </div>
      <div className="grid-row margin-bottom-05">
        <div className="grid-col-4 text-base">Column header</div>
        <div className="grid-col-auto">{item.colHeader}</div>
      </div>
      <div className="grid-row margin-bottom-05 border-base-lighter border-top-1px padding-top-1">
        <div className="grid-col-4 text-base">Value type</div>
        <div className="grid-col-auto">{item.valueType}</div>
      </div>
      {(item.acceptedFormat || item.acceptedValues || item.acceptedExample) && (
        <div className="grid-row margin-bottom-05 border-base-lighter border-top-1px padding-top-1">
          <div className="grid-col-4 text-base">
            {item.acceptedFormat && "Accepted format"}
            {item.acceptedValues && "Accepted value(s)"}
            {item.acceptedExample && "Example(s)"}
          </div>
          <ul className="grid-col-8 prime-ul margin-top-0">
            {item.values?.map((value, valueIndex) => (
              <li
                key={`${item.colHeader}-value-${valueIndex}`}
                dangerouslySetInnerHTML={{ __html: `${value}` }}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/* eslint-disable jsx-a11y/anchor-has-content */
const CsvSchemaDocumentation = () => {
  useDocumentTitle("Bulk results upload guide");

  return (
    <div className="prime-container card-container csv-guide-container">
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
          <iframe
            width="640"
            height="360"
            title="SimpleReport bulk results uploader tutorial video"
            src="https://www.youtube.com/embed/qqhC7PFBdek"
          />
          <h2>In this guide</h2>
          <ul>
            <li>
              <a href="#" className="usa-link">
                About the CSV results uploader
              </a>
            </li>
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
              >
                SimpleReport spreadsheet template with example data
              </a>
            </li>
            <li>
              <a href="https://youtu.be/qqhC7PFBdek" className="usa-link">
                Spreadsheet results uploader training video
              </a>
            </li>
            <li>
              <a href="mailto:support@simplereport.gov" className="usa-link">
                SimpleReport support
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
          <h2>Data elements</h2>
          {schema.fields.map((field, fieldIndex) => {
            return (
              <ul key={`toc-${fieldIndex}`} className="">
                {field.sections?.map((section, sectionIndex) => {
                  return (
                    <li key={`toc-${fieldIndex}-${sectionIndex}`}>
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

        {schema.fields.map((field, fieldIndex) => {
          return (
            <div
              data-testid="fieldDiv"
              key={`field-${fieldIndex}`}
              className="margin-bottom-5"
            >
              {field.sections?.map((section, sectionIndex) => {
                return (
                  <div
                    key={`section-${fieldIndex}-${sectionIndex}`}
                    className="border-top-1px border-ink margin-top-9"
                  >
                    <h2 id={`${section.slug}`}>{section.title}</h2>

                    {section.items?.map((item) => {
                      return (
                        <CsvSchemaDocumentationItem
                          item={item}
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
                results, you may have to adjust it to match the SimpleReport
                template. If you don’t have one, use the{" "}
                <a
                  href="/assets/resources/test_results_example_10-3-2022.csv"
                  className="usa-link"
                >
                  spreadsheet template file
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
                spreadsheet template and guidelines below, with no extras. Copy
                column header names exactly. Be sure to include every column in
                the template, even if you don’t have data for every field.
              </p>
            </li>
            <li className="usa-process-list__item">
              <h3 className="usa-process-list__heading">Enter your data</h3>
              <p>
                Following the spreadsheet guidelines below, enter properly
                formatted values in the relevant fields. Some fields require
                data, while others don’t.
              </p>
            </li>
            <li className="usa-process-list__item">
              <h3 className="usa-process-list__heading">
                Export or save your data
              </h3>
              <p>
                Make sure your spreadsheet is in a CSV format. SimpleReport
                doesn’t accept XLS, XLXS, or any other formats.
              </p>
            </li>
            <li className="usa-process-list__item">
              <h3 className="usa-process-list__heading">
                Use the uploader on SimpleReport
              </h3>
              <p>
                Visit the{" "}
                <LinkWithQuery to={"/results/upload/submit"}>
                  "upload spreadsheet"
                </LinkWithQuery>{" "}
                tab under “Results” in the main SimpleReport navigation. Select
                your CSV by dragging the file from a folder to the upload area,
                or browse your computer to find and open it. Once you click
                Upload your CSV, SimpleReport will check your file to see if it
                matches the template. If it accepts the file, you’ll see a
                confirmation message.
              </p>

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
