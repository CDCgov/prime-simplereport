import React from "react";

interface SearchResultsProps {
  loading?: boolean;
  resultCount: number;
  headers: string[];
  children: React.ReactNode;
}

const SearchResults = (props: SearchResultsProps) => {
  const { loading, headers, resultCount, children } = props;
  const showEmptyMessage = !loading && resultCount === 0;
  const showSuggestions = !loading && resultCount > 0;

  return (
    <div className="display-flex flex-column flex-align-center">
      {loading && <p>Searching...</p>}

      {showEmptyMessage && <span>No items found.</span>}

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
  );
};

export default SearchResults;
