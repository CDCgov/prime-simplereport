import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";

import "./ManageSelfRegistrationLinks.scss";

type FacilitySlug = { name: string; slug: string };

type Props = {
  baseUrl: string;
  isNewFeature: boolean;
  organizationSlug: string;
  facilitySlugs: FacilitySlug[];
  howItWorksPath: string;
};

export const ManageSelfRegistrationLinks = ({
  baseUrl,
  isNewFeature,
  organizationSlug,
  facilitySlugs,
  howItWorksPath,
}: Props) => {
  const [copiedSlug, setCopiedSlug] = useState<string>();

  useEffect(() => {
    if (!copiedSlug) {
      return;
    }
    const timeout = setTimeout(() => {
      setCopiedSlug(undefined);
    }, 3000);
    return () => {
      clearTimeout(timeout);
    };
  }, [copiedSlug]);

  async function copySlug(slug: string) {
    try {
      await navigator.clipboard.writeText(getRegistrationLink(baseUrl, slug));
      setCopiedSlug(slug);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="grid-row position-relative">
      <div className="prime-container card-container">
        <div className="usa-card__header">
          <h2 className="display-flex flex-row flex-align-center">
            <span>Patient self-registration</span>
            {isNewFeature && (
              <span className="usa-tag margin-left-1 bg-black padding-y-05">
                New
              </span>
            )}
          </h2>
        </div>
        <div className="usa-card__body maxw-prose padding-y-3">
          <p>
            Patients can now register themselves online — saving time during the
            testing process and reducing data entry for your staff.
          </p>
          <p>
            <a
              href={makeLink(baseUrl, howItWorksPath)}
              target="_blank"
              rel="noreferrer"
            >
              How patient self-registration works
            </a>
          </p>
          <OrganizationLink
            baseUrl={baseUrl}
            slug={organizationSlug}
            copySlug={copySlug}
            copied={copiedSlug === organizationSlug}
          />
          <FacilityLinks
            baseUrl={baseUrl}
            slugs={facilitySlugs}
            copySlug={copySlug}
            copiedSlug={copiedSlug}
          />
        </div>
      </div>
    </div>
  );
};

type OrgLinkProps = {
  baseUrl: string;
  slug: string;
  copySlug: (slug: string) => void;
  copied: boolean;
};

function OrganizationLink({ slug, copySlug, copied, baseUrl }: OrgLinkProps) {
  const link = getRegistrationLink(baseUrl, slug);

  return (
    <section aria-label="Organization link" className="margin-top-5">
      <label className="usa-label text-bold" htmlFor="org-link">
        Organization link
      </label>
      <p id="org-link-description" className="sr-registration-link-description">
        Patients who register at this link will be visible at{" "}
        <span className="text-bold text-italic">all</span> your facilities.
      </p>
      <div className="sr-organization-link-container">
        <input
          id="org-link"
          className="sr-organization-link-input usa-input"
          aria-describedby="org-link-description"
          value={link}
          disabled
        />
        <button
          className="sr-organization-link-copy-button usa-button"
          onClick={() => copySlug(slug)}
        >
          <FontAwesomeIcon
            className="margin-right-1"
            icon={copied ? faCheck : faCopy}
          />
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </section>
  );
}

type FacilityLinksProps = {
  baseUrl: string;
  slugs: FacilitySlug[];
  copySlug: (slug: string) => void;
  copiedSlug: string | undefined;
};

function FacilityLinks({
  slugs,
  copiedSlug,
  copySlug,
  baseUrl,
}: FacilityLinksProps) {
  const orderedSlugs = useMemo(
    () => [...slugs].sort((a, b) => (a.name > b.name ? 1 : -1)),
    [slugs]
  );

  return (
    <section aria-label="Facility links" className="margin-top-5">
      <p className="usa-label text-bold">Facility links</p>
      <p className="sr-registration-link-description">
        Patients who register at these links will be visible only at the
        specified facility
      </p>
      <table className="usa-table">
        <thead>
          <tr>
            <th scope="col">Facility name</th>
            <th scope="col">Patient self-registration link</th>
          </tr>
        </thead>
        <tbody>
          {orderedSlugs.map(({ name, slug }) => (
            <tr key={slug}>
              <td>{name}</td>
              <td>
                <div className="display-flex flex-justify">
                  <span>{getRegistrationLink(baseUrl, slug, false)}</span>
                  <button
                    className="usa-button margin-left-1 usa-button--unstyled"
                    onClick={() => copySlug(slug)}
                    arial-label={`Copy patient self-registration link for ${name}`}
                  >
                    <FontAwesomeIcon
                      icon={copiedSlug === slug ? faCheck : faCopy}
                    />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function getRegistrationLink(
  baseUrl: string,
  slug: string,
  withProtocol: boolean = true
) {
  const link = makeLink(baseUrl, "register", slug.toUpperCase());
  return withProtocol
    ? link
    : link.replace(/^http(s){0,1}:\/\/(www.){0,1}/, "");
}

function makeLink(...parts: string[]) {
  return parts.map((part) => part.replace(/(^\/|\/$)/, "")).join("/");
}
