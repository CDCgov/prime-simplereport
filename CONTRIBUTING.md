# Welcome!
Thank you for your interest in contributing to SimpleReport, part of the CDC's PRIME initiative. SimpleReport is an open-source application that organizations in the United States use to collect and report test results for various supported diseases. There are many ways to contribute, including writing tutorials or blog posts, improving the documentation, submitting bug reports and feature requests, and writing code for PRIME itself.

Before contributing, we encourage you to also read our [LICENSE](LICENSE.md),
[README](README.md), and
[code-of-conduct](code-of-conduct.md)
files, also found in this repository. If you have any questions not
answered in this repository, feel free to [contact us](mailto:prime@cdc.gov).

## Public domain
This project is in the public domain within the United States, and we waive copyright and
related rights in the work worldwide through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
All contributions to this project will be released under the CC0 dedication. By 
submitting a pull request or issue, you are agreeing to comply with this waiver 
of copyright interest and acknowledge that you have no expectation of payment, 
unless pursuant to an existing contract or agreement.

## Bug reports

If you think you found a bug in SimpleReport, search our [issues list](https://github.com/cdcgov/prime-simplereport/issues) in case someone has opened a similar issue. We'll close duplicate issues to help keep our backlog neat and tidy.

It's very helpful if you can prepare a reproduction of the bug. In other words, provide a small test case that we can run to confirm your bug. It makes it easier to find and fix the problem. 

## Feature requests

If you find yourself wishing for a new feature on SimpleReport, you're probably not alone. 

Open an issue on our [issues list](https://github.com/cdcgov/prime-simplereport/issues) that describes the feature you'd like to see, why you want it, and how it should work. Please try to be as descriptive as possible. We can't guarantee that we'll be able to develop a requested feature, but we'll do our best to give it the care and consideration it deserves.

## Contributing code and documentation changes

If you want to contribute a new feature or a bug fix, we ask that you follow a few guidelines. We have a dedicated team of engineers and support staff that works on this project on a daily basis, and following these steps ensures new pieces are interoperable, with no duplicated effort.

* Before you get started, look for an issue you want to work on. Please make sure this issue is not currently assigned to someone else. If there's no existing issue for your idea, please open one. We use the `good first issue` label to mark the problems we think are suitable for new contributors, so that's a good place to start.
* Once you select an issue, please discuss your idea for the fix or implementation in the comments for that issue. It's possible that someone else may have a plan for the issue that the team has discussed, or that there's context you should know before starting implementation. There are often several ways to fix a problem, and it is essential to find the right approach before spending time on a pull request (PR) that can't be merged.
* Once we've discussed your approach and everything looks good, we'll give you formal approval to begin development. Please don't start your development work before you get approval. We don't want you to waste your time on an issue if someone is already hard at work on it, or if there's something else in the way!

### Fork and clone the repository

You need to fork the main code or documentation repository and clone it to your local machine. See
[github help page](https://help.github.com/articles/fork-a-repo) for help. 

Create a branch for your work. 

If you need to base your work on someone else's branch, talk to the branch owner.  

### Coding your changes

As you code, please make sure you add proper comments, documentation, and unit tests. SimpleReport adheres to strict quality guidelines, regardless of whether a contributing engineer is on the team or external. Please also ensure that you thoroughly test your changes on your local machine before submitting.

### Submitting your changes

Once your changes and tests are ready to submit for review:

1. **Test your changes**

    Run the full local test suite to make sure that nothing is broken.

2. **Rebase your changes**

    Update your local repository with the most recent code from the principal repository, and rebase your branch on top of the latest `main` branch. We prefer your initial changes to be squashed into a single commit. Later, if we ask you to make changes, add the changes as separate commits.  This makes the changes easier to review.  

3. **Submit a PR**

    Push your local changes to your forked copy of the repository and [submit a PR](https://help.github.com/articles/using-pull-requests). In the PR, please follow the template provided.

    All PRs must have at least two approvals. Please tag several engineers for review; you can see which engineers are most active by checking the repository's commit history. 
    
    Note that you should not squash your commit at the end of the review process. Instead, you should do it when the pull request is [integrated
    via GitHub](https://github.com/blog/2141-squash-your-commits). 

### Reviewer responsibilities
A good code review considers many aspects of the PR:
- Will the code work, and will it work in the **long term**?
- Is the code understandable and readable? Is documentation needed? 
- What are the security implications of the PR?
- Does the PR contain sensitive information like secret keys or passwords? Can these be logged? 

Submitters should help reviewers by calling out how these considerations are met in comments on the review. 


## Credit
This document is a mashup of contributor documents from the CDC, ElasticSearch, and ReportStream. 
