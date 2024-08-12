---
name: SimpleReport (State | Status Update)
about: Checklist for adding/updating a state's status in SimpleReport
title: "[ STATE UPDATE]"
labels: Needs refinement
assignees: ''

---

### Background

The state of {STATE NAME} went live (officially in production) on {DD MMM YYYY}.
The state listing and map displayed on the **[SimpleReport.gov](https://www.simplereport.gov/)** static site need to be
updated to reflect the the changes to {STATE NAME} status from "Coming soon" to "Available." (in production)

### Action requested

Updates are needed in the following areas:

1. Update map on the static site home page
2. Update the “Where does SimpleReport work” page on the static site (removing the state from “coming soon” and moving
   to “live”, or just adding to “coming soon” if the state is brand new.)
3. Updating the internal “Source of Truth” Google Doc
4. Updating the liveJurisdictions list in the GitHub
   repo: https://github.com/CDCgov/prime-simplereport/blob/main/frontend/src/config/constants.ts

### Acceptance Criteria

STATIC SITE | MAP

- The map image (sr-map.svg) appearing on the **[SimpleReport.gov](https://www.simplereport.gov/)** home page should
  display the state of Nevada in the darker blue color to indicate that is is now "Available." (officially in
  production)

STATIC SITE | STATE LISTING

- The "*
  *[Where does SimpleReport work](https://www.simplereport.gov/getting-started/organizations-and-testing-facilities/where-does-simplereport-work/)
  **" page should now include {STATE NAME} in the list of states where SimpleReport is live.

SOURCE OF TRUTH (Internal) | GOOGLE DOC
Update the Google
Doc https://www.simplereport.gov/getting-started/organizations-and-testing-facilities/where-does-simplereport-work/

GITHUB REPO
Update the liveJurisdictions list in the GitHub
repo: https://github.com/CDCgov/prime-simplereport/blob/main/frontend/src/config/constants.ts

**Additional context**
Screenshot of the current map, located at https://www.simplereport.gov/assets/img/sr-map.svg
