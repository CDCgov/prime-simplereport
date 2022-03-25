## Related Issue

- Why is this being done? Link to issue, or a few sentences describing why this PR exists

## Changes Proposed

- Detailed explanation of what this PR should do

## Additional Information

- decisions that were made
- notice of future work that needs to be done

## Testing

- How should reviewers verify this PR?

## Checklist for Primary Reviewer

- [ ] Only database changes are included in this PR
- [ ] Any new tables or columns that do not contain PII are accompanied by a GRANT SELECT to the no-PHI user
- [ ] Any changes to tables that have custom no-PHI views are accompanied by changes to those views (including re-granting permission to the no-PHI user if need be)
- [ ] Each new changeset has a corresponding [tag](https://docs.liquibase.com/change-types/community/tag-database.html)
- [ ] Rollback has been verifed locally and in a deployed environment