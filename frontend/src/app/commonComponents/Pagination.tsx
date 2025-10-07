import React from "react";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

import "./Pagination.scss";
import { LinkWithQuery } from "../commonComponents/LinkWithQuery";
import { getNumberFromUrlPath } from "../utils/number";

interface Props {
  baseRoute: string;
  totalEntries: number;
  entriesPerPage: number;
  currentPage: number;
  pageGroupSize?: number;
  className?: string;
  onPaginationClick?: (pageNumber: number) => void;
}

// Rules:
// * Always show first/last page (may be the same page!)
// * Show current page and N pages on either side
// * Use ellipsis if gaps between group and first/last
//

// Always make this odd, so current page is in the middle
const defaultGroupSize = 7;
type PageListType = number | "firstEllipses" | "lastEllipses";
const Pagination = ({
  baseRoute,
  currentPage: rawCurrentPage,
  entriesPerPage,
  totalEntries,
  pageGroupSize = defaultGroupSize,
  className,
  onPaginationClick,
}: Props) => {
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const currentPage = Math.min(Math.max(+rawCurrentPage || 0, 1), totalPages);
  const groupGutter = Math.floor(pageGroupSize / 2);
  const pageList: PageListType[] = [];

  // Ensure that the first, last, and at least groupGutter pages show
  let minGroupPage = currentPage - groupGutter;
  let maxGroupPage = currentPage + groupGutter;
  if (minGroupPage < 1) {
    maxGroupPage = maxGroupPage - minGroupPage + 1;
    minGroupPage = 1;
  }
  if (maxGroupPage > totalPages) {
    minGroupPage = Math.max(1, minGroupPage - (maxGroupPage - totalPages));
    maxGroupPage = totalPages;
  }

  const Link = (props: {
    to: string | number;
    active?: boolean;
    label?: string;
    children: React.ReactNode;
  }) => {
    let pageNumber = getNumberFromUrlPath(props.to);
    return (
      <LinkWithQuery
        to={`${baseRoute}/${props.to}`}
        className={classnames(props.active && "is-active")}
        aria-label={props.label}
        onClick={() =>
          onPaginationClick && pageNumber ? onPaginationClick(pageNumber) : null
        }
      >
        {props.children}
      </LinkWithQuery>
    );
  };

  // Build list of pages, with 0 representing the ellipsis
  if (minGroupPage !== 1) {
    pageList.push(1);
  }
  if (minGroupPage > 2) {
    pageList.push("firstEllipses");
  }
  for (let pn = minGroupPage; pn <= maxGroupPage; pn++) {
    pageList.push(pn);
  }
  if (maxGroupPage < totalPages - 1) {
    pageList.push("lastEllipses");
  }
  if (maxGroupPage !== totalPages) {
    pageList.push(totalPages);
  }

  return (
    <>
      {pageList.length > 0 && (
        <nav
          className={classnames("usa-pagination", className)}
          role="navigation"
          aria-label="Pagination"
        >
          <ol>
            {currentPage > 1 && (
              <li key="prevpage">
                <Link to={`${currentPage - 1}`} label="Previous Page">
                  <FontAwesomeIcon icon={faAngleLeft as IconProp} /> Prev
                </Link>
              </li>
            )}
            {pageList.map((pn) =>
              typeof pn === "number" ? (
                <li key={pn}>
                  <Link
                    to={pn}
                    label={`Page ${pn}`}
                    active={pn === currentPage}
                  >
                    <span>{pn}</span>
                  </Link>
                </li>
              ) : (
                <li key={pn} aria-hidden="true">
                  …
                </li>
              )
            )}
            {currentPage < totalPages && (
              <li key="nextpage">
                <Link to={`${currentPage + 1}`} label="Next Page">
                  Next <FontAwesomeIcon icon={faAngleRight as IconProp} />
                </Link>
              </li>
            )}
          </ol>
        </nav>
      )}
    </>
  );
};

export default Pagination;
