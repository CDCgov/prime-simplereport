# Trusswords react-uswds spike

This directory is a sample project to try to implement a small feature using [@trussworks/react-usds](/trussworks/react-uswds). 
The task is to implement the UI requirements for CDCGov/prime-central#56 using the components in [https://trussworks.github.io/react-uswds].

All of the interesting code is in [src/App.js] except for one style tweak in the header of [public/index.html].

## Findings

* the basic building blocks are mostly very low level: this will save typing boilerplate CSS and HTML, but not much else
* the initial integration instructions were a bit hard to follow
* the provided Modal toolkit assumes that your content fits within the viewport, which required a silly workaround in the short term but would probably require us to just reimplement it for real use.
* it probably wants me to do some additional CSS reset that I'm not doing, but as it stands the typography and related details are not quite right.
