import React from "react";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import "./Pagination.scss";
import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

interface Props {
  baseRoute: string;
  totalEntries: number;
  entriesPerPage: number;
  currentPage: number;
  pageGroupSize?: number;
  className?: string;
}

// Rules:
// * Always show first/last page (may be the same page!)
// * Show current page and N pages on either side
// * Use elipsis if gaps between group and first/last
//

// Always make this odd, current page is in the middle
const defaultGroupSize = 7;

const Pagination = ({
  baseRoute,
  currentPage: rawCurrentPage,
  entriesPerPage,
  totalEntries,
  pageGroupSize = defaultGroupSize,
  className,
}: Props) => {
  const groupGutter = Math.floor(pageGroupSize / 2);
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const currentPage = Math.min(Math.max(+rawCurrentPage || 0, 1), totalPages);
  const minGroupPage = Math.max(1, currentPage - groupGutter);
  const maxGroupPage = Math.min(currentPage + groupGutter, totalPages);
  const pageList = [];

  const Link = (props: {
    to: string | number;
    active?: boolean;
    label?: string;
    children: React.ReactNode;
  }) => (
    <LinkWithQuery
      to={`${baseRoute}/${props.to}`}
      className={classnames(props.active && "is-active")}
      aria-label={props.label}
    >
      {props.children}
    </LinkWithQuery>
  );

  // Build list of pages, with 0 representing the ellipsis
  if (minGroupPage !== 1) {
    pageList.push(1);
  }
  if (minGroupPage >= groupGutter) {
    pageList.push(0);
  }
  for (let pn = minGroupPage; pn <= maxGroupPage; pn++) {
    pageList.push(pn);
  }
  if (maxGroupPage <= totalPages - groupGutter + 1) {
    pageList.push(0);
  }
  if (maxGroupPage !== totalPages) {
    pageList.push(totalPages);
  }

  return (
    <nav
      className={classnames("usa-pagination", className)}
      role="navigation"
      aria-label="Pagination"
    >
      <ol>
        {currentPage > 1 && (
          <li key="prevpage">
            <Link to={`${currentPage - 1}`} label="Previous Page">
              <FontAwesomeIcon icon={faAngleLeft} /> Prev
            </Link>
          </li>
        )}
        {pageList.map((pn, index) =>
          pn ? (
            <li key={pn}>
              <Link to={pn} label={`Page ${pn}`} active={pn === currentPage}>
                <span>{pn}</span>
              </Link>
            </li>
          ) : (
            <li key={`elp${index}`} aria-hidden="true">
              …
            </li>
          )
        )}
        {currentPage < totalPages && (
          <li key="nextpage">
            <Link to={`${currentPage + 1}`} label="Next Page">
              Next <FontAwesomeIcon icon={faAngleRight} />
            </Link>
          </li>
        )}
      </ol>
    </nav>
  );
};

export default Pagination;
