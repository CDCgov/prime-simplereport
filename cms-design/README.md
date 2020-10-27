# CMS Design System spike

This directory is a sample project to try to implement a small feature using the [CMS Design System](/CMSgov/design-system/). 
The task is to implement the UI requirements for CDCGov/prime-central#56 using the components in [https://design.cms.gov/components/].

All of the interesting code is in [src/App.js].

## Findings

* the building blocks are pretty high-level and very well-documented: doing specific things that are not contemplated by the upstream design may require digging in and using some internals, but hopefully not reimplementing things.
* the initial integration instructions were very good.
* the provided Modal toolkit assumes a particular button layout, which is not what is in our designs: this required a silly workaround in the short term but would probably require us to just reimplement it (or change the design) for real use.
