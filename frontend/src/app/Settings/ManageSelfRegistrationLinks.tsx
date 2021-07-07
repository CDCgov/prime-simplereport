import { faCheckCircle, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

type Props = {
  isNewFeature: boolean;
  organizationSlug: string;
  facilitySlugs: { name: string; slug: string }[];
  howItWorksLink: string;
};

export const ManageSelfRegistrationLinks = ({
  isNewFeature,
  organizationSlug,
  facilitySlugs,
  howItWorksLink,
}: Props) => {
  const [copiedSlug, setCopiedSlug] = useState<String>();

  useEffect(() => {
    if (!copiedSlug) return;
    setTimeout(() => {
      setCopiedSlug(undefined);
    }, 3000);
  }, [copiedSlug]);

  async function copySlug(slug: string) {
    try {
      await navigator.clipboard.writeText(getRegistrationLink(slug));
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
            <a href={howItWorksLink} target="_blank" rel="noreferrer">
              How patient self-registration works
            </a>
          </p>
          <OrganizationLink
            slug={organizationSlug}
            copySlug={() => {
              copySlug(organizationSlug);
            }}
            copied={copiedSlug === organizationSlug}
          />
        </div>
      </div>
    </div>
  );
};

type OrgLinkProps = {
  slug: string;
  copySlug: () => void;
  copied: boolean;
};

function OrganizationLink({ slug, copySlug, copied }: OrgLinkProps) {
  const link = getRegistrationLink(slug);

  return (
    <section aria-label="Organization link" className="margin-top-5">
      <label className="usa-label text-bold" htmlFor="org-link">
        Organization link
      </label>
      <p id="org-link-description" className="text-base">
        Patients who register at this link will be visible at{" "}
        <span className="text-bold text-italic">all</span> your facilities.
      </p>
      <div className="grid-row flex-no-wrap">
        <input
          style={{ marginTop: 0, height: "auto" }}
          className="usa-input"
          id="org-link"
          aria-describedby="org-link-description"
          value={link}
          disabled
        />
        <button
          style={{
            flexShrink: 0,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
          className="usa-button"
          onClick={copySlug}
        >
          <FontAwesomeIcon
            className="margin-right-1"
            icon={copied ? faCheckCircle : faCopy}
          />
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </section>
  );
}

const baseUrl = process.env.REACT_APP_BASE_URL?.replace(/\/$/, "");

function getRegistrationLink(slug: string) {
  return `${baseUrl}/register/${slug.toUpperCase()}`;
}
