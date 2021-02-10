# Contributing to the PRIME Data Input Application

## Branch Management

Currently, this project is in an early stage, and a complicated branching
strategy seems unnecessary.

- All new features should be implemented in a feature branch with an
  appropriately descriptive name (with no more specific naming rule for now).
- feature branches should originate from `main` and should be merged back
  into `main` when complete.

## Merging Pull Requests

All new features should enter `main` through a pull request.

- Pull requests _should_ be approved by at least one other team member before
  being merged.
- Pull requests _must_ pass automatic checks before being merged.
- Pull requests _should_ be merged by the person who created them, under normal
  circumstances.
- The choice of merge commit, squash, or rebase is up to the person performing
  the merge (if we were really committed to the gag this would use the word _may,_
  but it's not that funny).

## Formatting and Styling

**If you are editing a file that requires formatting changes please commit those changes separately
from any changes to the code function!** PR those separately as well so we don't have to
parse through style changes and code changes at the same time. _pew pew_

### Client (Javascript)

We're just defaulting to `prettier` for formatting and styling. Easiest thing to do is enable format
on save to avoid crazy weird formatting changes in pull requests. Inside the frontend some of this
is handled with tests.

### API (Java)

The initial code uses the default code formatting settings from Spring Tool
Suite, because they are there. As we develop opinions on what changes should
be made to those settings, we will add them here.

In addition, we have a small set of checkstyle rules: these  rules are intended
to remain few in number, but by the same token they should not be bypassed
without an extremely compelling reason.