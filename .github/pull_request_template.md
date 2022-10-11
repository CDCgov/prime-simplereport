# BACKEND PULL REQUEST

## Related Issue

- Why is this being done? Link to issue, or a few sentences describing why this PR exists

## Changes Proposed

- Detailed explanation of what this PR should do

## Additional Information

- decisions that were made
- notice of future work that needs to be done

## Testing

- How should reviewers verify this PR?

<!---
## Checklist for Primary Reviewer
- [ ] Any large-scale changes have been deployed to `test`, `dev`, or `pentest` and smoke tested
- [ ] Any content updates (user-facing error messages, etc) have been approved by content team
- [ ] Any changes that might generate questions in the support inbox have been flagged to the support team
- [ ] GraphQL schema changes are backward compatible with older version of the front-end
- [ ] Changes comply with the SimpleReport Style Guide
- [ ] Changes with security implications have been approved by a security engineer (changes to  authentication, encryption, handling of PII, etc.)
- [ ] Any dependencies introduced have been vetted and discussed
- [ ] Any changes to the startup configuration have been documented in the README
-->

---

# DATABASE PULL REQUEST

## Related Issue

- Why is this being done? Link to issue, or a few sentences describing why this PR exists

## Changes Proposed

- Detailed explanation of what this PR should do

## Additional Information

- decisions that were made
- notice of future work that needs to be done

## Testing

- How should reviewers verify this PR?
<!---

## Checklist for Primary Reviewer

- [ ] Only database changes are included in this PR
- [ ] Any new tables or columns that do not contain PII are accompanied by a GRANT SELECT to the no-PHI user
- [ ] Any changes to tables that have custom no-PHI views are accompanied by changes to those views (including re-granting permission to the no-PHI user if need be)
- [ ] Each new changeset has a corresponding [tag](https://docs.liquibase.com/change-types/community/tag-database.html)
- [ ] Rollback has been verifed locally and in a deployed environment
- [ ] Any changes to the startup configuration have been documented in the README
      -->

---

# DEVOPS PULL REQUEST

## Related Issue

- Why is this being done? Link to issue, or a few sentences describing why this PR exists

## Changes Proposed

- Detailed explanation of what this PR should do

## Additional Information

- decisions that were made
- notice of future work that needs to be done

## Testing

- How should reviewers verify this PR?

<!---
## Checklist for Primary Reviewer
### Infrastructure
- [ ] Consult the results of the `terraform-plan` job inside the "Terraform Checks" workflow run for this PR. Confirm that there are no unexpected changes!

### Security
- [ ] Changes with security implications have been approved by a security engineer (changes to  authentication, encryption, handling of PII, etc.)
- [ ] Any dependencies introduced have been vetted and discussed

### Cloud
- [ ] Oncall has been notified if this change is going in after-hours
- [ ] If there are changes that cannot be tested locally, this has been deployed to our Azure `test`, `dev`, or `pentest` environment for verification

### Documentation
- [ ] Any changes to the startup configuration have been documented in the README
-->

---

# FRONTEND PULL REQUEST

## Related Issue

- Why is this being done? Link to issue, or a few sentences describing why this PR exists

## Changes Proposed

- Detailed explanation of what this PR should do

## Additional Information

- decisions that were made
- notice of future work that needs to be done

## Testing

- How should reviewers verify this PR?

## Screenshots / Demos

- For large changes, please pair with a designer to ensure changes are as intended

<!---
## Checklist for Author and Reviewer
### Accessibility
- [ ] Any large changes have been run through Deque manual testing
- [ ] All changes have run through the Deque automated testing

### Design
- [ ] Any UI/UX changes have a designer as a reviewer, and changes have been approved
- [ ] Any large-scale changes have been deployed to `test`, `dev`, or `pentest` and smoke-tested by both the engineering and design teams

### Content
- [ ] Any content changes have been approved by content team

### Support
- [ ] Any changes that might generate new support requests have been flagged to the support team
- [ ] Any changes to support infrastructure have been demo'd to support team

### Security
- [ ] Changes with security implications have been approved by a security engineer (changes to  authentication, encryption, handling of PII, etc.)
- [ ] Any dependencies introduced have been vetted and discussed

### Documentation
- [ ] Any changes to the startup configuration have been documented in the README
-->
