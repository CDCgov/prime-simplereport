# Contributing to the PRIME Data Input Application

## Branch Management

Currently, this project is in an early stage, and a complicated branching
strategy seems unnecessary.

* All new features should be implemented in a feature branch with an
  appropriately descriptive name (with no more specific naming rule for now).
* feature branches should originate from `main` and should be merged back
  into `main` when complete.
* the `sandbox` branch is a special branch intended for sharing work-in-progress
  between team members: it will **not** be merged into `main`, and may be
  hard-reset to `main` whenever the team feels like it has gotten hard to
  work with.

## Merging Pull Requests

All new features should enter `main` through a pull request.

* Pull requests _should_ be approved by at least one other team member before
  being merged.
* Pull requests _must_ pass automatic checks before being merged.
* Pull requests _should_ be merged by the person who created them, under normal
  circumstances.
* The choice of merge commit, squash, or rebase is up to the person performing
  the merge (if we were really committed to the gag this would use the word _may,_
  but it's not that funny).

## Non-production deployments

We currently have two non-production deployments in [cloud.gov](https://cloud.gov):
"demo" and "sandbox". Both of them should be managed using the Actions tab
of this repository.

* the "demo" environment is intended for sharing our work with stakeholders
  and potential partners: it is currently deployed by running the
  [Deploy Client Application](actions?query=workflow%3A"Deploy+Client+Application")
  workflow with `main` as the target branch. There is no automatic deployment of this instance as of this point.
* the "sandbox" enviroment is intended for sharing work in progress for
  feedback: it is deployed by running the
  [Deploy Client Application](actions?query=workflow%3A"Deploy+Client+Application")
  targeting _any other branch_, **or** by pushing code to the `sandbox` branch,
  which is automatically deployed. We do not have any formal structure for how
  we decide what and when to deploy to this environment: please be courteous
  to your teammates and coordinate informally as needed.
