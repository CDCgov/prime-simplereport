import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useEffect, useMemo, useState } from "react";
import "./ManageSelfRegistrationLinks.scss";

type FacilitySlug = { name: string; slug: string };

type Props = {
  baseUrl: string;
  organizationSlug: string;
  facilitySlugs: FacilitySlug[];
  howItWorksPath: string;
};

export const ManageSelfRegistrationLinks = ({
  baseUrl,
  organizationSlug,
  facilitySlugs,
  howItWorksPath,
}: Props) => {
  const [copiedSlug, setCopiedSlug] = useState<string>();

  useEffect(() => {
    const timeout = copiedSlug
      ? setTimeout(() => {
          setCopiedSlug(undefined);
        }, 3000)
      : undefined;
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [copiedSlug]);

  async function copySlug(slug: string) {
    try {
      await navigator.clipboard.writeText(getRegistrationLink(baseUrl, slug));
      setCopiedSlug(slug);
    } catch (e: any) {
      console.error(e);
    }
  }

  return (
    <div className="grid-row position-relative">
      <div className="prime-container card-container settings-tab">
        <div className="usa-card__header">
          <h1>Patient self-registration</h1>
        </div>
        <div className="usa-card__body maxw-prose padding-y-3">
          <p>
            Patients can now register themselves online — saving time during the
            testing process and reducing data entry for your staff.
          </p>
          <p>
            <a
              href={makeStaticSiteLink(baseUrl, howItWorksPath)}
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
            icon={copied ? (faCheck as IconProp) : (faCopy as IconProp)}
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
    <section aria-label="Testing facility links" className="margin-top-5">
      <p className="usa-label text-bold">Testing facility links</p>
      <p className="sr-registration-link-description">
        Patients who register at these links will be visible only at the
        specified testing facility.
      </p>
      <table className="usa-table">
        <thead>
          <tr>
            <th scope="col">Testing facility name</th>
            <th scope="col">Patient self-registration link</th>
          </tr>
        </thead>
        <tbody>
          {orderedSlugs.map(({ name, slug }) => (
            <tr key={slug}>
              <td>{name}</td>
              <td>
                <div
                  style={{ position: "relative" }}
                  className="display-flex flex-justify"
                >
                  <span>{getRegistrationLink(baseUrl, slug, false)}</span>
                  <button
                    className="usa-button margin-left-1 usa-button--unstyled"
                    onClick={() => copySlug(slug)}
                    aria-label={
                      "Copy patient self registration link for " + name
                    }
                  >
                    <FontAwesomeIcon
                      icon={
                        copiedSlug === slug
                          ? (faCheck as IconProp)
                          : (faCopy as IconProp)
                      }
                    />
                  </button>
                  {copiedSlug === slug && <CopyTooltip />}
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
  withProtocol = true
) {
  const link = makeLink(baseUrl, "register", slug.toUpperCase());
  return withProtocol
    ? link
    : link.replace(/^http(s){0,1}:\/\/(www.){0,1}/, "");
}

function makeLink(...parts: string[]) {
  return parts.map((part) => part.replace(/(^\/|\/$)/, "")).join("/");
}

function makeStaticSiteLink(baseUrl: string, staticReference: string) {
  return makeLink(baseUrl.replace("/app", ""), staticReference);
}

const TOOLTIP_OFFSET = 7;

const CopyTooltip = () => {
  const [spanRef, setSpanRef] = useState<HTMLSpanElement | null>(null);

  const marginTop = -TOOLTIP_OFFSET;
  const marginRight =
    -1 * (spanRef?.getBoundingClientRect().width || 0) - TOOLTIP_OFFSET;

  return (
    <span
      ref={(node) => {
        setSpanRef(node);
      }}
      className="usa-tooltip__body usa-tooltip__body--right is-set is-visible"
      style={{ right: 0, marginRight, marginTop }}
    >
      Copied!
    </span>
  );
};
