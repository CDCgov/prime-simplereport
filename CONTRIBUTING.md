# Welcome!
Thank you for your interest in contributing to SimpleReport, part of the CDC's PRIME initiative. SimpleReport is an open-source application leveraged by organizations within the United States for collecting and reporting test results for various supported diseases. We're glad you are interested in contributing!
There are many ways to contribute, including writing tutorials or blog posts, improving the documentation, submitting bug reports and feature requests, and writing code for PRIME itself.

Before contributing, we encourage you to also read or [LICENSE](LICENSE.md),
[README](README.md), and
[code-of-conduct](code-of-conduct.md)
files, also found in this repository. If you have any inquiries or questions not
answered by the content of this repository, feel free to [contact us](mailto:prime@cdc.gov).

## Public Domain
This project is in the public domain within the United States, and copyright and
related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
All contributions to this project will be released under the CC0 dedication. By 
submitting a pull request or issue, you are agreeing to comply with this waiver 
of copyright interest and acknowledge that you have no expectation of payment, 
unless pursuant to an existing contract or agreement.

## Bug reports

If you think you have found a bug in SimpleReport, search our [issues list](https://github.com/cdcgov/prime-simplereport/issues) in case a similar issue has already been opened. Duplicate issues will be closed to help keep our backlog neat and tidy.

It is very helpful if you can prepare a reproduction of the bug. In other words, provide a small test case which we can run to confirm your bug. It makes it easier to find the problem and to fix it. 

## Feature requests

If you find yourself wishing for a feature that exists in SimpleReport, you are probably not alone. 

Open an issue on our [issues list](https://github.com/cdcgov/prime-simplereport/issues) which describes the feature you would like to see, why you need it, and how it should work. Please try to be as descriptive as possible. We can't guarantee that we'll be able to develop a requested feature, but we will do our best to give it the care and consideration it deserves.

## Contributing code and documentation changes

If you would like to contribute a new feature or a bug fix, we ask that you follow a few guidelines. We have a dedicated team of engineers and support staff that works on this project on a daily basis, and following these steps is essential to ensuring new pieces are interoperable, with no duplicated effort.

* Before you get started, look for an issue you would like to work on. Please make sure this issue is not currently assigned to someone else. If there is no existing issue for your idea, please open one.
* Once you have selected an issue, please discuss your idea for the fix or implementation in the comments for that issue. It's possible that someone else may have a plan for this that the team has discussed, or that there are particular complexities that you should know about before starting the implementation. There are often several ways to fix a problem, and it is essential to find the right approach before spending time on a PR that cannot be merged.
* Once we've discussed your approach, and everything looks good, we will give you a formal approval to begin development. Please do not start your development work before you get that approval; we don't want you to waste your time on a particular issue if someone is already hard at work on it, or if there's something else in the way!

We use the `good first issue` label to mark the problems we think will be suitable for new contributors.

### Fork and clone the repository

You will need to fork the main code or documentation repository and clone it to your local machine. See
[github help page](https://help.github.com/articles/fork-a-repo) for help. 

Create a branch for your work. 

If a you need to base your work on someone elses branch, talk to the branch owner and work something out.  

### Coding your changes

As you code, please make sure you add proper comments, documentation, and unit tests. SimpleReport adheres to strict quality guidelines, regardless of whether the originating engineer is internal or external. Please also ensure that you thoroughly test your changes on your local machine before submission.


### Submitting your changes

Once your changes and tests are ready to submit for review:

1. **Test your changes**

    Run the full local test suite to make sure that nothing is broken.

2. **Rebase your changes**

    Update your local repository with the most recent code from the principal repository, and rebase your branch on top of the latest master branch. We prefer your initial changes to be squashed into a single commit. Later, if we ask you to make changes, add the changes as separate commits.  This makes the changes easier to review.  

3. **Submit a pull request**

    Push your local changes to your forked copy of the repository and [submit a pull request](https://help.github.com/articles/using-pull-requests). In the pull request, please follow the PR template provided.

    All PRs must have at least two approvals. Please tag several engineers for review; you can see which engineers are most active by checking the repository's commit history. 
    
    Note that squashing at the end of the review process should not be done. Rather, it should be done when the pull request is [integrated
    via GitHub](https://github.com/blog/2141-squash-your-commits). 

### Reviewer Responsibilities
A good code review considers many aspects of the PR
- Will the code work and will it work in the **long-term**?
- Is the code understandable and readable? Is documentation needed? 
- What are the security implications of the PR?
- Does the PR contain sensitive information like secret keys or passwords? Can these be logged? 

Submitters should help reviewers by calling out how these responsibilities are met in comments on the review. 


## Credit
This document is a mashup of CDC's generic contributors, ElasticSearch's contributors, and ReportStream's contributors documents. 
