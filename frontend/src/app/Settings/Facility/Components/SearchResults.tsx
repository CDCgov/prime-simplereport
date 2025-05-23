import React from "react";

interface SearchResultsProps {
  dropdownRef: React.RefObject<any>;
  resultCount: number;
  headers: string[];
  children: React.ReactNode;
  loading?: boolean;
}

const SearchResults = (props: SearchResultsProps) => {
  const { loading, dropdownRef, headers, resultCount, children } = props;
  const showEmptyMessage = !loading && resultCount === 0;
  const showSuggestions = !loading && resultCount > 0;

  return (
    <div
      ref={dropdownRef}
      className="card-container shadow-3 width-full results-dropdown maxh-card-lg"
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
                  <th scope="col" key={header}>
                    {header}
                  </th>
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
