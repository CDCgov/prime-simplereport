---
name: SimpleReport (New Universal Pipeline Update)
about: Checklist for followups after a state has been added to the universal pipeline
title: "[ UNIVERSAL PIPELINE UPDATE]"
labels: Needs refinement
assignees: ""
---

### Background

The state of {STATE NAME} went live on the universal pipeline on {DD MMM YYYY}.
The UP config list needs to be updated on [simplereport.gov](simplereport.gov) and
an announcement email needs to go out to senders in that state.

### Action requested

Updates are needed in the following areas:

- [ ] Update [the list of UP states](https://github.com/CDCgov/prime-simplereport-site/blob/a745bf8383ae9c0a10dcfa26a48340dd9c905d64/_config.yml#L61) on the static site config. Refer to [this PR](https://github.com/CDCgov/prime-simplereport-site/pull/713) for an example.
- [ ] Generate the list of admin emails senders in that state for product to make an announcement using the `sendOrgAdminEmailCSV` mutation. You can refer to [this doc](https://github.com/cdcent/simplereport_docs/wiki/Support-requests#generating-outreach-email-csvs) for help on how to perform the mutation. Notify product once this list is generated so they can continue with the email campaign.
