import React from "react";

interface SearchResultsProps {
  dropDownRef: React.RefObject<HTMLDivElement>;
  resultCount: number;
  headers: string[];
  children: React.ReactNode;
  loading?: boolean;
}

const SearchResults = (props: SearchResultsProps) => {
  const { loading, dropDownRef, headers, resultCount, children } = props;
  const showEmptyMessage = !loading && resultCount === 0;
  const showSuggestions = !loading && resultCount > 0;

  return (
    <div
      ref={dropDownRef}
      className="card-container shadow-3 results-dropdown"
      aria-live="polite"
      aria-atomic="true"
      role="region"
    >
      <div className="usa-card__body results-dropdown__body">
        {loading ||
          (showEmptyMessage && (
            <div className="display-flex flex-column flex-align-center">
              {loading && <p>Searching...</p>}
              {showEmptyMessage && <span>No items found.</span>}
            </div>
          ))}

        {showSuggestions && (
          <table
            className="usa-table usa-table--borderless"
            aria-describedby="search-results-table"
          >
            <thead>
              <tr>
                {headers.map((header) => (
                  <th scope="col">{header}</th>
                ))}
              </tr>
            </thead>

            <tbody>{children}</tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
