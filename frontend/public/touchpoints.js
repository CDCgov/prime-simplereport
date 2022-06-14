/* eslint-disable no-undef */
/**
 * Script taken from our touchpoints configuration here: https://touchpoints.app.cloud.gov/touchpoints/5b1efe87.js
 */

// Form components are namespaced under 'fba' = 'Feedback Analytics'

function FBAform(d, N) {
  return {
    formId: "5b1efe87",
    css:
      '.fba-modal {\n  background-color: rgb(0, 0, 0, 0.375);\n  z-index: 10001;\n  height: 100%;\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  overflow-x: auto;\n  padding: 20px;\n}\n\n.fba-modal-dialog {\n  background: #fff;\n  border: 1px solid #E5E5E5;\n  margin: 0 auto 40px auto;\n  max-width: 600px;\n  position: relative;\n}\n\n#fba-modal-dialog .wrapper {\n  padding: 20px 20px 0 20px;\n}\n\n.fixed-tab-button {\n  bottom: 0;\n  padding: 5px 10px;\n  position: fixed;\n  right: 12px;\n  z-index: 9999;\n\n}\n#fba-button.usa-button:hover,\n.fixed-tab-button.usa-button:hover {\n  color:white;\n  background-color:#1a4480;\n  border-bottom:0;\n  text-decoration:none;\n}\n\n#fba-modal-title {\n  margin-right: 20px;\n  margin-top: 0;\n  word-wrap: break-word;\n}\n\n#fba-text-name, #fba-text-email {\n  max-width: 100% !important;\n  font-size: 100%\n}\n\n.fba-modal-close {\n  position: absolute;\n  top: 0;\n  right: 0;\n  padding: 10px;\n  font-size: 24px;\n  color: #5b616b;\n  background: none;\n  line-height: 1;\n  text-decoration: none;\n  width: auto;\n  z-index: 10;\n}\n\n/* Form Sections */\n.touchpoints-form-wrapper form div.section {\n  display: none;\n}\n.touchpoints-form-wrapper form div.section.visible {\n  display: block;\n}\n\n.hide {\n  display: none;\n}\n\n/*! uswds v2.1.0 */\n#fba-modal-dialog .usa-list, #fba-modal-dialog .usa-prose > ul,\n#fba-modal-dialog .usa-prose > ol{\n  margin-bottom:1em;\n  margin-top:1em;\n  line-height:1.52155;\n  padding-left:3ch;\n}\n\n#fba-modal-dialog .usa-list:last-child, #fba-modal-dialog .usa-prose > ul:last-child,\n#fba-modal-dialog .usa-prose > ol:last-child{\n  margin-bottom:0;\n}\n\n#fba-modal-dialog .usa-list li, #fba-modal-dialog .usa-prose > ul li,\n#fba-modal-dialog .usa-prose > ol li{\n  margin-bottom:0.25em;\n  max-width:68ex;\n}\n\n#fba-modal-dialog .usa-list li:last-child, #fba-modal-dialog .usa-prose > ul li:last-child,\n#fba-modal-dialog .usa-prose > ol li:last-child{\n  margin-bottom:0;\n}\n\n#fba-modal-dialog .usa-table, #fba-modal-dialog .usa-prose > table{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06471rem;\n  line-height:1.52155;\n  border-spacing:0;\n  margin:1.25rem 0;\n}\n\n#fba-modal-dialog .usa-table thead th, #fba-modal-dialog .usa-prose > table thead th{\n  font-weight:700;\n}\n\n#fba-modal-dialog .usa-table thead th, #fba-modal-dialog .usa-prose > table thead th,\n#fba-modal-dialog .usa-table thead td,\n#fba-modal-dialog .usa-prose > table thead td{\n  background-color:#f0f0f0;\n}\n\n#fba-modal-dialog .usa-table th, #fba-modal-dialog .usa-prose > table th{\n  text-align:left;\n}\n\n#fba-modal-dialog .usa-table th, #fba-modal-dialog .usa-prose > table th,\n#fba-modal-dialog .usa-table td,\n#fba-modal-dialog .usa-prose > table td{\n  border-width:1px;\n  border-color:#565c65;\n  border-style:solid;\n  background-color:white;\n  font-weight:400;\n  padding:0.5rem 1rem;\n}\n\n#fba-modal-dialog .usa-table caption, #fba-modal-dialog .usa-prose > table caption{\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:0.91476rem;\n  font-weight:700;\n  margin-bottom:0.75rem;\n  text-align:left;\n}\n\n#fba-modal-dialog .usa-table--borderless thead th, #fba-modal-dialog .usa-prose > #fba-modal-dialog .usa-table--borderless thead th{\n  background-color:transparent;\n  border-top:0;\n}\n\n#fba-modal-dialog .usa-table--borderless th, #fba-modal-dialog .usa-prose > #fba-modal-dialog .usa-table--borderless th,\n#fba-modal-dialog .usa-table--borderless td,\n#fba-modal-dialog .usa-prose > #fba-modal-dialog .usa-table--borderless td{\n  border-left:0;\n  border-right:0;\n}\n\n#fba-modal-dialog .usa-table--borderless th:first-child{\n  padding-left:0;\n}\n\n/*! normalize.css v3.0.3 | MIT License | github.com/necolas/normalize.css */\n#fba-modal-dialog html{\n  font-family:sans-serif;\n  -ms-text-size-adjust:100%;\n  -webkit-text-size-adjust:100%;\n}\n#fba-modal-dialog  body{\n  margin:0;\n}\n\n#fba-modal-dialog .usa-focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0;\n}\n\n#fba-modal-dialog *,\n#fba-modal-dialog *::before,\n#fba-modal-dialog *::after{\n  -webkit-box-sizing:inherit;\n          box-sizing:inherit;\n}\n\n#fba-modal-dialog {\n  background-color:white;\n  color:#1b1b1b;\n  overflow-x:hidden;\n  -webkit-font-feature-settings:\'kern\' 1;\n          font-feature-settings:\'kern\' 1;\n  -webkit-font-kerning:normal;\n          font-kerning:normal;\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:100%;\n  -webkit-box-sizing:border-box;\n  box-sizing:border-box;\n}\n\n#fba-modal-dialog .usa-sr-only{\n  position:absolute;\n  left:-999em;\n}\n\n#fba-modal-dialog .usa-button{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06471rem;\n  line-height:0.93923;\n  -moz-osx-font-smoothing:grayscale;\n  -webkit-font-smoothing:antialiased;\n  -webkit-appearance:none;\n     -moz-appearance:none;\n          appearance:none;\n  background-color:#005ea2;\n  border:0;\n  border-radius:0.25rem;\n  color:white;\n  cursor:pointer;\n  display:inline-block;\n  font-weight:bold;\n  margin-right:0.5rem;\n  padding:0.75rem 1.25rem;\n  text-align:center;\n  text-decoration:none;\n  width:100%;\n}\n@media all and (min-width: 30em){\n  #fba-modal-dialog .usa-button{\n    width:auto;\n  }\n}\n#fba-modal-dialog .usa-button:visited{\n  color:white;\n}\n\n#fba-modal-dialog .usa-button:hover,\n#fba-modal-dialog .usa-button,\n#fba-modal-dialog .usa-button--hover{\n  background-color:#1a4480;\n  border-bottom:0;\n  color:white;\n  text-decoration:none;\n}\n\n#fba-modal-dialog .usa-button:active, #fba-modal-dialog .usa-button#fba-modal-dialog .usa-button--active{\n  background-color:#162e51;\n  color:white;\n}\n\n#fba-modal-dialog .usa-button:focus, #fba-modal-dialog .usa-button#fba-modal-dialog .usa-focus{\n  outline-offset:0.25rem;\n}\n\n#fba-modal-dialog .usa-button:disabled{\n  -moz-osx-font-smoothing:grayscale;\n  -webkit-font-smoothing:antialiased;\n  background-color:#c9c9c9;\n  color:white;\n  pointer-events:none;\n}\n\n#fba-modal-dialog .usa-button:disabled:hover, #fba-modal-dialog .usa-button:disabled#fba-modal-dialog .usa-button--hover, #fba-modal-dialog .usa-button:disabled:active, #fba-modal-dialog .usa-button:disabled#fba-modal-dialog .usa-button--active, #fba-modal-dialog .usa-button:disabled:focus, #fba-modal-dialog .usa-button:disabled#fba-modal-dialog .usa-focus{\n  background-color:#c9c9c9;\n  border:0;\n  -webkit-box-shadow:none;\n          box-shadow:none;\n}\n\n#fba-modal-dialog .usa-button--accent-cool{\n  -moz-osx-font-smoothing:auto;\n  -webkit-font-smoothing:subpixel-antialiased;\n  background-color:#00bde3;\n  color:#1b1b1b;\n}\n\n#fba-modal-dialog .usa-button--accent-cool:visited{\n  color:#1b1b1b;\n}\n\n#fba-modal-dialog .usa-button--accent-cool:hover, #fba-modal-dialog .usa-button--accent-cool#fba-modal-dialog .usa-button--hover{\n  -moz-osx-font-smoothing:grayscale;\n  -webkit-font-smoothing:antialiased;\n  background-color:#28a0cb;\n  color:white;\n}\n\n#fba-modal-dialog .usa-button--accent-cool:active, #fba-modal-dialog .usa-button--accent-cool#fba-modal-dialog .usa-button--active{\n  -moz-osx-font-smoothing:grayscale;\n  -webkit-font-smoothing:antialiased;\n  background-color:#07648d;\n  color:white;\n}\n\n#fba-modal-dialog .usa-button--outline{\n  -moz-osx-font-smoothing:auto;\n  -webkit-font-smoothing:subpixel-antialiased;\n  background-color:transparent;\n  -webkit-box-shadow:inset 0 0 0 2px #005ea2;\n          box-shadow:inset 0 0 0 2px #005ea2;\n  color:#005ea2;\n}\n\n#fba-modal-dialog .usa-button--outline:visited{\n  color:#005ea2;\n}\n\n#fba-modal-dialog .usa-button--outline:hover, #fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--hover{\n  background-color:transparent;\n  -webkit-box-shadow:inset 0 0 0 2px #1a4480;\n          box-shadow:inset 0 0 0 2px #1a4480;\n  color:#1a4480;\n}\n\n#fba-modal-dialog .usa-button--outline:active, #fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--active{\n  background-color:transparent;\n  -webkit-box-shadow:inset 0 0 0 2px #162e51;\n          box-shadow:inset 0 0 0 2px #162e51;\n  color:#162e51;\n}\n\n#fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--inverse{\n  -webkit-box-shadow:inset 0 0 0 2px #dcdee0;\n          box-shadow:inset 0 0 0 2px #dcdee0;\n  color:#dcdee0;\n}\n\n#fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--inverse:visited{\n  color:#dcdee0;\n}\n\n#fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--inverse:hover, #fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--inverse#fba-modal-dialog .usa-button--hover{\n  -webkit-box-shadow:inset 0 0 0 2px #f0f0f0;\n          box-shadow:inset 0 0 0 2px #f0f0f0;\n  color:#f0f0f0;\n}\n\n#fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--inverse:active, #fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--inverse#fba-modal-dialog .usa-button--active{\n  background-color:transparent;\n  -webkit-box-shadow:inset 0 0 0 2px white;\n          box-shadow:inset 0 0 0 2px white;\n  color:white;\n}\n\n#fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--inverse#fba-modal-dialog .usa-button--unstyled{\n  -moz-osx-font-smoothing:auto;\n  -webkit-font-smoothing:subpixel-antialiased;\n  color:#005ea2;\n  text-decoration:underline;\n  background-color:transparent;\n  border:0;\n  border-radius:0;\n  -webkit-box-shadow:none;\n          box-shadow:none;\n  font-weight:normal;\n  margin:0;\n  padding:0;\n  text-align:left;\n  color:#dcdee0;\n}\n\n#fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--inverse#fba-modal-dialog .usa-button--unstyled:hover{\n  color:#1a4480;\n}\n\n#fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--inverse#fba-modal-dialog .usa-button--unstyled:active{\n  color:#162e51;\n}\n\n#fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--inverse#fba-modal-dialog .usa-button--unstyled:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0;\n}\n\n#fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--inverse#fba-modal-dialog .usa-button--unstyled:visited{\n  color:#562b97;\n}\n\n#fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--inverse#fba-modal-dialog .usa-button--unstyled:hover, #fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--inverse#fba-modal-dialog .usa-button--unstyled:active{\n  -moz-osx-font-smoothing:auto;\n  -webkit-font-smoothing:subpixel-antialiased;\n  background-color:transparent;\n  -webkit-box-shadow:none;\n          box-shadow:none;\n  text-decoration:underline;\n}\n\n#fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--inverse#fba-modal-dialog .usa-button--unstyled:hover, #fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--inverse#fba-modal-dialog .usa-button--unstyled#fba-modal-dialog .usa-button--hover{\n  color:#f0f0f0;\n}\n\n#fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--inverse#fba-modal-dialog .usa-button--unstyled:active, #fba-modal-dialog .usa-button--outline#fba-modal-dialog .usa-button--inverse#fba-modal-dialog .usa-button--unstyled#fba-modal-dialog .usa-button--active{\n  color:white;\n}\n\n#fba-modal-dialog .usa-button--base{\n  background-color:#71767a;\n}\n\n#fba-modal-dialog .usa-button--base:hover, #fba-modal-dialog .usa-button--base#fba-modal-dialog .usa-button--hover{\n  background-color:#565c65;\n}\n\n#fba-modal-dialog .usa-button--base:active, #fba-modal-dialog .usa-button--base#fba-modal-dialog .usa-button--active{\n  background-color:#3d4551;\n}\n\n#fba-modal-dialog .usa-button--secondary{\n  background-color:#d83933;\n}\n\n#fba-modal-dialog .usa-button--secondary:hover, #fba-modal-dialog .usa-button--secondary#fba-modal-dialog .usa-button--hover{\n  background-color:#b50909;\n}\n\n#fba-modal-dialog .usa-button--secondary:active, #fba-modal-dialog .usa-button--secondary#fba-modal-dialog .usa-button--active{\n  background-color:#8b0a03;\n}\n\n#fba-modal-dialog .usa-button--big{\n  border-radius:0.25rem;\n  font-size:1.46397rem;\n  padding:1rem 1.5rem;\n}\n\n#fba-modal-dialog .usa-button--disabled{\n  -moz-osx-font-smoothing:grayscale;\n  -webkit-font-smoothing:antialiased;\n  background-color:#c9c9c9;\n  color:white;\n  pointer-events:none;\n}\n\n#fba-modal-dialog .usa-button--disabled:hover, #fba-modal-dialog .usa-button--disabled#fba-modal-dialog .usa-button--hover, #fba-modal-dialog .usa-button--disabled:active, #fba-modal-dialog .usa-button--disabled#fba-modal-dialog .usa-button--active, #fba-modal-dialog .usa-button--disabled:focus, #fba-modal-dialog .usa-button--disabled#fba-modal-dialog .usa-focus{\n  background-color:#c9c9c9;\n  border:0;\n  -webkit-box-shadow:none;\n          box-shadow:none;\n}\n\n#fba-modal-dialog .usa-button--outline-disabled,\n#fba-modal-dialog .usa-button--outline-inverse-disabled,\n#fba-modal-dialog .usa-button--outline:disabled,\n#fba-modal-dialog .usa-button--outline-inverse:disabled,\n#fba-modal-dialog .usa-button--outline-inverse:disabled{\n  background-color:transparent;\n  pointer-events:none;\n}\n\n#fba-modal-dialog .usa-button--outline-disabled:hover, #fba-modal-dialog .usa-button--outline-disabled#fba-modal-dialog .usa-button--hover, #fba-modal-dialog .usa-button--outline-disabled:active, #fba-modal-dialog .usa-button--outline-disabled#fba-modal-dialog .usa-button--active, #fba-modal-dialog .usa-button--outline-disabled:focus, #fba-modal-dialog .usa-button--outline-disabled#fba-modal-dialog .usa-focus,\n#fba-modal-dialog .usa-button--outline-inverse-disabled:hover,\n#fba-modal-dialog .usa-button--outline-inverse-disabled#fba-modal-dialog .usa-button--hover,\n#fba-modal-dialog .usa-button--outline-inverse-disabled:active,\n#fba-modal-dialog .usa-button--outline-inverse-disabled#fba-modal-dialog .usa-button--active,\n#fba-modal-dialog .usa-button--outline-inverse-disabled:focus,\n#fba-modal-dialog .usa-button--outline-inverse-disabled#fba-modal-dialog .usa-focus,\n#fba-modal-dialog .usa-button--outline:disabled:hover,\n#fba-modal-dialog .usa-button--outline:disabled#fba-modal-dialog .usa-button--hover,\n#fba-modal-dialog .usa-button--outline:disabled:active,\n#fba-modal-dialog .usa-button--outline:disabled#fba-modal-dialog .usa-button--active,\n#fba-modal-dialog .usa-button--outline:disabled:focus,\n#fba-modal-dialog .usa-button--outline:disabled#fba-modal-dialog .usa-focus,\n#fba-modal-dialog .usa-button--outline-inverse:disabled:hover,\n#fba-modal-dialog .usa-button--outline-inverse:disabled#fba-modal-dialog .usa-button--hover,\n#fba-modal-dialog .usa-button--outline-inverse:disabled:active,\n#fba-modal-dialog .usa-button--outline-inverse:disabled#fba-modal-dialog .usa-button--active,\n#fba-modal-dialog .usa-button--outline-inverse:disabled:focus,\n#fba-modal-dialog .usa-button--outline-inverse:disabled#fba-modal-dialog .usa-focus,\n#fba-modal-dialog .usa-button--outline-inverse:disabled:hover,\n#fba-modal-dialog .usa-button--outline-inverse:disabled#fba-modal-dialog .usa-button--hover,\n#fba-modal-dialog .usa-button--outline-inverse:disabled:active,\n#fba-modal-dialog .usa-button--outline-inverse:disabled#fba-modal-dialog .usa-button--active,\n#fba-modal-dialog .usa-button--outline-inverse:disabled:focus,\n#fba-modal-dialog .usa-button--outline-inverse:disabled#fba-modal-dialog .usa-focus{\n  background-color:transparent;\n  border:0;\n}\n\n#fba-modal-dialog .usa-button--outline-disabled,\n#fba-modal-dialog .usa-button--outline:disabled{\n  -webkit-box-shadow:inset 0 0 0 2px #c9c9c9;\n          box-shadow:inset 0 0 0 2px #c9c9c9;\n  color:#c9c9c9;\n}\n\n#fba-modal-dialog .usa-button--outline-disabled#fba-modal-dialog .usa-button--inverse,\n#fba-modal-dialog .usa-button--outline:disabled#fba-modal-dialog .usa-button--inverse{\n  background-color:transparent;\n  -webkit-box-shadow:inset 0 0 0 2px #71767a;\n          box-shadow:inset 0 0 0 2px #71767a;\n  color:#71767a;\n}\n\n#fba-modal-dialog .usa-button--unstyled{\n  -moz-osx-font-smoothing:auto;\n  -webkit-font-smoothing:subpixel-antialiased;\n  color:#005ea2;\n  text-decoration:underline;\n  background-color:transparent;\n  border:0;\n  border-radius:0;\n  -webkit-box-shadow:none;\n          box-shadow:none;\n  font-weight:normal;\n  margin:0;\n  padding:0;\n  text-align:left;\n}\n\n#fba-modal-dialog .usa-button--unstyled:hover{\n  color:#1a4480;\n}\n\n#fba-modal-dialog .usa-button--unstyled:active{\n  color:#162e51;\n}\n\n#fba-modal-dialog .usa-button--unstyled:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0;\n}\n\n#fba-modal-dialog .usa-button--unstyled:visited{\n  color:#562b97;\n}\n\n#fba-modal-dialog .usa-button--unstyled:hover, #fba-modal-dialog .usa-button--unstyled:active{\n  -moz-osx-font-smoothing:auto;\n  -webkit-font-smoothing:subpixel-antialiased;\n  background-color:transparent;\n  -webkit-box-shadow:none;\n          box-shadow:none;\n  text-decoration:underline;\n}\n\n#fba-modal-dialog .usa-embed-container iframe,\n#fba-modal-dialog .usa-embed-container object,\n#fba-modal-dialog .usa-embed-container embed{\n  position:absolute;\n  top:0;\n  left:0;\n  width:100%;\n  height:100%;\n}\n\n#fba-modal-dialog .usa-embed-container{\n  padding-bottom:56.25%;\n  position:relative;\n  height:0;\n  overflow:hidden;\n  max-width:100%;\n}\n\nimg{\n  max-width:100%;\n}\n\n#fba-modal-dialog .usa-media-link{\n  display:inline-block;\n  line-height:0;\n}\n\n#fba-modal-dialog .usa-fieldset,\n#fba-modal-dialog .usa-hint, #fba-modal-dialog .usa-select, #fba-modal-dialog .usa-range, #fba-modal-dialog .usa-input,\n#fba-modal-dialog .usa-textarea{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06471rem;\n  line-height:1.26796;\n}\n\n#fba-modal-dialog .usa-select, #fba-modal-dialog .usa-range, #fba-modal-dialog .usa-input,\n#fba-modal-dialog .usa-textarea{\n  border-width:1px;\n  border-color:#565c65;\n  border-style:solid;\n  -webkit-appearance:none;\n     -moz-appearance:none;\n          appearance:none;\n  border-radius:0;\n  color:#1b1b1b;\n  display:block;\n  height:2.5rem;\n  margin-top:0.5rem;\n \n  padding:0.5rem;\n  width:100%;\n}\n\n#fba-modal-dialog .usa-input--success#fba-modal-dialog .usa-select, #fba-modal-dialog .usa-input--success#fba-modal-dialog .usa-range, #fba-modal-dialog .usa-input--success#fba-modal-dialog .usa-input,\n#fba-modal-dialog .usa-input--success#fba-modal-dialog .usa-textarea{\n  border-width:0.25rem;\n  border-color:#00a91c;\n  border-style:solid;\n}\n\n#fba-modal-dialog .usa-fieldset{\n  border:none;\n  margin:0;\n  padding:0;\n}\n\n#fba-modal-dialog .usa-form-group--error{\n  border-left-width:0.25rem;\n  border-left-color:#b50909;\n  border-left-style:solid;\n  margin-top:2rem;\n  padding-left:1rem;\n  position:relative;\n}\n\n#fba-modal-dialog .usa-label--error{\n  display:block;\n  font-weight:bold;\n  margin-top:0;\n}\n\n#fba-modal-dialog .usa-error-message{\n  padding-bottom:0.25rem;\n  padding-top:0.25rem;\n  color:#b50909;\n  display:block;\n  font-weight:bold;\n}\n\n#fba-modal-dialog .usa-hint{\n  color:#71767a;\n}\n\n#fba-modal-dialog .usa-label--required{\n  color:#b50909;\n}\n\n#fba-modal-dialog .usa-label{\n  display:block;\n  line-height:1.12707;\n  margin-top:1.5rem;\n ;\n}\n\n#fba-modal-dialog .usa-legend{\n  font-size:2.12941rem;\n  font-weight:bold;\n}\n\n#fba-modal-dialog .usa-input-list{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n}\n\n#fba-modal-dialog .usa-input-list li{\n  line-height:1.26796;\n}\n\n#fba-modal-dialog .usa-prose #fba-modal-dialog .usa-input-list{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n}\n\n#fba-modal-dialog .usa-prose #fba-modal-dialog .usa-input-list li{\n  line-height:1.26796;\n}\n\n#fba-modal-dialog .usa-checkbox__input,\n#fba-modal-dialog .usa-radio__input{\n  position:absolute;\n  left:-999em;\n}\n\n.lt-ie9 #fba-modal-dialog .usa-checkbox__input, .lt-ie9\n#fba-modal-dialog .usa-radio__input{\n  border:0;\n  float:left;\n  margin:0.25rem 0.25rem 0 0;\n  position:static;\n  width:auto;\n}\n\n#fba-modal-dialog .usa-checkbox__label,\n#fba-modal-dialog .usa-radio__label{\n  cursor:pointer;\n  display:inherit;\n  font-weight:normal;\n  margin-bottom:0.75rem;\n  padding-left:2rem;\n  position:relative;\n  text-indent:-2rem;\n}\n\n#fba-modal-dialog .usa-checkbox__label::before,\n#fba-modal-dialog .usa-radio__label::before{\n  background:white;\n  content:\'\\a0\';\n  display:inline-block;\n  left:2px;\n  position:relative;\n  vertical-align:middle\\0;\n}\n\n#fba-modal-dialog .usa-checkbox__label::before{\n  height:1.25rem;\n  width:1.25rem;\n  border-radius:2px;\n}\n\n#fba-modal-dialog .usa-radio__label::before{\n  height:1.25rem;\n  border-radius:99rem;\n  width:1.25rem;\n}\n\n#fba-modal-dialog .usa-checkbox__label::before,\n#fba-modal-dialog .usa-radio__label::before{\n  box-shadow:0 0 0 2px #71767a;\n  line-height:1.25rem;\n  margin-right:0.75rem;\n}\n\n#fba-modal-dialog .usa-checkbox__input:checked + #fba-modal-dialog .usa-checkbox__label::before,\n#fba-modal-dialog .usa-radio__input:checked + #fba-modal-dialog .usa-radio__label::before{\n  background-color:#005ea2;\n  box-shadow:0 0 0 2px #005ea2;\n}\n\n#fba-modal-dialog .usa-radio__input:checked + #fba-modal-dialog .usa-radio__label::before{\n  box-shadow:0 0 0 2px #005ea2, inset 0 0 0 2px white;\n}\n\n#fba-modal-dialog .usa-checkbox__input:checked + #fba-modal-dialog .usa-checkbox__label::before,\n#fba-modal-dialog .usa-checkbox__input:checked:disabled + #fba-modal-dialog .usa-checkbox__label::before{\n  background-image:url(https://touchpoints.app.cloud.gov/assets/correct8-e2e0bf3b64bc9239c770fba3feebd2b4f5915c81e56be835992daab7cd1fdbde.svg), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  background-position:center center;\n  background-size:0.75rem auto;\n}\n\n#fba-modal-dialog .usa-radio__input:focus + #fba-modal-dialog .usa-radio__label::before{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0.25rem;\n}\n\n#fba-modal-dialog .usa-checkbox__input:disabled + #fba-modal-dialog .usa-checkbox__label{\n  color:#c9c9c9;\n}\n\n#fba-modal-dialog .usa-checkbox__input:focus + #fba-modal-dialog .usa-checkbox__label::before{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0;\n}\n\n#fba-modal-dialog .usa-checkbox__input:disabled + #fba-modal-dialog .usa-checkbox__label::before,\n#fba-modal-dialog .usa-radio__input:disabled + #fba-modal-dialog .usa-radio__label::before{\n  background:#e6e6e6;\n  box-shadow:0 0 0 2px #c9c9c9;\n  cursor:not-allowed;\n}\n\n#fba-modal-dialog .usa-memorable-date{\n  display:flex;\n}\n\n#fba-modal-dialog .usa-memorable-date [type=number]{\n  -moz-appearance:textfield;\n}\n\n#fba-modal-dialog .usa-memorable-date [type=number]::-webkit-inner-spin-button{\n  -webkit-appearance:none;\n          appearance:none;\n}\n\n#fba-modal-dialog .usa-memorable-date [type=number]::-webkit-contacts-auto-fill-button{\n  visibility:hidden;\n  display:none !important;\n  pointer-events:none;\n  height:0;\n  width:0;\n  margin:0;\n}\n\n#fba-modal-dialog .usa-form-group--day,\n#fba-modal-dialog .usa-form-group--month,\n#fba-modal-dialog .usa-form-group--year{\n  flex:0 1 auto;\n  margin-right:1rem;\n  width:3rem;\n}\n\n#fba-modal-dialog .usa-form-group--year{\n  width:4.5rem;\n}\n\n#fba-modal-dialog .usa-select{\n  background-image:url(https://touchpoints.app.cloud.gov/assets/arrow-both-a8fd329a6bf944dafa96ed7061ef3d31d1473920bcdfe1ea7907ddea6559e16f.svg), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  -webkit-appearance:none;\n     -moz-appearance:none;\n          appearance:none;\n  background-color:white;\n  background-position:right 0.75rem center;\n  background-size:0.5rem;\n  padding-right:2rem;\n}\n\n#fba-modal-dialog .usa-select::-ms-expand{\n  display:none;\n}\n\n#fba-modal-dialog .usa-select:-webkit-autofill{\n  -webkit-appearance:menulist;\n          appearance:menulist;\n}\n\n#fba-modal-dialog .usa-select:-moz-focusring{\n  color:transparent;\n  text-shadow:0 0 0 black;\n}\n\n[type=file]{\n  border:none;\n  margin-top:0.5rem;\n  padding-left:0;\n  padding-top:0.2rem;\n}\n\n/* Not using .usa-file-input */\n\n#fba-modal-dialog .usa-range{\n  -webkit-appearance:none;\n     -moz-appearance:none;\n          appearance:none;\n  border:none;\n  padding-left:1px;\n  width:100%;\n}\n\n#fba-modal-dialog .usa-range:focus{\n  outline:none;\n}\n\n#fba-modal-dialog .usa-range:focus::-webkit-slider-thumb{\n  background-color:white;\n  box-shadow:0 0 0 2px #2491ff;\n}\n\n#fba-modal-dialog .usa-range:focus::-moz-range-thumb{\n  background-color:white;\n  box-shadow:0 0 0 2px #2491ff;\n}\n\n#fba-modal-dialog .usa-range:focus::-ms-thumb{\n  background-color:white;\n  box-shadow:0 0 0 2px #2491ff;\n}\n\n#fba-modal-dialog .usa-range::-webkit-slider-runnable-track{\n  background-color:#f0f0f0;\n  border-radius:99rem;\n  border:1px solid #71767a;\n  cursor:pointer;\n  height:1rem;\n  width:100%;\n}\n\n#fba-modal-dialog .usa-range::-moz-range-track{\n  background-color:#f0f0f0;\n  border-radius:99rem;\n  border:1px solid #71767a;\n  cursor:pointer;\n  height:1rem;\n  width:100%;\n}\n\n#fba-modal-dialog .usa-range::-ms-track{\n  background-color:#f0f0f0;\n  border-radius:99rem;\n  border:1px solid #71767a;\n  cursor:pointer;\n  height:1rem;\n  width:100%;\n}\n\n#fba-modal-dialog .usa-range::-webkit-slider-thumb{\n  height:1.25rem;\n  border-radius:99rem;\n  width:1.25rem;\n  background:#f0f0f0;\n  border:none;\n  box-shadow:0 0 0 2px #71767a;\n  cursor:pointer;\n  -webkit-appearance:none;\n          appearance:none;\n  margin-top:-0.1875rem;\n}\n\n#fba-modal-dialog .usa-range::-moz-range-thumb{\n  height:1.25rem;\n  border-radius:99rem;\n  width:1.25rem;\n  background:#f0f0f0;\n  border:none;\n  box-shadow:0 0 0 2px #71767a;\n  cursor:pointer;\n}\n\n#fba-modal-dialog .usa-range::-ms-thumb{\n  height:1.25rem;\n  border-radius:99rem;\n  width:1.25rem;\n  background:#f0f0f0;\n  border:none;\n  box-shadow:0 0 0 2px #71767a;\n  cursor:pointer;\n}\n\n#fba-modal-dialog .usa-range::-ms-fill-lower{\n  background-color:#f0f0f0;\n  border-radius:99rem;\n  border:1px solid #71767a;\n}\n\n#fba-modal-dialog .usa-range::-ms-fill-upper{\n  background-color:#f0f0f0;\n  border-radius:99rem;\n  border:1px solid #71767a;\n}\n\n#fba-modal-dialog .usa-textarea{\n  height:10rem;\n}\n\n#fba-modal-dialog .usa-input--error{\n  border-width:0.25rem;\n  border-color:#b50909;\n  border-style:solid;\n}\n\n#fba-modal-dialog .usa-character-count__message{\n  display:inline-block;\n  padding-top:0.25rem;\n}\n\n#fba-modal-dialog .usa-character-count__message--invalid{\n  color:#b50909;\n  font-weight:bold;\n}\n\n/* Not using .usa-combo-box */\n\n/* Not using .usa-date-picker__wrapper */\n\n#fba-modal-dialog .grid-container{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n#fba-modal-dialog .grid-container-card{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:10rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n#fba-modal-dialog .grid-container-card-lg{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:15rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n#fba-modal-dialog .grid-container-mobile{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:20rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n#fba-modal-dialog .grid-container-mobile-lg{\n  margin-left:auto;\n  margin-right:auto;\n;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n#fba-modal-dialog .grid-container-tablet{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:40rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n#fba-modal-dialog .grid-container-tablet-lg{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:55rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n#fba-modal-dialog .grid-container-desktop{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n#fba-modal-dialog .grid-container-desktop-lg{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:75rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n#fba-modal-dialog .grid-container-widescreen{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:87.5rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n#fba-modal-dialog .grid-row{\n  display:flex;\n  flex-wrap:wrap;\n}\n\n#fba-modal-dialog .grid-row.grid-gap{\n  margin-left:-0.5rem;\n  margin-right:-0.5rem;\n}\n#fba-modal-dialog .grid-row.grid-gap > *{\n  padding-left:0.5rem;\n  padding-right:0.5rem;\n}\n\n#fba-modal-dialog .grid-row.grid-gap-0{\n  margin-left:0;\n  margin-right:0;\n}\n#fba-modal-dialog .grid-row.grid-gap-0 > *{\n  padding-left:0;\n  padding-right:0;\n}\n\n#fba-modal-dialog .grid-row.grid-gap-2px{\n  margin-left:-1px;\n  margin-right:-1px;\n}\n\n#fba-modal-dialog .grid-row.grid-gap-2px > *{\n  padding-left:1px;\n  padding-right:1px;\n}\n\n#fba-modal-dialog .grid-row.grid-gap-05{\n  margin-left:-2px;\n  margin-right:-2px;\n}\n#fba-modal-dialog .grid-row.grid-gap-05 > *{\n  padding-left:2px;\n  padding-right:2px;\n}\n#fba-modal-dialog .grid-row.grid-gap-1{\n  margin-left:-0.25rem;\n  margin-right:-0.25rem;\n}\n#fba-modal-dialog .grid-row.grid-gap-1 > *{\n  padding-left:0.25rem;\n  padding-right:0.25rem;\n}\n#fba-modal-dialog .grid-row.grid-gap-2{\n  margin-left:-0.5rem;\n  margin-right:-0.5rem;\n}\n#fba-modal-dialog .grid-row.grid-gap-2 > *{\n  padding-left:0.5rem;\n  padding-right:0.5rem;\n}\n#fba-modal-dialog .grid-row.grid-gap-3{\n  margin-left:-0.75rem;\n  margin-right:-0.75rem;\n}\n#fba-modal-dialog .grid-row.grid-gap-3 > *{\n  padding-left:0.75rem;\n  padding-right:0.75rem;\n}\n#fba-modal-dialog .grid-row.grid-gap-4{\n  margin-left:-1rem;\n  margin-right:-1rem;\n}\n#fba-modal-dialog .grid-row.grid-gap-4 > *{\n  padding-left:1rem;\n  padding-right:1rem;\n}\n#fba-modal-dialog .grid-row.grid-gap-5{\n  margin-left:-1.25rem;\n  margin-right:-1.25rem;\n}\n#fba-modal-dialog .grid-row.grid-gap-5 > *{\n  padding-left:1.25rem;\n  padding-right:1.25rem;\n}\n#fba-modal-dialog .grid-row.grid-gap-6{\n  margin-left:-1.5rem;\n  margin-right:-1.5rem;\n}\n#fba-modal-dialog .grid-row.grid-gap-6 > *{\n  padding-left:1.5rem;\n  padding-right:1.5rem;\n}\n#fba-modal-dialog .grid-row.grid-gap-sm{\n  margin-left:-1px;\n  margin-right:-1px;\n}\n#fba-modal-dialog .grid-row.grid-gap-sm > *{\n  padding-left:1px;\n  padding-right:1px;\n}\n#fba-modal-dialog .grid-row.grid-gap-md{\n  margin-left:-0.5rem;\n  margin-right:-0.5rem;\n}\n#fba-modal-dialog .grid-row.grid-gap-md > *{\n  padding-left:0.5rem;\n  padding-right:0.5rem;\n}\n#fba-modal-dialog .grid-row.grid-gap-lg{\n  margin-left:-0.75rem;\n  margin-right:-0.75rem;\n}\n#fba-modal-dialog .grid-row.grid-gap-lg > *{\n  padding-left:0.75rem;\n  padding-right:0.75rem;\n}\n\n#fba-modal-dialog [class*=grid-col]{\n  position:relative;\n  width:100%;\n  box-sizing:border-box;\n}\n\n#fba-modal-dialog .grid-col{\n  flex:1 1 0%;\n  width:auto;\n  max-width:100%;\n  min-width:1px;\n  max-width:100%;\n}\n\n#fba-modal-dialog .grid-col-auto{\n  flex:0 1 auto;\n  width:auto;\n  max-width:100%;\n}\n\n#fba-modal-dialog .grid-col-fill{\n  flex:1 1 0%;\n  width:auto;\n  max-width:100%;\n  min-width:1px;\n}\n\n#fba-modal-dialog .grid-col-1{\n  flex:0 1 auto;\n  width:8.3333333333%;\n}\n\n#fba-modal-dialog .grid-col-2{\n  flex:0 1 auto;\n  width:16.6666666667%;\n}\n\n#fba-modal-dialog .grid-col-3{\n  flex:0 1 auto;\n  width:25%;\n}\n\n#fba-modal-dialog .grid-col-4{\n  flex:0 1 auto;\n  width:33.3333333333%;\n}\n\n#fba-modal-dialog .grid-col-5{\n  flex:0 1 auto;\n  width:41.6666666667%;\n}\n\n#fba-modal-dialog .grid-col-6{\n  flex:0 1 auto;\n  width:50%;\n}\n\n#fba-modal-dialog .grid-col-7{\n  flex:0 1 auto;\n  width:58.3333333333%;\n}\n\n#fba-modal-dialog .grid-col-8{\n  flex:0 1 auto;\n  width:66.6666666667%;\n}\n\n#fba-modal-dialog .grid-col-9{\n  flex:0 1 auto;\n  width:75%;\n}\n\n#fba-modal-dialog .grid-col-10{\n  flex:0 1 auto;\n  width:83.3333333333%;\n}\n\n#fba-modal-dialog .grid-col-11{\n  flex:0 1 auto;\n  width:91.6666666667%;\n}\n\n#fba-modal-dialog .grid-col-12{\n  flex:0 1 auto;\n  width:100%;\n}\n\n#fba-modal-dialog .grid-offset-1{\n  margin-left:8.3333333333%;\n}\n\n#fba-modal-dialog .grid-offset-2{\n  margin-left:16.6666666667%;\n}\n\n#fba-modal-dialog .grid-offset-3{\n  margin-left:25%;\n}\n\n#fba-modal-dialog .grid-offset-4{\n  margin-left:33.33333%;\n}\n\n#fba-modal-dialog .grid-offset-5{\n  margin-left:41.6666666667%;\n}\n\n#fba-modal-dialog .grid-offset-6{\n  margin-left:50%;\n}\n\n#fba-modal-dialog .grid-offset-7{\n  margin-left:58.3333333333%;\n}\n\n#fba-modal-dialog .grid-offset-8{\n  margin-left:66.6666666667%;\n}\n\n#fba-modal-dialog .grid-offset-9{\n  margin-left:75%;\n}\n\n#fba-modal-dialog .grid-offset-10{\n  margin-left:83.3333333333%;\n}\n\n#fba-modal-dialog .grid-offset-11{\n  margin-left:91.6666666667%;\n}\n\n#fba-modal-dialog .grid-offset-12{\n  margin-left:100%;\n}\n\n#fba-modal-dialog .grid-offset-none{\n  margin-left:0;\n}\n\n#fba-modal-dialog .usa-tag{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:0.93rem;\n  color:white;\n  text-transform:uppercase;\n  background-color:#565c65;\n  border-radius:2px;\n  margin-right:0.25rem;\n  padding:1px 0.5rem;\n}\n\n#fba-modal-dialog .usa-tag:only-of-type{\n  margin-right:0;\n}\n\n#fba-modal-dialog .usa-tag--big{\n  padding-left:0.5rem;\n  padding-right:0.5rem;\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n}\n\n#fba-modal-dialog .usa-paragraph{\n  line-height:1.5;\n  margin-bottom:0;\n  margin-top:0;\n  max-width:68ex;\n}\n\n* + #fba-modal-dialog .usa-paragraph{\n  margin-top:1em;\n}\n\n#fba-modal-dialog .usa-paragraph + *{\n  margin-top:1em;\n}\n\n#fba-modal-dialog .usa-content p,\n#fba-modal-dialog .usa-content ul:not(#fba-modal-dialog .usa-accordion):not(#fba-modal-dialog .usa-accordion--bordered),\n#fba-modal-dialog .usa-content ol:not(#fba-modal-dialog .usa-accordion):not(#fba-modal-dialog .usa-accordion--bordered){\n  max-width:68ex;\n}\n\n#fba-modal-dialog .usa-display{\n  margin-bottom:0;\n  margin-top:0;\n  clear:both;\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:2.44rem;\n  line-height:1.2;\n  font-weight:bold;\n}\n\n* + #fba-modal-dialog .usa-display{\n  margin-top:1.5em;\n}\n\n#fba-modal-dialog .usa-display + *{\n  margin-top:1em;\n}\n@media all and (min-width: 30em){\n  #fba-modal-dialog .usa-display{\n    margin-bottom:0;\n    margin-top:0;\n    clear:both;\n    font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n    font-size:2.44rem;\n    line-height:1.2;\n    font-weight:bold;\n  }\n  #fba-modal-dialog + .usa-display{\n    margin-top:1.5em;\n  }\n  #fba-modal-dialog .usa-display + *{\n    margin-top:1em;\n  }\n}\n@media all and (min-width: 40em){\n  #fba-modal-dialog .usa-display{\n    margin-bottom:0;\n    margin-top:0;\n    clear:both;\n    font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n    font-size:2.93rem;\n    line-height:1.2;\n    font-weight:bold;\n  }\n  #fba-modal-dialog + .usa-display{\n    margin-top:1.5em;\n  }\n  #fba-modal-dialog .usa-display + *{\n    margin-top:1em;\n  }\n}\n\n#fba-modal-dialog .usa-intro{\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:1.34rem;\n  line-height:1.8;\n  font-weight:400;\n  max-width:88ex;\n}\n\n#fba-modal-dialog .usa-dark-background{\n  -moz-osx-font-smoothing:grayscale;\n  -webkit-font-smoothing:antialiased;\n  background-color:#3d4551;\n}\n\n#fba-modal-dialog .usa-dark-background p,\n#fba-modal-dialog .usa-dark-background span{\n  color:white;\n}\n\n#fba-modal-dialog .usa-dark-background a{\n  color:#dfe1e2;\n}\n\n#fba-modal-dialog .usa-dark-background a:hover{\n  color:white;\n}\n\n#fba-modal-dialog .usa-prose > p{\n  line-height:1.5;\n  margin-bottom:0;\n  margin-top:0;\n  max-width:68ex;\n}\n\n#fba-modal-dialog .usa-prose > * + p{\n  margin-top:1em;\n}\n\n#fba-modal-dialog .usa-prose > p + *{\n  margin-top:1em;\n}\n\n#fba-modal-dialog .usa-prose > h1,\n#fba-modal-dialog .usa-prose > h2,\n#fba-modal-dialog .usa-prose > h3,\n#fba-modal-dialog .usa-prose > h4,\n#fba-modal-dialog .usa-prose > h5,\n#fba-modal-dialog .usa-prose > h6{\n  margin-bottom:0;\n  margin-top:0;\n  clear:both;\n}\n\n#fba-modal-dialog .usa-prose > * + h1,\n#fba-modal-dialog .usa-prose > * + h2,\n#fba-modal-dialog .usa-prose > * + h3,\n#fba-modal-dialog .usa-prose > * + h4,\n#fba-modal-dialog .usa-prose > * + h5,\n#fba-modal-dialog .usa-prose > * + h6{\n  margin-top:1.5em;\n}\n\n#fba-modal-dialog .usa-prose > h1 + *, #fba-modal-dialog .usa-prose > h2 + *, #fba-modal-dialog .usa-prose > h3 + *, #fba-modal-dialog .usa-prose > h4 + *, #fba-modal-dialog .usa-prose > h5 + *, #fba-modal-dialog .usa-prose > h6 + *{\n  margin-top:1em;\n}\n\n#fba-modal-dialog .usa-link{\n  color:#005ea2;\n  text-decoration:underline;\n}\n\n#fba-modal-dialog .usa-link:hover{\n  color:#1a4480;\n}\n\n#fba-modal-dialog .usa-link:active{\n  color:#162e51;\n}\n\n#fba-modal-dialog .usa-link:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0;\n}\n\n#fba-modal-dialog .usa-link:visited{\n  color:#562b97;\n}\n\n#fba-modal-dialog .usa-link--external::after{\n  background:url(https://touchpoints.app.cloud.gov/assets/external-link-030a08e6f2b781af6338485bcab0e2304ae761f67e4b5fc3888cee664b23b391.svg) no-repeat 0 0;\n  background-size:100%;\n  content:\'\';\n  display:inline-block;\n  height:0.65em;\n  margin-bottom:-1px;\n  margin-left:0.25rem;\n  width:0.65em;\n}\n\n#fba-modal-dialog .usa-link--external:hover::after{\n  background-image:url(https://touchpoints.app.cloud.gov/assets/external-link-hover-f36071e9c3851b3f71ca88e7c445794b50602761a9e7f1ea6eccc38866f4c5ca.svg), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n}\n\n#fba-modal-dialog .usa-link--external#fba-modal-dialog .usa-link--alt::after{\n  background-image:url(https://touchpoints.app.cloud.gov/assets/external-link-alt-3788100689755d4b80964a7f671a833a4dd93cc23c7e1f111300ee760b49ffff.svg);\n  background-position:50% 60%;\n  background-repeat:no-repeat;\n  background-size:100%;\n  content:"";\n  display:inline;\n  margin-left:0.25rem;\n  padding-left:0.65em;\n}\n\n#fba-modal-dialog .usa-link--external#fba-modal-dialog .usa-link--alt:hover::after{\n  background-image:url(https://touchpoints.app.cloud.gov/assets/external-link-alt-hover-7686575e35a1329dcf4fa2ef3bfd1ded866fac20373f88962ef18073cfabfc22.svg), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n}\n\n#fba-modal-dialog .usa-list--unstyled{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n}\n\n#fba-modal-dialog .usa-list--unstyled > li{\n  margin-bottom:0;\n  max-width:unset;\n}\n\n#fba-modal-dialog .usa-prose #fba-modal-dialog .usa-list--unstyled{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n}\n\n#fba-modal-dialog .usa-prose #fba-modal-dialog .usa-list--unstyled > li{\n  margin-bottom:0;\n  max-width:unset;\n}\n\n#fba-modal-dialog .usa-prose{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n}\n\n#fba-modal-dialog .usa-prose > a{\n  color:#005ea2;\n  text-decoration:underline;\n}\n\n#fba-modal-dialog .usa-prose > a:hover{\n  color:#1a4480;\n}\n\n#fba-modal-dialog .usa-prose > a:active{\n  color:#162e51;\n}\n\n#fba-modal-dialog .usa-prose > a:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0;\n}\n\n#fba-modal-dialog .usa-prose > a:visited{\n  color:#562b97;\n}\n\n#fba-modal-dialog .usa-prose > h1{\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:2.44rem;\n  line-height:1.2;\n  font-weight:bold;\n}\n\n#fba-modal-dialog .usa-prose > h2{\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:1.95rem;\n  line-height:1.2;\n  font-weight:bold;\n}\n\n#fba-modal-dialog .usa-prose > h3{\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:1.34rem;\n  line-height:1.2;\n  font-weight:bold;\n}\n\n#fba-modal-dialog .usa-prose > h4{\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:0.98rem;\n  line-height:1.2;\n  font-weight:bold;\n}\n\n#fba-modal-dialog .usa-prose > h5{\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:0.91rem;\n  line-height:1.2;\n  font-weight:bold;\n}\n\n#fba-modal-dialog .usa-prose > h6{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:0.87rem;\n  line-height:1.1;\n  font-weight:normal;\n  letter-spacing:0.025em;\n  text-transform:uppercase;\n}\n\n#fba-modal-dialog .usa-accordion{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n  color:#1b1b1b;\n  margin:0;\n  padding:0;\n  width:100%;\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n}\n\n#fba-modal-dialog .usa-accordion > li{\n  margin-bottom:0;\n  max-width:unset;\n}\n\n#fba-modal-dialog .usa-accordion > ul li ul{\n  list-style:disc;\n}\n\n#fba-modal-dialog .usa-accordion > ul li ul > li > ul{\n  list-style:circle;\n}\n\n#fba-modal-dialog .usa-accordion > ul li ul > li > ul > li > ul{\n  list-style:square;\n}\n\n#fba-modal-dialog .usa-accordion + #fba-modal-dialog .usa-accordion,\n#fba-modal-dialog .usa-accordion + #fba-modal-dialog .usa-accordion--bordered{\n  margin-top:0.5rem;\n}\n\n#fba-modal-dialog .usa-accordion--bordered #fba-modal-dialog .usa-accordion__content{\n  border-bottom:0.25rem solid #f0f0f0;\n  border-left:0.25rem solid #f0f0f0;\n  border-right:0.25rem solid #f0f0f0;\n  padding-bottom:1rem;\n}\n\n#fba-modal-dialog .usa-accordion--bordered #fba-modal-dialog .usa-accordion__heading{\n  margin-bottom:0;\n}\n\n#fba-modal-dialog .usa-accordion__heading,\n#fba-modal-dialog .usa-prose #fba-modal-dialog .usa-accordion__heading{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:0.9;\n  margin:0;\n}\n\n#fba-modal-dialog .usa-accordion__heading:not(:first-child),\n#fba-modal-dialog .usa-prose #fba-modal-dialog .usa-accordion__heading:not(:first-child){\n  margin-top:0.5rem;\n}\n\n#fba-modal-dialog .usa-accordion__content{\n  background-color:white;\n  margin-top:0;\n  overflow:auto;\n  padding:1rem 1.25rem calc(1rem - 0.25rem) 1.25rem;\n}\n\n#fba-modal-dialog .usa-accordion__content > *:first-child{\n  margin-top:0;\n}\n\n#fba-modal-dialog .usa-accordion__content > *:last-child{\n  margin-bottom:0;\n}\n\n#fba-modal-dialog .usa-accordion__button{\n  -moz-osx-font-smoothing:auto;\n  -webkit-font-smoothing:subpixel-antialiased;\n  color:#005ea2;\n  text-decoration:underline;\n  background-color:transparent;\n  border:0;\n  border-radius:0;\n  box-shadow:none;\n  font-weight:normal;\n  margin:0;\n  padding:0;\n  text-align:left;\n  background-image:url(https://touchpoints.app.cloud.gov/assets/minus-46fd7dd4affd557199e2e7ab71e938aca534a561df7d4a6d67ac5327b050ee76.svg), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  background-color:#f0f0f0;\n  background-position:right 1.25rem center;\n  background-size:1rem;\n  color:#1b1b1b;\n  cursor:pointer;\n  display:inline-block;\n  font-weight:bold;\n  margin:0;\n  padding:1rem 3.5rem 1rem 1.25rem;\n  text-decoration:none;\n  width:100%;\n}\n\n#fba-modal-dialog .usa-accordion__button:hover{\n  color:#1a4480;\n}\n\n#fba-modal-dialog .usa-accordion__button:active{\n  color:#162e51;\n}\n\n#fba-modal-dialog .usa-accordion__button:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0;\n}\n\n#fba-modal-dialog .usa-accordion__button:visited{\n  color:#562b97;\n}\n\n#fba-modal-dialog .usa-accordion__button:hover, #fba-modal-dialog .usa-accordion__button:active{\n  -moz-osx-font-smoothing:auto;\n  -webkit-font-smoothing:subpixel-antialiased;\n  background-color:transparent;\n  box-shadow:none;\n  text-decoration:underline;\n}\n\n#fba-modal-dialog .usa-accordion__button:hover{\n  background-color:#dcdee0;\n  color:#1b1b1b;\n  text-decoration:none;\n}\n\n#fba-modal-dialog .usa-accordion__button[aria-expanded=false]{\n  background-image:url(https://touchpoints.app.cloud.gov/assets/plus-16ce3e015c923621ad54046f4b9ea70e40573c29d65ec7bc7e4cbdd0e113e87f.svg), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  background-size:1rem;\n}\n\n#fba-modal-dialog .usa-alert{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n  background-color:#f0f0f0;\n  background-position:1.75rem 1.25rem;\n  background-repeat:no-repeat;\n  background-size:2rem;\n  padding-bottom:1rem;\n  padding-left:1.75rem;\n  padding-right:1.25rem;\n  padding-top:1.25rem;\n  position:relative;\n}\n\n* + #fba-modal-dialog .usa-alert{\n  margin-top:1rem;\n}\n\n#fba-modal-dialog .usa-alert::before{\n  background-color:#a9aeb1;\n  content:"";\n  height:100%;\n  left:0;\n  position:absolute;\n  top:0;\n  width:0.5rem;\n}\n\n#fba-modal-dialog .usa-alert ul{\n  margin-bottom:0;\n  margin-top:0.5rem;\n  padding-left:0.5rem;\n}\n\n#fba-modal-dialog .usa-alert #fba-modal-dialog .usa-checklist{\n  padding-left:0;\n}\n\n#fba-modal-dialog .usa-alert__icon{\n  display:table-cell;\n  padding-right:0.5rem;\n}\n\n#fba-modal-dialog .usa-alert__body{\n  display:table-cell;\n  vertical-align:top;\n}\n\n#fba-modal-dialog .usa-alert__heading{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.46rem;\n  line-height:1.1;\n  margin-top:0;\n  margin-bottom:0.5rem;\n}\n\n#fba-modal-dialog .usa-alert__text{\n  margin-bottom:0;\n  margin-top:0;\n}\n\n#fba-modal-dialog .usa-alert__text a{\n  color:#005ea2;\n  text-decoration:underline;\n}\n\n#fba-modal-dialog .usa-alert__text a:hover{\n  color:#1a4480;\n}\n\n#fba-modal-dialog .usa-alert__text a:active{\n  color:#162e51;\n}\n\n#fba-modal-dialog .usa-alert__text a:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0;\n}\n\n#fba-modal-dialog .usa-alert__text a:visited{\n  color:#562b97;\n}\n\n#fba-modal-dialog .usa-alert__text:only-child{\n  margin-bottom:0.5rem;\n  padding-top:0.25rem;\n}\n\n#fba-modal-dialog .usa-alert--success{\n  background-image:url(https://touchpoints.app.cloud.gov/assets/alerts/success-979c6bd4ae6775f7fbf2304141b171496711160b0fe703ef8c47074551387495.svg), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  background-color:#ecf3ec;\n}\n\n#fba-modal-dialog .usa-alert--success::before{\n  background-color:#00a91c;\n}\n\n#fba-modal-dialog .usa-alert--success .usa-alert__body{\n  padding-left:3.25rem;\n}\n\n#fba-modal-dialog .usa-alert--warning{\n  background-image:url(https://touchpoints.app.cloud.gov/assets/alerts/warning-6a4a8ccd3fa5b176d30f6d355927121793c2ae89a9c803ceee32f51c8b69e8e7.svg), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  background-color:#faf3d1;\n}\n\n#fba-modal-dialog .usa-alert--warning::before{\n  background-color:#ffbe2e;\n}\n\n#fba-modal-dialog .usa-alert--warning .usa-alert__body{\n  padding-left:3.25rem;\n}\n\n#fba-modal-dialog .usa-alert--error{\n  background-image:url(https://touchpoints.app.cloud.gov/assets/alerts/error-5d3c79da1c99ac79ed05a9c8588c925f7895ec07e5cbb2417133473552693339.svg), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  background-color:#f4e3db;\n}\n\n#fba-modal-dialog .usa-alert--error::before{\n  background-color:#d54309;\n}\n\n#fba-modal-dialog .usa-alert--error .usa-alert__body{\n  padding-left:3.25rem;\n}\n\n#fba-modal-dialog .usa-alert--info{\n  background-image:url(https://touchpoints.app.cloud.gov/assets/alerts/info-09ce8e274b07c65e2b351a04d909d4d94bbd221e1868481f65d1d79cd687aa18.svg), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  background-color:#e7f6f8;\n}\n\n#fba-modal-dialog .usa-alert--info::before{\n  background-color:#00bde3;\n}\n\n#fba-modal-dialog .usa-alert--info .usa-alert__body{\n  padding-left:3.25rem;\n}\n\n/* not used .usa-alert--slim */\n\n#fba-modal-dialog .usa-alert--no-icon{\n  background-image:none;\n}\n\n#fba-modal-dialog .usa-alert--no-icon #fba-modal-dialog .usa-alert__body{\n  padding-left:0;\n}\n\n#fba-modal-dialog .usa-alert--validation{\n  background-size:1.5rem;\n}\n\n#fba-modal-dialog .usa-alert--validation #fba-modal-dialog .usa-alert__body{\n  padding-left:2.5rem;\n}\n\n#fba-modal-dialog .usa-alert--validation #fba-modal-dialog .usa-checklist{\n  margin-top:1rem;\n}\n\n#fba-modal-dialog .usa-banner{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n  background-color:#f0f0f0;\n}\n\n#fba-modal-dialog .usa-banner .usa-accordion{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n}\n\n#fba-modal-dialog .usa-banner__header,\n#fba-modal-dialog .usa-banner__content{\n  color:#1b1b1b;\n}\n\n#fba-modal-dialog .usa-banner__content{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n  padding-left:1rem;\n  padding-right:1rem;\n  background-color:transparent;\n  font-size:1rem;\n  overflow:hidden;\n  padding-bottom:1rem;\n  padding-left:0.5rem;\n  padding-top:0.25rem;\n  width:100%;\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-banner__content{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-banner__content{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n@media all and (min-width: 40em){\n  #fba-modal-dialog .usa-banner__content{\n    padding-bottom:1.5rem;\n    padding-top:1.5rem;\n  }\n}\n\n#fba-modal-dialog .usa-banner__content p:first-child{\n  margin:0;\n}\n\n#fba-modal-dialog .usa-banner__guidance{\n  display:flex;\n  align-items:flex-start;\n  max-width:64ex;\n  padding-top:1rem;\n}\n\n#fba-modal-dialog .usa-banner__lock-image{\n  height:1.5ex;\n  width:1.21875ex;\n}\n#fba-modal-dialog .usa-banner__lock-image path{\n  fill:currentColor;\n}\n\n#fba-modal-dialog .usa-banner__inner{\n  padding-left:1rem;\n  padding-right:1rem;\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n  display:flex;\n  flex-wrap:wrap;\n  align-items:flex-start;\n  padding-right:0;\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-banner__inner{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n@media all and (min-width: 40em){\n  #fba-modal-dialog .usa-banner__inner{\n    align-items:center;\n  }\n}\n\n#fba-modal-dialog .usa-banner__header{\n  padding-bottom:0.5rem;\n  padding-top:0.5rem;\n  font-size:0.8rem;\n  font-weight:normal;\n  min-height:3rem;\n  position:relative;\n}\n\n#fba-modal-dialog .usa-banner__header-text{\n  margin-bottom:0;\n  margin-top:0;\n  font-size:0.8rem;\n  line-height:1.1;\n}\n\n#fba-modal-dialog .usa-banner__header-action{\n  color:#005ea2;\n  line-height:1.1;\n  margin-bottom:0;\n  margin-top:2px;\n  text-decoration:underline;\n}\n\n#fba-modal-dialog .usa-banner__header-action::after{\n  background:url(https://touchpoints.app.cloud.gov/assets/chevron-fc381655ed6ef23a32b6bb870d4333ec99ca57f9bce1fcd175f5e290cee74eab.svg) no-repeat center/1.3128205128ex 0.8ex;\n  display:inline-block;\n  height:0.8ex;\n  width:1.3128205128ex;\n  content:"";\n  vertical-align:middle;\n  margin-left:2px;\n}\n\n#fba-modal-dialog .usa-banner__header-action::after{\n  background:none;\n  background-color:#005ea2;\n  -webkit-mask:url(https://touchpoints.app.cloud.gov/assets/chevron-fc381655ed6ef23a32b6bb870d4333ec99ca57f9bce1fcd175f5e290cee74eab.svg) no-repeat center/1.3128205128ex 0.8ex;\n          mask:url(https://touchpoints.app.cloud.gov/assets/chevron-fc381655ed6ef23a32b6bb870d4333ec99ca57f9bce1fcd175f5e290cee74eab.svg) no-repeat center/1.3128205128ex 0.8ex;\n}\n#fba-modal-dialog .usa-banner__header-action::after:hover{\n  background-color:#0b4778;\n}\n#fba-modal-dialog .usa-banner__header-action:hover::after{\n  content:"";\n  background-color:#0b4778;\n}\n#fba-modal-dialog .usa-banner__header-action:visited{\n  color:#54278f;\n}\n#fba-modal-dialog .usa-banner__header-action:hover,\n#fba-modal-dialog .usa-banner__header-action:active{\n  color:#0b4778;\n}\n#fba-modal-dialog .usa-banner__header--expanded,\n#fba-modal-dialog .usa-banner__header-action{\n  display:none;\n}\n\n#fba-modal-dialog .usa-banner__header-flag{\n  float:left;\n  margin-right:0.5rem;\n  width:1rem;\n}\n\n#fba-modal-dialog .usa-banner__header--expanded{\n  padding-right:3.5rem;\n}\n\n#fba-modal-dialog .usa-banner__header--expanded .usa-banner__inner{\n  margin-left:0;\n}\n@media all and (min-width: 40em){\n  #fba-modal-dialog .usa-banner__header--expanded .usa-banner__inner{\n    margin-left:auto;\n  }\n}\n#fba-modal-dialog .usa-banner__header--expanded .usa-banner__header-action{\n  display:none;\n}\n\n\n#fba-modal-dialog .usa-banner__button{\n  -moz-osx-font-smoothing:auto;\n  -webkit-font-smoothing:subpixel-antialiased;\n  color:#005ea2;\n  text-decoration:underline;\n  background-color:transparent;\n  border:0;\n  border-radius:0;\n  box-shadow:none;\n  font-weight:normal;\n  margin:0;\n  padding:0;\n  text-align:left;\n  position:absolute;\n  left:0;\n  position:absolute;\n  bottom:0;\n  top:0;\n  color:#005ea2;\n  text-decoration:underline;\n  vertical-align:baseline;\n  color:#005ea2;\n  display:block;\n  font-size:0.8rem;\n  height:auto;\n  line-height:1.1;\n  padding-top:0;\n  padding-left:0;\n  text-decoration:none;\n  width:auto;\n}\n\n#fba-modal-dialog .usa-banner__button:hover{\n  color:#1a4480;\n}\n\n#fba-modal-dialog .usa-banner__button:active{\n  color:#162e51;\n}\n\n#fba-modal-dialog .usa-banner__button:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0;\n}\n\n#fba-modal-dialog .usa-banner__button:visited{\n  color:#54278f;\n}\n\n#fba-modal-dialog .usa-banner__button:hover,\n#fba-modal-dialog .usa-banner__button:active{\n  -moz-osx-font-smoothing:auto;\n  -webkit-font-smoothing:subpixel-antialiased;\n  background-color:transparent;\n  box-shadow:none;\n  text-decoration:underline;\n}\n\n#fba-modal-dialog .usa-banner__button:visited{\n  color:#54278f;\n}\n#fba-modal-dialog .usa-banner__button:hover,\n#fba-modal-dialog .usa-banner__button:active{\n  color:#0b4778;\n}\n@media all and (max-width: 39.99em){\n  #fba-modal-dialog .usa-banner__button{\n    width:100%;\n  }\n}\n\n#fba-modal-dialog .usa-banner__button[aria-expanded=false]{\n  background-image:none;\n}\n\n#fba-modal-dialog .usa-banner__button[aria-expanded=true]{\n  background-image:none;\n}\n\n#fba-modal-dialog .usa-banner__button[aria-expanded=true]::after{\n  position:absolute;\n  right:1rem;\n  top:0.75rem;\n}\n\n#fba-modal-dialog .usa-banner__button-text{\n  position:absolute;\n  left:-999em;\n  text-decoration:underline;\n}\n\n#fba-modal-dialog .usa-banner__icon{\n  width:2.5rem;\n}\n\n/* .usa-breadcrumb not used */\n\n/* .usa-button-group not used */\n\n/* .usa-card not used */\n\n#fba-modal-dialog .usa-checklist{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n}\n\n#fba-modal-dialog .usa-checklist__item{\n  text-indent:-2.5rem;\n  margin-bottom:0;\n  margin-top:0;\n  margin-bottom:0;\n  margin-top:0.5rem;\n}\n\n#fba-modal-dialog .usa-checklist__item::before{\n  content:" ";\n  display:inline-block;\n  height:1rem;\n  margin-left:-0.25rem;\n  margin-right:0.75rem;\n  width:2rem;\n}\n\n#fba-modal-dialog .usa-checklist__item#fba-modal-dialog .usa-checklist__item--checked::before{\n  background-image:url(https://touchpoints.app.cloud.gov/assets/correct9-11e565fa7361acc9897cd9132d67d1aec4014f7d9b38de1e91541e7a55449a9f.svg), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  background-position:center;\n  background-size:1.25rem;\n}\n\n#fba-modal-dialog .usa-footer{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n  overflow:hidden;\n}\n\n#fba-modal-dialog .usa-footer > .grid-container{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-footer > .grid-container{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n\n#fba-modal-dialog .usa-footer__return-to-top{\n  padding-bottom:1.25rem;\n  padding-top:1.25rem;\n  line-height:0.9;\n}\n\n#fba-modal-dialog .usa-footer__return-to-top a{\n  color:#005ea2;\n  text-decoration:underline;\n}\n\n#fba-modal-dialog .usa-footer__return-to-top a:hover{\n  color:#1a4480;\n}\n\n#fba-modal-dialog .usa-footer__return-to-top a:active{\n  color:#162e51;\n}\n\n#fba-modal-dialog .usa-footer__return-to-top a:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0;\n}\n\n#fba-modal-dialog .usa-footer__return-to-top a:visited{\n  color:#54278f;\n}\n\n#fba-modal-dialog .usa-footer__nav{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n  padding-left:0;\n  padding-right:0;\n  border-bottom:1px solid #a9aeb1;\n}\n\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-footer__nav{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n@media all and (min-width: 30em){\n  #fba-modal-dialog .usa-footer__nav{\n    padding-left:1rem;\n    padding-right:1rem;\n    border-bottom:none;\n  }\n}\n@media all and (min-width: 30em) and (min-width: 64em){\n  #fba-modal-dialog .usa-footer__nav{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n\n#fba-modal-dialog .usa-footer__nav > ul{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n}\n\n#fba-modal-dialog .usa-footer__primary-section{\n  background-color:#f0f0f0;\n}\n\n#fba-modal-dialog .usa-footer__primary-section > .grid-container{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-footer__primary-section > .grid-container{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n\n#fba-modal-dialog .usa-footer__primary-container{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-footer__primary-container{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-footer__primary-container{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n\n#fba-modal-dialog .usa-footer__primary-content{\n  line-height:1.1;\n}\n\n#fba-modal-dialog .usa-footer__primary-link a,\n#fba-modal-dialog .usa-footer__secondary-link a{\n  text-decoration:none;\n}\n\n#fba-modal-dialog .usa-footer__primary-link a:hover,\n#fba-modal-dialog .usa-footer__secondary-link a:hover{\n  text-decoration:underline;\n}\n\n#fba-modal-dialog .usa-footer__primary-link{\n  padding-left:1rem;\n  padding-right:1rem;\n  padding-bottom:1rem;\n  padding-top:1rem;\n  color:#1b1b1b;\n  text-decoration:none;\n  font-weight:bold;\n  display:block;\n}\n@media all and (min-width: 30em){\n  #fba-modal-dialog .usa-footer__primary-link{\n    padding-left:0;\n    padding-right:0;\n  }\n}\n#fba-modal-dialog .usa-footer__primary-link:hover{\n  cursor:pointer;\n  text-decoration:underline;\n}\n\n#fba-modal-dialog .usa-footer__secondary-link{\n  line-height:1.1;\n  margin-left:1rem;\n  padding:0;\n}\n\n#fba-modal-dialog .usa-footer__secondary-link a{\n  color:#005ea2;\n  text-decoration:underline;\n}\n\n#fba-modal-dialog .usa-footer__secondary-link a:hover{\n  color:#1a4480;\n}\n\n#fba-modal-dialog .usa-footer__secondary-link a:active{\n  color:#162e51;\n}\n\n#fba-modal-dialog .usa-footer__secondary-link a:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0;\n}\n\n#fba-modal-dialog .usa-footer__secondary-link a:visited{\n  color:#54278f;\n}\n\n#fba-modal-dialog .usa-footer__secondary-link + .usa-footer__secondary-link{\n  padding-top:1rem;\n}\n@media all and (min-width: 30em){\n  #fba-modal-dialog .usa-footer__secondary-link{\n    margin-left:0;\n  }\n}\n\n#fba-modal-dialog .usa-footer__contact-info{\n  line-height:1.1;\n}\n#fba-modal-dialog .usa-footer__contact-info a{\n  color:#1b1b1b;\n  text-decoration:none;\n}\n#fba-modal-dialog .usa-footer__contact-info:hover{\n  text-decoration:underline;\n}\n@media all and (min-width: 30em){\n  #fba-modal-dialog .usa-footer__contact-info{\n    justify-content:flex-end;\n    margin-top:0.5rem;\n  }\n}\n\n#fba-modal-dialog .usa-footer__primary-content{\n  border-top:1px solid #a9aeb1;\n}\n\n@media all and (min-width: 30em){\n  #fba-modal-dialog .usa-footer__primary-content{\n    border:none;\n  }\n}\n\n#fba-modal-dialog .usa-sign-up{\n  padding-bottom:2rem;\n  padding-top:1.5rem;\n}\n#fba-modal-dialog .usa-sign-up .usa-label,\n#fba-modal-dialog .usa-sign-up .usa-button{\n  margin-top:0.75rem;\n}\n\n#fba-modal-dialog .usa-sign-up__heading{\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:1.34rem;\n  line-height:1.2;\n  font-weight:bold;\n  margin:0;\n}\n\n#fba-modal-dialog .usa-footer__secondary-section{\n  padding-bottom:1.25rem;\n  padding-top:1.25rem;\n  background-color:#dfe1e2;\n}\n#fba-modal-dialog .usa-footer__secondary-section > .grid-container{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-footer__secondary-section > .grid-container{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n\n#fba-modal-dialog .usa-footer__secondary-section a{\n  color:#1b1b1b;\n}\n\n#fba-modal-dialog .usa-footer__logo{\n  margin-bottom:0.5rem;\n  margin-top:0.5rem;\n}\n@media all and (min-width: 30em){\n  #fba-modal-dialog .usa-footer__logo{\n    margin-bottom:0;\n    margin-top:0;\n    align-items:center;\n  }\n}\n\n#fba-modal-dialog .usa-footer__logo-img{\n  max-width:5rem;\n}\n\n#fba-modal-dialog .usa-footer__logo-heading{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.46rem;\n  line-height:0.9;\n  margin-bottom:0.5rem;\n  margin-top:0.5rem;\n}\n\n#fba-modal-dialog .usa-footer__contact-links{\n  margin-top:1.5rem;\n}\n@media all and (min-width: 30em){\n  #fba-modal-dialog .usa-footer__contact-links{\n    margin-top:0;\n    text-align:right;\n  }\n}\n\n#fba-modal-dialog .usa-footer__contact-heading{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.46rem;\n  line-height:1.1;\n  margin-top:0;\n}\n@media all and (min-width: 30em){\n  #fba-modal-dialog .usa-footer__contact-heading{\n    margin-bottom:0.25rem;\n    margin-top:0.25rem;\n  }\n}\n\n/* not using .usa-social-link */\n\n@media all and (min-width: 30em){\n  #fba-modal-dialog .usa-footer__address{\n    justify-content:flex-end;\n  }\n}\n\n/* not using .usa-footer--big */\n\n#fba-modal-dialog .usa-form{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.3;\n}\n\n@media all and (min-width: 30em){\n  #fba-modal-dialog .usa-form{\n    max-width:20rem;\n  }\n}\n\n#fba-modal-dialog .usa-form .usa-input,\n#fba-modal-dialog .usa-form .usa-range,\n#fba-modal-dialog .usa-form .usa-select,\n#fba-modal-dialog .usa-form .usa-textarea{\n  max-width:none;\n}\n\n#fba-modal-dialog .usa-form .usa-input--small{\n  max-width:4rem;\n}\n\n#fba-modal-dialog .usa-form .usa-input--medium{\n  max-width:7.5rem;\n}\n\n#fba-modal-dialog .usa-form .usa-button{\n  margin-top:0.5rem;\n}\n@media all and (min-width: 30em){\n  #fba-modal-dialog .usa-form .usa-button{\n    margin-top:1.5rem;\n  }\n}\n\n#fba-modal-dialog .usa-form a{\n  color:#005ea2;\n  text-decoration:underline;\n}\n\n#fba-modal-dialog .usa-form a:hover{\n  color:#1a4480;\n}\n\n#fba-modal-dialog .usa-form a:active{\n  color:#162e51;\n}\n\n#fba-modal-dialog .usa-form a:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0;\n}\n\n#fba-modal-dialog .usa-form a:visited{\n  color:#54278f;\n}\n\n#fba-modal-dialog .usa-form__note{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:0.93rem;\n  line-height:1.3;\n  float:right;\n  margin:0.25rem 0 1rem;\n}\n\n#fba-modal-dialog .usa-graphic-list{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n}\n\n#fba-modal-dialog .usa-graphic-list .usa-graphic-list__row .usa-media-block{\n  margin-bottom:2rem;\n}\n@media all and (min-width: 40em){\n  #fba-modal-dialog .usa-graphic-list .usa-graphic-list__row .usa-media-block{\n    margin-bottom:4rem;\n  }\n}\n@media all and (min-width: 40em){\n  #fba-modal-dialog .usa-graphic-list .usa-graphic-list__row:last-child .usa-media-block{\n    margin-bottom:0;\n  }\n}\n\n#fba-modal-dialog .usa-graphic-list .usa-graphic-list__row:last-child .usa-media-block:last-child{\n  margin-bottom:0;\n}\n#fba-modal-dialog .usa-graphic-list .usa-media-block__img{\n  margin-right:1.5rem;\n}\n#fba-modal-dialog .usa-graphic-list .usa-media-block__body > :first-child{\n  margin-top:0;\n}\n\n#fba-modal-dialog .usa-graphic-list__heading{\n  margin-bottom:0;\n  margin-top:0;\n  clear:both;\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:1.34rem;\n  line-height:1.2;\n  font-weight:bold;\n}\n\n* + #fba-modal-dialog .usa-graphic-list__heading{\n  margin-top:1.5em;\n}\n\n#fba-modal-dialog .usa-graphic-list__heading + *{\n  margin-top:1em;\n}\n\n#fba-modal-dialog .usa-header{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n  z-index:300;\n}\n\n#fba-modal-dialog .usa-header::after{\n  clear:both;\n  content:"";\n  display:block;\n}\n\n#fba-modal-dialog .usa-header a{\n  border-bottom:none;\n}\n\n#fba-modal-dialog .usa-header [type=search]{\n  min-width:0;\n}\n\n#fba-modal-dialog .usa-logo a{\n  color:#1b1b1b;\n  text-decoration:none;\n}\n\n#fba-modal-dialog .usa-logo__text{\n  display:block;\n  font-style:normal;\n  font-weight:bold;\n  margin:0;\n}\n\n#fba-modal-dialog .usa-menu-btn{\n  -moz-osx-font-smoothing:auto;\n  -webkit-font-smoothing:subpixel-antialiased;\n  color:#005ea2;\n  text-decoration:underline;\n  background-color:transparent;\n  border:0;\n  border-radius:0;\n  box-shadow:none;\n  font-weight:normal;\n  margin:0;\n  padding:0;\n  text-align:left;\n  flex:0 1 auto;\n  padding-left:0.75rem;\n  padding-right:0.75rem;\n  background-color:#005ea2;\n  color:white;\n  font-size:0.87rem;\n  height:3rem;\n  text-align:center;\n  text-decoration:none;\n  text-transform:uppercase;\n}\n\n#fba-modal-dialog .usa-menu-btn:hover{\n  color:#1a4480;\n}\n\n#fba-modal-dialog .usa-menu-btn:active{\n  color:#162e51;\n}\n\n#fba-modal-dialog .usa-menu-btn:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0;\n}\n\n#fba-modal-dialog .usa-menu-btn:visited{\n  color:#54278f;\n}\n\n#fba-modal-dialog .usa-menu-btn:hover,\n#fba-modal-dialog .usa-menu-btn:active{\n  -moz-osx-font-smoothing:auto;\n  -webkit-font-smoothing:subpixel-antialiased;\n  background-color:transparent;\n  box-shadow:none;\n  text-decoration:underline;\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-menu-btn{\n    display:none;\n  }\n}\n\n#fba-modal-dialog .usa-menu-btn:hover{\n  background-color:#1a4480;\n  color:white;\n  text-decoration:none;\n}\n\n#fba-modal-dialog .usa-menu-btn:active{\n  color:white;\n}\n\n#fba-modal-dialog .usa-menu-btn:visited{\n  color:white;\n}\n\n#fba-modal-dialog .usa-overlay{\n  position:absolute;\n  bottom:0;\n  left:0;\n  right:0;\n  top:0;\n  position:fixed;\n  background:black;\n  opacity:0;\n  transition:opacity 0.2s ease-in-out;\n  visibility:hidden;\n  z-index:400;\n}\n\n#fba-modal-dialog .usa-overlay.is-visible{\n  opacity:0.2;\n  visibility:visible;\n}\n\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-header--basic .usa-navbar{\n    position:relative;\n    width:33%;\n  }\n  #fba-modal-dialog .usa-header--basic .usa-nav{\n    flex-direction:row;\n    align-items:center;\n    justify-content:flex-end;\n    display:flex;\n    padding:0 0 0.25rem 0.5rem;\n    width:100%;\n  }\n  /* not using usa-nav__primary */\n  #fba-modal-dialog .usa-header--basic .usa-nav__link[aria-expanded=true]::after,\n.usa-header--basic .usa-nav__link[aria-expanded=true]:hover::after{\n    display:none;\n  }\n  #fba-modal-dialog .usa-header--basic .usa-search{\n    top:0;\n  }\n}\n#fba-modal-dialog .usa-header--basic.usa-header--megamenu .usa-nav__inner{\n  display:flex;\n  flex-direction:column;\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-header--basic.usa-header--megamenu .usa-nav__inner{\n    display:block;\n    float:right;\n    margin-top:-2.5rem;\n  }\n}\n\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-header--extended{\n    padding-top:0;\n  }\n  #fba-modal-dialog .usa-header--extended .usa-nav__link[aria-expanded=true]::after,\n.usa-header--extended .usa-nav__link[aria-expanded=true]:hover::after{\n    display:none;\n  }\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-header--extended .usa-logo{\n    font-size:2.13rem;\n    margin:2rem 0 1.5rem;\n    max-width:50%;\n  }\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-header--extended .usa-navbar{\n    margin-left:auto;\n    margin-right:auto;\n    max-width:64rem;\n    padding-left:1rem;\n    padding-right:1rem;\n    display:block;\n    height:auto;\n    overflow:auto;\n  }\n}\n@media all and (min-width: 64em) and (min-width: 64em){\n  #fba-modal-dialog .usa-header--extended .usa-navbar{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-header--extended .usa-nav{\n    border-top:1px solid #dfe1e2;\n    padding:0;\n    width:100%;\n  }\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-header--extended .usa-nav__inner{\n    margin-left:auto;\n    margin-right:auto;\n    max-width:64rem;\n    padding-left:1rem;\n    padding-right:1rem;\n    position:relative;\n  }\n}\n@media all and (min-width: 64em) and (min-width: 64em){\n  #fba-modal-dialog .usa-header--extended .usa-nav__inner{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-header--extended .usa-nav__link{\n    padding-bottom:1rem;\n    padding-top:1rem;\n  }\n}\n\n/* not using .usa-hero */\n\n#fba-modal-dialog .usa-layout-docs__sidenav{\n  order:2;\n  padding-top:2rem;\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-layout-docs__sidenav{\n    padding-top:0;\n  }\n}\n\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-layout-docs__main{\n    order:2;\n  }\n}\n#fba-modal-dialog .usa-media-block{\n  align-items:flex-start;\n  display:flex;\n}\n#fba-modal-dialog .usa-media-block__img{\n  float:left;\n  margin-right:0.5rem;\n}\n\n#fba-modal-dialog .usa-media-block__body{\n  flex:1 1 0%;\n}\n\n/* not using .usa-megamenu */\n/* not using .usa-nav-container */\n\n#fba-modal-dialog .usa-navbar{\n  height:3rem;\n}\n@media all and (max-width: 63.99em){\n  #fba-modal-dialog .usa-navbar{\n    align-items:center;\n    border-bottom:1px solid #dfe1e2;\n    display:flex;\n  }\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-navbar{\n    border-bottom:none;\n    display:inline-block;\n    height:auto;\n  }\n}\n\n#fba-modal-dialog .usa-nav{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:0.9;\n}\n\n#fba-modal-dialog .usa-nav__secondary{\n  margin-top:1rem;\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-nav__secondary{\n    bottom:4rem;\n    font-size:0.93rem;\n    margin-top:0.5rem;\n    min-width:calc( 27ch + 3rem );\n    position:absolute;\n    right:2rem;\n  }\n}\n\n#fba-modal-dialog .usa-nav__secondary .usa-search{\n  margin-top:1rem;\n  width:100%;\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-nav__secondary .usa-search{\n    margin-left:0;\n    margin-top:0.5rem;\n  }\n}\n\n#fba-modal-dialog .usa-nav__secondary-links{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n  line-height:1.3;\n  margin-top:1.5rem;\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-nav__secondary-links{\n    float:right;\n    line-height:0.9;\n    margin-bottom:0.25rem;\n    margin-top:0;\n  }\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-nav__secondary-links .usa-nav__secondary-item{\n    display:inline;\n    padding-left:0.25rem;\n  }\n  #fba-modal-dialog .usa-nav__secondary-links .usa-nav__secondary-item + .usa-nav__secondary-item::before{\n    color:#dfe1e2;\n    content:"|";\n    padding-right:0.25rem;\n  }\n}\n\n#fba-modal-dialog .usa-nav__secondary-links a{\n  color:#71767a;\n  display:inline-block;\n  font-size:0.93rem;\n  text-decoration:none;\n}\n\n#fba-modal-dialog .usa-nav__secondary-links a:hover{\n  color:#005ea2;\n  text-decoration:underline;\n}\n\n/* not using .usa-nav__submenu */\n\n#fba-modal-dialog .usa-nav__close{\n  -moz-osx-font-smoothing:auto;\n  -webkit-font-smoothing:subpixel-antialiased;\n  color:#005ea2;\n  text-decoration:underline;\n  background-color:transparent;\n  border:0;\n  border-radius:0;\n  box-shadow:none;\n  font-weight:normal;\n  margin:0;\n  padding:0;\n  text-align:left;\n  height:3rem;\n  width:3rem;\n  color:currentColor;\n  flex:none;\n  float:right;\n  margin:-0.75rem -1rem 1rem auto;\n  text-align:center;\n}\n\n#fba-modal-dialog .usa-nav__close:hover{\n  color:#1a4480;\n}\n\n#fba-modal-dialog .usa-nav__close:active{\n  color:#162e51;\n}\n\n#fba-modal-dialog .usa-nav__close:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0;\n}\n\n#fba-modal-dialog .usa-nav__close:visited{\n  color:#54278f;\n}\n\n#fba-modal-dialog .usa-nav__close:hover,\n#fba-modal-dialog .usa-nav__close:active{\n  -moz-osx-font-smoothing:auto;\n  -webkit-font-smoothing:subpixel-antialiased;\n  background-color:transparent;\n  box-shadow:none;\n  text-decoration:underline;\n}\n\n#fba-modal-dialog .usa-nav__close:hover{\n  color:currentColor;\n  text-decoration:none;\n}\n@media all and (min-width: 64em){\n  #fba-modal-dialog .usa-nav__close{\n    display:none;\n  }\n}\n\n#fba-modal-dialog .usa-nav__close img{\n  width:0.75rem;\n}\n\n#fba-modal-dialog .usa-nav__close + *{\n  clear:both;\n}\n\n#fba-modal-dialog .usa-js-mobile-nav--active{\n  overflow:hidden;\n}\n\n#fba-modal-dialog .usa-search{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n  position:relative;\n}\n\n#fba-modal-dialog .usa-search::after{\n  clear:both;\n  content:"";\n  display:block;\n}\n\n#fba-modal-dialog .usa-search[role=search],\n#fba-modal-dialog .usa-search[role=search] > div,\n#fba-modal-dialog .usa-search [role=search]{\n  display:flex;\n}\n\n#fba-modal-dialog .usa-search [type=submit]{\n  background-image:url(https://touchpoints.app.cloud.gov/assets/search-7db04a241d7c4d494b921ab0ab7cc8f2a2bedeef361a30ef5cf54d80a59af1a1.svg), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  background-position:center center;\n  background-size:1rem;\n  border-bottom-left-radius:0;\n  border-top-left-radius:0;\n  height:2rem;\n  margin:0;\n  padding:0;\n  width:3rem;\n}\n\n@media all and (min-width: 30em){\n  #fba-modal-dialog .usa-search [type=submit]{\n    padding-left:1rem;\n    padding-right:1rem;\n    background-image:none;\n    width:auto;\n  }\n}\n\n#fba-modal-dialog .usa-search__submit-text{\n  position:absolute;\n  left:-999em;\n}\n@media all and (min-width: 30em){\n  #fba-modal-dialog .usa-search__submit-text{\n    position:static;\n  }\n}\n\n#fba-modal-dialog .usa-section{\n  padding-bottom:2rem;\n  padding-top:2rem;\n}\n\n@media all and (min-width: 40em){\n  #fba-modal-dialog .usa-section{\n    padding-bottom:4rem;\n    padding-top:4rem;\n  }\n}\n#fba-modal-dialog .usa-section--light{\n  background-color:#f0f0f0;\n}\n\n#fba-modal-dialog .usa-section--dark{\n  background-color:#162e51;\n  color:white;\n}\n\n#fba-modal-dialog .usa-section--dark h1,\n#fba-modal-dialog .usa-section--dark h2,\n#fba-modal-dialog .usa-section--dark h3,\n#fba-modal-dialog .usa-section--dark h4,\n#fba-modal-dialog .usa-section--dark h5,\n#fba-modal-dialog .usa-section--dark h6{\n  color:#00bde3;\n}\n\n#fba-modal-dialog .usa-section--dark p{\n  color:white;\n}\n\n#fba-modal-dialog .usa-section--dark a{\n  color:#dfe1e2;\n}\n\n#fba-modal-dialog .usa-section--dark a:hover{\n  color:#f0f0f0;\n}\n\n#fba-modal-dialog .usa-section--dark a:active{\n  color:white;\n}\n\n#fba-modal-dialog .usa-sidenav{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.3;\n  border-bottom:1px solid #dfe1e2;\n}\n\n#fba-modal-dialog .usa-sidenav > li{\n  margin-bottom:0;\n  max-width:unset;\n}\n\n#fba-modal-dialog .usa-sidenav__item{\n  border-top:1px solid #dfe1e2;\n}\n\n#fba-modal-dialog .usa-sidenav a{\n  color:#565c65;\n  display:block;\n  padding:0.5rem 1rem;\n  text-decoration:none;\n}\n\n#fba-modal-dialog .usa-sidenav a:hover{\n  background-color:#f0f0f0;\n  color:#005ea2;\n  text-decoration:none;\n}\n\n#fba-modal-dialog .usa-sidenav a:focus{\n  outline-offset:0;\n}\n\n#fba-modal-dialog .usa-sidenav #fba-modal-dialog .usa-current{\n  position:relative;\n  color:#005ea2;\n  font-weight:bold;\n}\n\n#fba-modal-dialog .usa-sidenav .usa-current::after{\n  background-color:#005ea2;\n  border-radius:99rem;\n  content:"";\n  display:block;\n  position:absolute;\n  bottom:0.25rem;\n  top:0.25rem;\n  width:0.25rem;\n  left:0.25rem;\n}\n@media all and (min-width: 40em){\n  #fba-modal-dialog .usa-sidenav .usa-current{\n    position:relative;\n  }\n  #fba-modal-dialog .usa-sidenav .usa-current::after{\n    background-color:#005ea2;\n    border-radius:99rem;\n    content:"";\n    display:block;\n    position:absolute;\n    bottom:0.25rem;\n    top:0.25rem;\n    width:0.25rem;\n    left:0;\n  }\n}\n#fba-modal-dialog .grid-container .usa-sidenav{\n  margin-left:-1rem;\n  margin-right:-1rem;\n}\n@media all and (min-width: 40em){\n  #fba-modal-dialog .grid-container .usa-sidenav{\n    margin-left:0;\n    margin-right:0;\n  }\n}\n\n#fba-modal-dialog .usa-sidenav__sublist{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n  margin:0;\n  font-size:1rem;\n}\n\n#fba-modal-dialog .usa-sidenav__sublist > li{\n  margin-bottom:0;\n  max-width:unset;\n}\n\n#fba-modal-dialog .usa-sidenav__sublist-item{\n  border-top:1px solid #dfe1e2;\n  font-size:0.93rem;\n}\n\n#fba-modal-dialog .usa-sidenav__sublist .usa-current::after{\n  display:none;\n}\n\n#fba-modal-dialog .usa-sidenav__sublist a{\n  padding-left:2rem;\n}\n\n#fba-modal-dialog .usa-sidenav__sublist .usa-sidenav__sublist a{\n  padding-left:3rem;\n}\n\n#fba-modal-dialog .usa-sidenav__sublist .usa-sidenav__sublist #fba-modal-dialog .usa-sidenav__sublist a{\n  content:"foobar";\n  padding-left:4rem;\n}\n\n#fba-modal-dialog .usa-skipnav{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n  color:#005ea2;\n  text-decoration:underline;\n  background:transparent;\n  left:0;\n  padding:0.5rem 1rem;\n  position:absolute;\n  top:-3.8rem;\n  transition:0.2s ease-in-out;\n  z-index:100;\n}\n\n#fba-modal-dialog .usa-skipnav:hover{\n  color:#1a4480;\n}\n#fba-modal-dialog .usa-skipnav:active{\n  color:#162e51;\n}\n#fba-modal-dialog .usa-skipnav:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0;\n  background:white;\n  left:0;\n  position:absolute;\n  top:0;\n  transition:0.2s ease-in-out;\n}\n#fba-modal-dialog .usa-skipnav:visited{\n  color:#54278f;\n}\n\n/* .usa-tooltip not used */\n/* .usa-search--big not used */\n/* .usa-search--small not used */\n\n/* TODO Custom */\n@media all and (min-width: 40em){\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-0{\n    margin-left:0;\n    margin-right:0;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-0 > *{\n    padding-left:0;\n    padding-right:0;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-2px{\n    margin-left:-1px;\n    margin-right:-1px;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-2px > *{\n    padding-left:1px;\n    padding-right:1px;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-05{\n    margin-left:-2px;\n    margin-right:-2px;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-05 > *{\n    padding-left:2px;\n    padding-right:2px;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-1{\n    margin-left:-0.25rem;\n    margin-right:-0.25rem;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-1 > *{\n    padding-left:0.25rem;\n    padding-right:0.25rem;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-2{\n    margin-left:-0.5rem;\n    margin-right:-0.5rem;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-2 > *{\n    padding-left:0.5rem;\n    padding-right:0.5rem;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-3{\n    margin-left:-0.75rem;\n    margin-right:-0.75rem;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-3 > *{\n    padding-left:0.75rem;\n    padding-right:0.75rem;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-4{\n    margin-left:-1rem;\n    margin-right:-1rem;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-4 > *{\n    padding-left:1rem;\n    padding-right:1rem;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-5{\n    margin-left:-1.25rem;\n    margin-right:-1.25rem;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-5 > *{\n    padding-left:1.25rem;\n    padding-right:1.25rem;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-6{\n    margin-left:-1.5rem;\n    margin-right:-1.5rem;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-6 > *{\n    padding-left:1.5rem;\n    padding-right:1.5rem;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-sm{\n    margin-left:-1px;\n    margin-right:-1px;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-sm > *{\n    padding-left:1px;\n    padding-right:1px;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-md{\n    margin-left:-0.5rem;\n    margin-right:-0.5rem;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-md > *{\n    padding-left:0.5rem;\n    padding-right:0.5rem;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-lg{\n    margin-left:-0.75rem;\n    margin-right:-0.75rem;\n  }\n  #fba-modal-dialog .grid-row.tablet\\:grid-gap-lg > *{\n    padding-left:0.75rem;\n    padding-right:0.75rem;\n  }\n}\n\n\n#fba-modal-dialog .usa-banner__guidance{\n  padding-top:0;\n}\n\n#fba-modal-dialog .usa-banner__header{\n  padding-bottom:0.25rem;\n  padding-top:0.25rem;\n  min-height:0;\n}\n#fba-modal-dialog .usa-banner__header-action{\n  display:none;\n}\n#fba-modal-dialog .usa-banner__header-flag{\n  margin-right:0.5rem;\n  padding-top:0;\n}\n#fba-modal-dialog .usa-banner__header--expanded{\n  background-color:transparent;\n  color:#1b1b1b;\n  display:block;\n  font-size:0.79853rem;\n  font-weight:normal;\n  min-height:0;\n  padding-right:0;\n}\n#fba-modal-dialog .usa-banner__button{\n  position:static;\n  bottom:auto;\n  left:auto;\n  right:auto;\n  top:auto;\n  display:inline;\n  margin-left:0.5rem;\n  position:relative;\n}\n#fba-modal-dialog .usa-banner__button::after{\n  background-image:url(https://touchpoints.app.cloud.gov/assets/angle-arrow-down-primary-6d9b63b3a47b369181f75a36b9748f07d4125842618f72db0f7c5a67fed4e392.svg), -webkit-gradient(linear, left top, left bottom, from(transparent), to(transparent));\n  background-image:url(https://touchpoints.app.cloud.gov/assets/angle-arrow-down-primary-6d9b63b3a47b369181f75a36b9748f07d4125842618f72db0f7c5a67fed4e392.svg), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  background-position:center center;\n  background-repeat:no-repeat;\n  background-size:0.5rem;\n  content:\'\';\n  display:inline-block;\n  height:0.5rem;\n  width:0.5rem;\n  margin-left:2px;\n}\n#fba-modal-dialog .usa-banner__button:hover::after{\n  background-image:url(https://touchpoints.app.cloud.gov/assets/angle-arrow-down-primary-hover-6d5068171af9e358ac8f2a121b721fdbfb2209bc6ca1a6cfd43054688fd272ca.svg), -webkit-gradient(linear, left top, left bottom, from(transparent), to(transparent));\n  background-image:url(https://touchpoints.app.cloud.gov/assets/angle-arrow-down-primary-hover-6d5068171af9e358ac8f2a121b721fdbfb2209bc6ca1a6cfd43054688fd272ca.svg), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n}\n#fba-modal-dialog .usa-banner__button:hover{\n  color:#162e51;\n}\n#fba-modal-dialog .usa-banner__button[aria-expanded=true]{\n  height:auto;\n  padding:0;\n  position:relative;\n}\n#fba-modal-dialog .usa-banner__button[aria-expanded=true]::after{\n  background-image:url(https://touchpoints.app.cloud.gov/assets/angle-arrow-up-primary-9370d0d1155459a2543f082efb0441ad48243eedc25afa09beb26b3dce7b3a1c.svg), -webkit-gradient(linear, left top, left bottom, from(transparent), to(transparent));\n  background-image:url(https://touchpoints.app.cloud.gov/assets/angle-arrow-up-primary-9370d0d1155459a2543f082efb0441ad48243eedc25afa09beb26b3dce7b3a1c.svg), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  background-position:center center;\n  background-repeat:no-repeat;\n  background-size:0.5rem;\n  content:\'\';\n  display:inline-block;\n  height:0.5rem;\n  width:0.5rem;\n  margin-left:2px;\n}\n#fba-modal-dialog .usa-banner__button[aria-expanded=true]:hover::after{\n  background-image:url(https://touchpoints.app.cloud.gov/assets/angle-arrow-up-primary-hover-c7675a969cebeb7cf7b3de671038c7823d2b227c5204719785ccab35ba4e91f6.svg), -webkit-gradient(linear, left top, left bottom, from(transparent), to(transparent));\n  background-image:url(https://touchpoints.app.cloud.gov/assets/angle-arrow-up-primary-hover-c7675a969cebeb7cf7b3de671038c7823d2b227c5204719785ccab35ba4e91f6.svg), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n}\n#fba-modal-dialog .usa-banner__button[aria-expanded=true]::after{\n  position:static;\n}\n#fba-modal-dialog .usa-banner__button-text{\n  position:static;\n  display:inline;\n}\n\n#fba-modal-dialog .usa-graphic-list #fba-modal-dialog .usa-graphic-list__row #fba-modal-dialog .usa-media-block{\n  margin-bottom:4rem;\n}\n#fba-modal-dialog .usa-graphic-list #fba-modal-dialog .usa-graphic-list__row:last-child #fba-modal-dialog .usa-media-block{\n  margin-bottom:0;\n}\n#fba-modal-dialog .usa-section{\n  padding-bottom:4rem;\n  padding-top:4rem;\n}\n#fba-modal-dialog .usa-sidenav #fba-modal-dialog .usa-current{\n  position:relative;\n}\n#fba-modal-dialog .usa-sidenav #fba-modal-dialog .usa-current::after{\n  background-color:#005ea2;\n  border-radius:99rem;\n  content:\'\';\n  display:block;\n  position:absolute;\n  bottom:0.25rem;\n  top:0.25rem;\n  width:0.25rem;\n  left:0;\n}\n#fba-modal-dialog .grid-container #fba-modal-dialog .usa-sidenav{\n  margin-left:0;\n  margin-right:0;\n}\n#fba-modal-dialog .usa-sidenav__sublist #fba-modal-dialog .usa-current::after{\n  display:none;\n}\n#fba-modal-dialog .grid-row#fba-modal-dialog .grid-gap{\n  margin-left:-1rem;\n  margin-right:-1rem;\n}\n#fba-modal-dialog .grid-row#fba-modal-dialog .grid-gap > *{\n  padding-left:1rem;\n  padding-right:1rem;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-0{\n  margin-left:0;\n  margin-right:0;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-0 > *{\n  padding-left:0;\n  padding-right:0;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-2px{\n  margin-left:-1px;\n  margin-right:-1px;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-2px > *{\n  padding-left:1px;\n  padding-right:1px;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-05{\n  margin-left:-2px;\n  margin-right:-2px;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-05 > *{\n  padding-left:2px;\n  padding-right:2px;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-1{\n  margin-left:-0.25rem;\n  margin-right:-0.25rem;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-1 > *{\n  padding-left:0.25rem;\n  padding-right:0.25rem;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-2{\n  margin-left:-0.5rem;\n  margin-right:-0.5rem;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-2 > *{\n  padding-left:0.5rem;\n  padding-right:0.5rem;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-3{\n  margin-left:-0.75rem;\n  margin-right:-0.75rem;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-3 > *{\n  padding-left:0.75rem;\n  padding-right:0.75rem;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-4{\n  margin-left:-1rem;\n  margin-right:-1rem;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-4 > *{\n  padding-left:1rem;\n  padding-right:1rem;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-5{\n  margin-left:-1.25rem;\n  margin-right:-1.25rem;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-5 > *{\n  padding-left:1.25rem;\n  padding-right:1.25rem;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-6{\n  margin-left:-1.5rem;\n  margin-right:-1.5rem;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-6 > *{\n  padding-left:1.5rem;\n  padding-right:1.5rem;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-sm{\n  margin-left:-1px;\n  margin-right:-1px;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-sm > *{\n  padding-left:1px;\n  padding-right:1px;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-md{\n  margin-left:-0.5rem;\n  margin-right:-0.5rem;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-md > *{\n  padding-left:0.5rem;\n  padding-right:0.5rem;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-lg{\n  margin-left:-0.75rem;\n  margin-right:-0.75rem;\n}\n#fba-modal-dialog .grid-row.desktop\\:grid-gap-lg > *{\n  padding-left:0.75rem;\n  padding-right:0.75rem;\n}\n#fba-modal-dialog .usa-banner__inner{\n  padding-right:2rem;\n}\n#fba-modal-dialog .usa-footer__primary-container{\n  padding-left:2rem;\n  padding-right:2rem;\n}\n#fba-modal-dialog .usa-header #fba-modal-dialog .usa-search{\n  float:right;\n}\n#fba-modal-dialog .usa-header [role=search]{\n  float:right;\n  max-width:calc(27ch + 3rem);\n  width:100%;\n}\n#fba-modal-dialog .usa-header + #fba-modal-dialog .usa-section,\n#fba-modal-dialog .usa-header + main{\n  border-top:1px solid #dcdee0;\n}\n#fba-modal-dialog .usa-logo{\n  margin-top:2rem;\n  margin-bottom:1rem;\n  font-size:1.46397rem;\n  line-height:1.12707;\n}\n#fba-modal-dialog .usa-menu-btn{\n  display:none;\n}\n\n#fba-modal-dialog .usa-header--basic #fba-modal-dialog .usa-nav{\n  -webkit-box-orient:horizontal;\n  -webkit-box-direction:normal;\n      -ms-flex-direction:row;\n          flex-direction:row;\n  -webkit-box-align:center;\n      -ms-flex-align:center;\n          align-items:center;\n  -webkit-box-pack:end;\n      -ms-flex-pack:end;\n          justify-content:flex-end;\n  display:-webkit-box;\n  display:-ms-flexbox;\n  display:flex;\n  padding:0 0 0.25rem 0.5rem;\n  width:100%;\n}\n\n#fba-modal-dialog .usa-header--basic #fba-modal-dialog .usa-current,\n#fba-modal-dialog .usa-header--basic [aria-expanded=true],\n#fba-modal-dialog .usa-header--basic #fba-modal-dialog .usa-nav__link:hover{\n  position:relative;\n}\n#fba-modal-dialog .usa-header--basic #fba-modal-dialog .usa-current::after,\n#fba-modal-dialog .usa-header--basic [aria-expanded=true]::after,\n#fba-modal-dialog .usa-header--basic #fba-modal-dialog .usa-nav__link:hover::after{\n  background-color:#005ea2;\n  border-radius:0;\n  content:\'\';\n  display:block;\n  position:absolute;\n  height:0.25rem;\n  left:1rem;\n  right:1rem;\n  bottom:-0.25rem;\n}\n#fba-modal-dialog .usa-header--basic #fba-modal-dialog .usa-search{\n  top:0;\n}\n#fba-modal-dialog .usa-header--basic#fba-modal-dialog .usa-header--megamenu #fba-modal-dialog .usa-nav__inner{\n  display:block;\n  float:right;\n  margin-top:-2.5rem;\n}\n#fba-modal-dialog .usa-header--extended{\n  padding-top:0;\n}\n#fba-modal-dialog .usa-header--extended #fba-modal-dialog .usa-current,\n#fba-modal-dialog .usa-header--extended [aria-expanded=true],\n#fba-modal-dialog .usa-header--extended #fba-modal-dialog .usa-nav__link:hover{\n  position:relative;\n}\n#fba-modal-dialog .usa-header--extended #fba-modal-dialog .usa-current::after,\n#fba-modal-dialog .usa-header--extended [aria-expanded=true]::after,\n#fba-modal-dialog .usa-header--extended #fba-modal-dialog .usa-nav__link:hover::after{\n  background-color:#005ea2;\n  border-radius:0;\n  content:\'\';\n  display:block;\n  position:absolute;\n  height:0.25rem;\n  left:1rem;\n  right:1rem;\n  bottom:0;\n}\n#fba-modal-dialog .usa-header--extended #fba-modal-dialog .usa-logo{\n  font-size:2.12941rem;\n  margin:2rem 0 1.5rem;\n  max-width:50%;\n}\n#fba-modal-dialog .usa-header--extended #fba-modal-dialog .usa-nav{\n  border-top:1px solid #dcdee0;\n  padding:0;\n  width:100%;\n}\n#fba-modal-dialog .usa-header--extended #fba-modal-dialog .usa-nav__inner{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n  padding-left:1rem !important;\n  position:relative;\n}\n#fba-modal-dialog .usa-header--extended #fba-modal-dialog .usa-nav__link{\n  padding-bottom:1rem;\n  padding-top:1rem;\n}\n#fba-modal-dialog .usa-header--extended #fba-modal-dialog .usa-megamenu{\n  left:0;\n  padding-left:2rem;\n}\n#fba-modal-dialog .usa-layout-docs__sidenav{\n  padding-top:0;\n}\n#fba-modal-dialog .usa-layout-docs__main{\n  -webkit-box-ordinal-group:3;\n      -ms-flex-order:2;\n          order:2;\n}\n#fba-modal-dialog .usa-nav{\n  float:right;\n  position:relative;\n}\n#fba-modal-dialog .usa-nav #fba-modal-dialog .usa-search{\n  margin-left:1rem;\n}\n#fba-modal-dialog .usa-nav__secondary{\n  bottom:4rem;\n  font-size:0.93162rem;\n  margin-top:0.5rem;\n  min-width:calc(27ch + 3rem);\n  position:absolute;\n  right:2rem;\n}\n#fba-modal-dialog .usa-nav__secondary #fba-modal-dialog .usa-search{\n  margin-left:0;\n  margin-top:0.5rem;\n}\n#fba-modal-dialog .usa-nav__secondary-links{\n  float:right;\n  line-height:0.93923;\n  margin-bottom:0.25rem;\n  margin-top:0;\n}\n#fba-modal-dialog .usa-nav__secondary-links #fba-modal-dialog .usa-nav__secondary-item{\n  display:inline;\n  padding-left:0.25rem;\n}\n#fba-modal-dialog .usa-nav__secondary-links #fba-modal-dialog .usa-nav__secondary-item + #fba-modal-dialog .usa-nav__secondary-item::before{\n  color:#dcdee0;\n  content:\'|\';\n  padding-right:0.25rem;\n}\n#fba-modal-dialog .usa-nav__close{\n  display:none;\n}\n\n#fba-modal-dialog .usa-radio__input:checked+.usa-radio__label:before {\n    -webkit-box-shadow: 0 0 0 2px #005ea2, inset 0 0 0 2px #fff;\n    box-shadow: 0 0 0 2px #005ea2, inset 0 0 0 2px #fff;\n}\n#fba-modal-dialog .usa-checkbox__input:checked+.usa-checkbox__label:before, #fba-modal-dialog .usa-radio__input:checked+.usa-radio__label:before {\n    background-color: #005ea2;\n    -webkit-box-shadow: 0 0 0 2px #005ea2;\n    box-shadow: 0 0 0 2px #005ea2;\n}\n\n/* TP-795 disable uswds v1 overrides */\n#fba-modal-dialog .usa-label, #fba-modal-dialog .usa-label-big {\n  background-color: inherit;\n  border-radius: inherit;\n  color: inherit;\n  /*font-size: inherit; */\n  margin-right: inherit;\n  padding: inherit;\n  text-transform: inherit;\n}\n\n@media all and  (min-width: 30em) {\n  #fba-modal-dialog .usa-button {\n    width: auto;\n  }\n}\n\n@media all and (min-width: 64em) and (min-width: 64em){\n  #fba-modal-dialog .usa-header--extended #fba-modal-dialog .usa-nav__inner{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n\n@media print{\n  #fba-modal-dialog .usa-radio__input:checked + #fba-modal-dialog .usa-radio__label::before{\n    -webkit-box-shadow:inset 0 0 0 2px white, inset 0 0 0 1rem #005ea2, 0 0 0 2px #005ea2;\n            box-shadow:inset 0 0 0 2px white, inset 0 0 0 1rem #005ea2, 0 0 0 2px #005ea2;\n  }\n  #fba-modal-dialog .usa-checkbox__input:checked + #fba-modal-dialog .usa-checkbox__label::before,\n  #fba-modal-dialog .usa-checkbox__input:checked:disabled + #fba-modal-dialog .usa-checkbox__label::before{\n    background-image:none;\n    background-color:white;\n    content:url(https://touchpoints.app.cloud.gov/assets/correct8-alt-ed334e8ba2110ac040edc4d63f2cca99ef68ac7fe508e228a422b23a6917b18d.svg);\n    text-indent:0;\n  }\n}\n\n@media all and (max-width: 39.99em){\n  #fba-modal-dialog .usa-banner__button{\n    width:100%;\n  }\n  #fba-modal-dialog .usa-banner__button[aria-expanded=true]::after{\n    background-image:url(https://touchpoints.app.cloud.gov/assets/close-blue-60v-alt-e2b5b8af7516593ebe33bd87e9dcccb270a80ecab9b16b51a59654e4f0118da1.svg), -webkit-gradient(linear, left top, left bottom, from(transparent), to(transparent));\n    background-image:url(https://touchpoints.app.cloud.gov/assets/close-blue-60v-alt-e2b5b8af7516593ebe33bd87e9dcccb270a80ecab9b16b51a59654e4f0118da1.svg), linear-gradient(transparent, transparent);\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-repeat:no-repeat;\n    background-size:1rem;\n    content:\'\';\n    display:inline-block;\n    height:3rem;\n    width:3rem;\n    margin-left:0;\n  }\n  #fba-modal-dialog .usa-banner__button[aria-expanded=true]::after{\n    position:absolute;\n    bottom:0;\n    top:0;\n    position:absolute;\n    right:0;\n    background-color:#dcdee0;\n    bottom:0;\n    height:auto;\n  }\n}\n\n@media all and (max-width: 63.99em){\n  #fba-modal-dialog .usa-logo{\n    -webkit-box-flex:1;\n        -ms-flex:1 0 0px;\n            flex:1 0 0;\n    font-size:0.93162rem;\n    line-height:0.93923;\n    margin-left:1rem;\n  }\n  #fba-modal-dialog .usa-nav{\n    position:absolute;\n    right:0;\n    position:absolute;\n    bottom:0;\n    top:0;\n    position:fixed;\n    background:white;\n    border-right:0;\n    display:none;\n    -webkit-box-orient:vertical;\n    -webkit-box-direction:normal;\n        -ms-flex-direction:column;\n            flex-direction:column;\n    overflow-y:auto;\n    padding:1rem;\n    width:15rem;\n    z-index:500;\n  }\n  #fba-modal-dialog .usa-nav.is-visible{\n    -webkit-animation:slidein-left 0.3s ease-in-out;\n            animation:slidein-left 0.3s ease-in-out;\n    display:-webkit-box;\n    display:-ms-flexbox;\n    display:flex;\n  }\n}\n\n.star_rating svg {\n	width: 1em;\n	height: 1em;\n	fill: currentColor;\n	stroke: currentColor;\n}\n.star_rating label, .star_rating output {\n	display: block;\n	float: left;\n	font-size: 2em;\n	height: 1.2em;\n	color: #036;\n	cursor: pointer;\n	/* Transparent border-bottom avoids jumping\n	   when a colored border is applied\n		 on :hover/:focus */\n	border-bottom: 2px solid transparent;\n}\n.star_rating output {\n	font-size: 1.5em;\n	padding: 0 1em;\n}\n.star_rating input:checked ~ label {\n	color: #999;\n}\n.star_rating input:checked + label {\n	color: #036;\n	border-bottom-color: #036;\n}\n.star_rating input:focus + label {\n	border-bottom-style: dotted;\n}\n.star_rating:hover input + label {\n	color: #036;\n}\n.star_rating input:hover ~ label,\n.star_rating input:focus ~ label,\n.star_rating input[id="star0"] + label {\n	color: #999;\n}\n.star_rating input:hover + label,\n.star_rating input:focus + label {\n	color: #036;\n}\n.star_rating input[id="star0"]:checked + label {\n	color: #ff2d21;\n}\n\n/*! from USWDS  uswds v2.9.0 */\n#fba-button.usa-button{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:0.9;\n  -moz-osx-font-smoothing:grayscale;\n  -webkit-font-smoothing:antialiased;\n  color:white;\n  background-color:#005ea2;\n  -webkit-appearance:none;\n     -moz-appearance:none;\n          appearance:none;\n  border:0;\n  border-radius:0.25rem;\n  cursor:pointer;\n  display:inline-block;\n  font-weight:bold;\n  margin-right:0.5rem;\n  padding:0.75rem 1.25rem;\n  text-align:center;\n  text-decoration:none;\n  /* width:100%; */\n  border-bottom-left-radius: 0;\n  border-bottom-right-radius: 0\n}\n\n.usa-skipnav.touchpoints-skipnav{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n  color:#005ea2;\n  text-decoration:underline;\n  background:transparent;\n  left:0;\n  padding:0.5rem 1rem;\n  position:absolute;\n  top:-3.8rem;\n  transition:0.2s ease-in-out;\n  z-index:100;\n}\n.usa-skipnav.touchpoints-skipnav:hover{\n  color:#1a4480;\n}\n.usa-skipnav.touchpoints-skipnav:active{\n  color:#162e51;\n}\n.usa-skipnav.touchpoints-skipnav:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0;\n}\n.usa-skipnav.touchpoints-skipnav:visited{\n  color:#54278f;\n}\n.usa-skipnav.touchpoints-skipnav:focus{\n  background:white;\n  left:0;\n  position:absolute;\n  top:0;\n  transition:0.2s ease-in-out;\n}\n\n/* Checkboxes and radios with tap-friendly targets */\n/* These custom .usa-checkbox__input--tile styles will go away */\n/* after using USWDS when https://github.com/uswds/uswds/pull/3802 is merged */\n#fba-modal-dialog .usa-checkbox__input--tile+.usa-checkbox__label,\n#fba-modal-dialog .usa-radio__input--tile+.usa-radio__label {\n  border: 2px solid #e6e6e6;\n  border-radius: .25rem;\n  margin: .5rem 0;\n  padding: .75rem 1rem .75rem 2.5rem;\n}\n#fba-modal-dialog .usa-checkbox__input--tile:checked+.usa-checkbox__label,\n#fba-modal-dialog .usa-radio__input--tile:checked+.usa-radio__label {\n  background-color: #d9e8f6;\n  border-color: #73b3e7;\n}\n#fba-modal-dialog .usa-checkbox__label-description,\n#fba-modal-dialog .usa-radio__label-description {\n  display: block;\n  font-size: .93rem;\n  margin-top: .5rem;\n  text-indent: 0;\n}\n\n/* Override */\n#fba-modal-dialog .usa-form {\n  max-width: inherit;\n}\n\n/* Custom */\n.touchpoints-form-wrapper .usa-banner {\n  margin-top: 10px;\n}\n\n.usa-banner__header.touchpoints-footer-banner {\n  min-height: 0;\n}\n .question .usa-label {max-width: 100% !important;} .submit-button { margin-bottom: 2rem}',
    formComponent: function () {
      return document.querySelector(
        "[data-touchpoints-form-id='" + this.formId + "']"
      );
    },
    formElement: function () {
      return this.formComponent().querySelector("form");
    },
    activatedButton: null, // tracks a reference to the button that was clicked to open the modal

    // enable Javascript experience
    javscriptIsEnabled: function () {
      var javascriptDisabledMessage = document.getElementsByClassName(
        "javascript-disabled-message"
      )[0];
      var touchpointForm = document.getElementsByClassName(
        "touchpoint-form"
      )[0];
      if (javascriptDisabledMessage) {
        javascriptDisabledMessage.classList.add("hide");
      }
      if (touchpointForm) {
        touchpointForm.classList.remove("hide");
      }
    },
    init: function (options) {
      this.javscriptIsEnabled();
      this.options = options;
      this.loadCss();
      this.loadHtml();
      this.bindEventListeners();
      this.dialogOpen = false; // initially false
      this.successState = false; // initially false
      this.pagination();
      return this;
    },
    bindEventListeners: function () {
      var self = this;
      d.addEventListener("keyup", function (event) {
        var x = event.keyCode;
        if (x == 27 && self.dialogOpen == true) {
          self.closeDialog();
        }
      });
      d.addEventListener("click", function (event) {
        self.handleClick(event);
      });
    },
    loadCss: function () {
      d.head.innerHTML += "<style>" + this.css + "</style>";
    },
    loadHtml: function () {
      this.dialogEl = document.createElement("div");
      this.dialogEl.setAttribute("hidden", true);
      this.dialogEl.setAttribute("class", "fba-modal");
      this.dialogEl.setAttribute("role", "dialog");
      this.dialogEl.setAttribute("aria-modal", "true");
      this.dialogEl.innerHTML =
        '<div id="fba-modal-dialog" class="fba-modal-dialog">\n  <div class="touchpoints-form-wrapper" id="touchpoints-form-5b1efe87" data-touchpoints-form-id="5b1efe87" tabindex="-1">\n  <div class="wrapper">\n      <h1 id="fba-modal-title">\n        SimpleReport feedback\n      </h1>\n      <a class="fba-modal-close" type="button" href="#">×</a>\n\n    <div class="fba-alert usa-alert usa-alert--success" hidden>\n  <div class="usa-alert__body">\n    <h3 class="usa-alert__heading">\n      Success\n    </h3>\n    <p class="usa-alert__text">\n      Thanks for your feedback!\n    </p>\n  </div>\n</div>\n<div class="fba-alert-error usa-alert usa-alert--error" hidden>\n  <div class="usa-alert__body">\n    <h3 class="usa-alert__heading">\n      Error\n    </h3>\n    <p class="usa-alert__text">\n      alert message\n    </p>\n  </div>\n</div>\n\n    \n<form action="https://touchpoints.app.cloud.gov/touchpoints/5b1efe87/submissions.json" method="POST">\n  <div class="touchpoints-form-body">\n    <input type="hidden" name="fba_location_code" id="fba_location_code" autocomplete="off" />\n    <input type="text" name="fba_directive" id="fba_directive" title="this field can be skipped" style="display:none !important" tabindex="-1" autocomplete="off">\n      <div class="section visible">\n\n\n        <div class="questions">\n\n          <div class="question white-bg">\n              <div role="group">\n  <label class="usa-label" for="answer_01">\n  What do you think about SimpleReport? Please share feedback on anything you like, or how we can improve.\n  <p>\n    <small>\n      (Looking for help or SimpleReport resources? Visit our support page instead.)\n    </small>\n  </p>\n</label>\n\n    <textarea name="answer_01" id="answer_01" class="usa-textarea" required="required" maxlength="100000" placeholder="">\n</textarea>\n</div>\n\n          </div>\n\n          <div class="question white-bg">\n              <fieldset class="usa-fieldset" role="group">\n  <legend class="usa-sr-only"></legend>\n  <div class="usa-label">\n  \n</div>\n\n  <div class="question-options" id="answer_02">\n    <div class="usa-checkbox" id="question_option_10594" data-id="10594">\n      <input type="checkbox" name="answer_02" id="answer_02_1" value="I’m interested in providing more feedback about SimpleReport (usually via a video call)." multiple="multiple" class="usa-checkbox__input usa-checkbox__input--tile" />\n      <label for="answer_02_1" class="usa-checkbox__label">I’m interested in providing more feedback about SimpleReport (usually via a video call).</label>\n    </div>\n  </div>\n</fieldset>\n\n          </div>\n\n          <div class="question white-bg">\n              <div role="group">\n  <label class="usa-label" for="answer_03">\n  Email\n</label>\n\n  <input type="email" name="answer_03" id="answer_03" class="usa-input" />\n</div>\n\n          </div>\n        </div>\n\n          <p class="submit-button">\n            <button type="submit" class="usa-button submit_form_button">Submit</button>\n          </p>\n      </div>\n  </div>\n</form>\n\n  </div>\n  \n    <div class="touchpoints-form-disclaimer">\n  <hr style="border: none; border-top: 1px solid #E5E5E5;">\n  <div class="grid-container">\n    <div class="grid-row">\n      <div class="grid-col-12">\n          <small id="fba-dialog-privacy">\n            <a href="https://www.gsa.gov/reference/gsa-privacy-program/privacy-act-statement-for-design-research" target="_blank" rel="noopener">Privacy Act Statement for Design Research</a>\n|\n<a href="https://www.simplereport.gov/support/">SimpleReport support</a>\n| \n<a href="https://www.simplereport.gov/terms-of-service/">SimpleReport terms of service</a>\n\n          </small>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class="usa-banner">\n  <header class="usa-banner__header touchpoints-footer-banner">\n    <div class="usa-banner__inner">\n      <div class="grid-col-auto">\n        <img class="usa-banner__header-flag" src="https://touchpoints.app.cloud.gov/assets/us_flag_small-9c507b1ff21f65c4b8f0c45d0e0d0a10bb5c9864c1a76e07aa3293da574968a1.png" alt="U.S. flag">\n      </div>\n      <div class="grid-col-fill tablet:grid-col-auto">\n        <p class="usa-banner__header-text">\n          An official form of the United States government.\n          Provided by\n          <a href="https://touchpoints.app.cloud.gov/" target="_blank" rel="noopener">Touchpoints</a>\n          <br>\n\n        </p>\n      </div>\n    </div>\n  </header>\n</div>\n\n\n\n</div>\n</div>\n';
      d.body.appendChild(this.dialogEl);

      d.querySelector(".fba-modal-close").addEventListener(
        "click",
        this.handleDialogClose.bind(this),
        false
      );
      var otherElements = d.querySelectorAll(".usa-input.other-option");
      for (var i = 0; i < otherElements.length; i++) {
        otherElements[i].addEventListener(
          "keyup",
          this.handleOtherOption.bind(this),
          false
        );
      }
      var phoneElements = d.querySelectorAll("input[type='tel']");
      for (var i = 0; i < phoneElements.length; i++) {
        phoneElements[i].addEventListener(
          "keyup",
          this.handlePhoneInput.bind(this),
          false
        );
      }

      const touchpointsButtons = Array.from(
        d.getElementsByClassName("sr-app-touchpoints-button")
      );
      if (touchpointsButtons.length !== 0) {
        touchpointsButtons.forEach((el) => {
          el.addEventListener(
            "click",
            this.handleButtonClick.bind(this),
            false
          );
        });
      }

      var formElement = this.formElement();
      // returns 1 or more submit buttons within the Touchpoints form
      var submitButtons = formElement.querySelectorAll("[type='submit']");
      var that = this;

      var yesNoForm = formElement.querySelector(".touchpoints-yes-no-buttons");

      if (yesNoForm) {
        // only for yes/no questions
        Array.prototype.forEach.call(submitButtons, function (submitButton) {
          submitButton.addEventListener(
            "click",
            that.handleYesNoSubmitClick.bind(that),
            false
          );
        });
      } else {
        // for all other types of forms/questions
        if (submitButtons) {
          Array.prototype.forEach.call(submitButtons, function (submitButton) {
            submitButton.addEventListener(
              "click",
              that.handleSubmitClick.bind(that),
              false
            );
          });
        }
      }
    },
    resetErrors: function () {
      var formComponent = this.formComponent();
      var alertElement = formComponent.querySelector(".fba-alert");
      var alertElementHeading = formComponent.getElementsByClassName(
        "usa-alert__heading"
      )[0];
      var alertElementBody = formComponent.getElementsByClassName(
        "usa-alert__text"
      )[0];
      var alertErrorElement = formComponent.querySelector(".fba-alert-error");
      var alertErrorElementBody = alertErrorElement.getElementsByClassName(
        "usa-alert__text"
      )[0];
      alertElement.setAttribute("hidden", true);
      alertElementHeading.innerHTML = "";
      alertElementBody.innerHTML = "";
      alertErrorElement.setAttribute("hidden", true);
      alertErrorElementBody.innerHTML = "";
    },
    handleClick: function (e) {
      if (
        this.dialogOpen &&
        !e.target.closest(".sr-app-touchpoints-button") &&
        !e.target.closest(".fba-modal-dialog")
      ) {
        this.closeDialog();
      }
    },
    handleButtonClick: function (e) {
      e.preventDefault();
      this.activatedButton = e.target;
      this.loadDialog();
    },
    handleDialogClose: function (e) {
      e.preventDefault();
      this.closeDialog();
    },
    handleOtherOption: function (e) {
      var selectorId = "#" + e.srcElement.getAttribute("data-option-id");
      var other_val = e.target.value.replace(/,/g, "");
      if (other_val == "") other_val = "other";
      var option = this.formElement().querySelector(selectorId);
      option.checked = true;
      option.value = other_val;
    },
    handlePhoneInput: function (e) {
      var number = e.srcElement.value.replace(/[^\d]/g, "");
      if (number.length == 7) {
        number = number.replace(/(\d{3})(\d{4})/, "$1-$2");
      } else if (number.length == 10) {
        number = number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      }
      e.srcElement.value = number;
    },
    handleEmailInput: function (e) {
      var EmailRegex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      var email = e.srcElement.value.trim();
      if (email.length == 0) {
        return;
      }
      var result = EmailRegex.test(email);
      if (!result) {
        showWarning($(this), "Please enter a valid email address");
      } else {
        showValid($(this));
      }
      e.srcElement.value = number;
    },
    handleSubmitClick: function (e) {
      e.preventDefault();
      this.resetErrors();
      var formElement = this.formElement();
      var self = this;
      if (self.validateForm(formElement)) {
        // disable submit button and show sending feedback message
        var submitButton = formElement.querySelector("[type='submit']");
        submitButton.disabled = true;
        submitButton.classList.add("aria-disabled");
        self.sendFeedback();
      }
    },
    handleYesNoSubmitClick: function (e) {
      e.preventDefault();

      var input = this.formComponent().querySelector(
        ".fba-touchpoints-page-form"
      );
      input.value = e.target.value;
      this.resetErrors();
      var self = this;
      var formElement = this.formElement();
      if (self.validateForm(formElement)) {
        var submitButtons = formElement.querySelectorAll("[type='submit']");
        Array.prototype.forEach.call(submitButtons, function (submitButton) {
          submitButton.disabled = true;
        });
        self.sendFeedback();
      }
    },
    validateForm: function (form) {
      this.hideValidationError(form);
      var valid =
        this.checkRequired(form) &&
        this.checkEmail(form) &&
        this.checkPhone(form) &&
        this.checkDate(form);
      return valid;
    },
    checkRequired: function (form) {
      var requiredItems = form.querySelectorAll("[required]");
      var questions = {};
      // Build a dictionary of questions which require an answer
      Array.prototype.forEach.call(requiredItems, function (item) {
        questions[item.name] = item;
      });

      Array.prototype.forEach.call(requiredItems, function (item) {
        switch (item.type) {
          case "radio":
            if (item.checked) delete questions[item.name];
            break;
          case "checkbox":
            if (item.checked) delete questions[item.name];
            break;
          case "select-one":
            if (item.selectedIndex > 0) delete questions[item.name];
            break;
          default:
            if (item.value.length > 0) delete questions[item.name];
        }
      });
      for (var key in questions) {
        this.showValidationError(
          questions[key],
          "You must respond to question: "
        );
        return false;
      }
      return true;
    },
    checkDate: function (form) {
      var dateItems = form.querySelectorAll(".date-select");
      var questions = {};
      // Build a dictionary of questions which require an answer
      Array.prototype.forEach.call(dateItems, function (item) {
        questions[item.name] = item;
      });
      Array.prototype.forEach.call(dateItems, function (item) {
        if (item.value.length == 0) {
          delete questions[item.name];
        } else {
          var isValidDate = Date.parse(item.value);
          if (!isNaN(isValidDate)) delete questions[item.name];
        }
      });
      for (var key in questions) {
        this.showValidationError(
          questions[key],
          "Please enter a valid value: "
        );
        return false;
      }
      return true;
    },
    checkEmail: function (form) {
      var emailItems = form.querySelectorAll('input[type="email"]');
      var questions = {};
      // Build a dictionary of questions which require an answer
      Array.prototype.forEach.call(emailItems, function (item) {
        questions[item.name] = item;
      });
      Array.prototype.forEach.call(emailItems, function (item) {
        if (item.value.length == 0) {
          delete questions[item.name];
        } else {
          var EmailRegex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
          if (EmailRegex.test(item.value)) delete questions[item.name];
        }
      });
      for (var key in questions) {
        this.showValidationError(
          questions[key],
          "Please enter a valid value: "
        );
        return false;
      }
      return true;
    },
    checkPhone: function (form) {
      var phoneItems = form.querySelectorAll('input[type="tel"]');
      var questions = {};
      // Build a dictionary of questions which require an answer
      Array.prototype.forEach.call(phoneItems, function (item) {
        questions[item.name] = item;
      });
      Array.prototype.forEach.call(phoneItems, function (item) {
        if (item.value.length == 0) {
          delete questions[item.name];
        } else {
          var PhoneRegex = /^[0-9]{10}$/;
          if (PhoneRegex.test(item.value)) delete questions[item.name];
        }
      });
      for (var key in questions) {
        this.showValidationError(
          questions[key],
          "Please enter a valid value: "
        );
        return false;
      }
      return true;
    },
    showValidationError: function (question, error) {
      var questionDiv = question.closest(".question");
      var label = questionDiv.querySelector(".usa-label");
      var questionNum = label.innerText;

      // show page with validation error
      var errorPage = question.closest(".section");
      if (!errorPage.classList.contains("visible")) {
        var visiblePage = document.getElementsByClassName("section visible")[0];
        visiblePage.classList.remove("visible");
        errorPage.classList.add("visible");
      }

      questionDiv.setAttribute("class", "usa-form-group usa-form-group--error");
      var span = document.createElement("span");
      span.setAttribute("id", "input-error-message");
      span.setAttribute("role", "alert");
      span.setAttribute("class", "usa-error-message");
      span.innerText = error + questionNum;
      label.parentNode.insertBefore(span, label.nextSibling);
      var input = document.createElement("input");
      input.setAttribute("hidden", "true");
      input.setAttribute("id", "input-error");
      input.setAttribute("type", "text");
      input.setAttribute("name", "input-error");
      input.setAttribute("aria-describedby", "input-error-message");
      questionDiv.appendChild(input);
      questionDiv.scrollIntoView();
      questionDiv.focus();

      // enable submit button ( so user can fix error and resubmit )
      var submitButton = document.querySelector("[type='submit']");
      submitButton.disabled = false;
      submitButton.classList.remove("aria-disabled");
    },
    hideValidationError: function (form) {
      var elem = form.querySelector(".usa-form-group--error");
      if (elem == null) return;
      elem.setAttribute("class", "question");
      var elem = form.querySelector("#input-error-message");
      if (elem != null) elem.parentNode.removeChild(elem);
      elem = form.querySelector("#input-error");
      if (elem != null) elem.parentNode.removeChild(elem);
    },
    textCounter: function (field, maxlimit) {
      var countfield = field.parentNode.querySelector(".counter-msg");
      if (field.value.length > maxlimit) {
        field.value = field.value.substring(0, maxlimit);
        countfield.innerText = "0 characters left";
        return false;
      } else {
        countfield.innerText =
          "" + (maxlimit - field.value.length) + " characters left";
      }
    },
    loadButton: function () {
      // Add the fixed, floating tab button
      this.buttonEl = document.createElement("a");
      this.buttonEl.setAttribute("id", "fba-button");
      this.buttonEl.setAttribute("data-id", "5b1efe87");
      this.buttonEl.setAttribute("class", "fixed-tab-button usa-button");
      this.buttonEl.setAttribute("href", "#");
      this.buttonEl.setAttribute("aria-haspopup", "dialog");
      this.buttonEl.addEventListener(
        "click",
        this.handleButtonClick.bind(this),
        false
      );
      this.buttonEl.innerHTML = this.options.modalButtonText;
      d.body.appendChild(this.buttonEl);

      this.loadFeebackSkipLink();
    },
    loadFeebackSkipLink: function () {
      this.skipLink = document.createElement("a");
      this.skipLink.setAttribute("class", "usa-skipnav touchpoints-skipnav");
      this.skipLink.setAttribute("href", "#fba-button");
      this.skipLink.addEventListener("click", function () {
        document.querySelector("#fba-button").focus();
      });
      this.skipLink.innerHTML = "Skip to feedback";

      var existingSkipLinks = document.querySelector(".usa-skipnav");
      if (existingSkipLinks) {
        existingSkipLinks.insertAdjacentElement("afterend", this.skipLink);
      } else {
        d.body.prepend(this.skipLink);
      }
    },
    // Used when in a modal
    loadDialog: function () {
      d.querySelector(".fba-modal").removeAttribute("hidden");
      d.getElementById("touchpoints-form-5b1efe87").focus();
      this.dialogOpen = true;
    },
    closeDialog: function () {
      d.querySelector(".fba-modal").setAttribute("hidden", true);
      this.resetFormDisplay();
      this.activatedButton.focus();
      this.dialogOpen = false;
    },
    sendFeedback: function () {
      var form = this.formElement();
      this.ajaxPost(form, this.formSuccess);
    },
    successHeadingText: function () {
      return "Success";
    },
    successText: function () {
      return "Thanks for your feedback!";
    },
    showFormSuccess: function (e) {
      var formComponent = this.formComponent();
      var formElement = this.formElement();
      var alertElement = formComponent.querySelector(".fba-alert");
      var alertElementHeading = formComponent.querySelector(
        ".usa-alert__heading"
      );
      var alertElementBody = formComponent.querySelector(".usa-alert__text");

      // Display success Message
      alertElementHeading.innerHTML += this.successHeadingText();
      alertElementBody.innerHTML += this.successText();
      alertElement.removeAttribute("hidden");

      // Hide Form Elements
      if (formElement) {
        // And clear the Form's Fields
        formElement.reset();
        if (formElement.querySelector(".touchpoints-form-body")) {
          var formBody = formElement.querySelector(".touchpoints-form-body");
          if (formBody) {
            formBody.setAttribute("hidden", true);
          }
        }
        if (formComponent.querySelector(".touchpoints-form-disclaimer")) {
          var formDisclaimer = formComponent.querySelector(
            ".touchpoints-form-disclaimer"
          );
          if (formDisclaimer) {
            formDisclaimer.setAttribute("hidden", true);
          }
        }
      }
    },
    resetFormDisplay: function () {
      if (this.successState === false) {
        return false;
      }

      // Hide and Reset Flash Message
      this.resetErrors();

      // Re-enable Submit Button
      var formElement = this.formElement();
      var submitButton = formElement.querySelector("[type='submit']");
      submitButton.disabled = false;

      // Show Form Elements
      if (formElement) {
        if (formElement.querySelector(".touchpoints-form-body")) {
          var formBody = formElement.querySelector(".touchpoints-form-body");
          if (formBody) {
            formBody.removeAttribute("hidden");
          }
        }
      }
    },
    formSuccess: function (e) {
      // Clear the alert box
      var formComponent = this.formComponent();
      var alertElement = formComponent.querySelector(".fba-alert");
      var alertElementBody = formComponent.getElementsByClassName(
        "usa-alert__text"
      )[0];
      var alertErrorElement = formComponent.querySelector(".fba-alert-error");
      var alertErrorElementBody = alertErrorElement.getElementsByClassName(
        "usa-alert__text"
      )[0];
      alertElementBody.innerHTML = "";
      alertErrorElementBody.innerHTML = "";

      var formElement = this.formElement();
      var submitButton = formElement.querySelector("[type='submit']");

      if (e.target.readyState === 4) {
        if (e.target.status === 201) {
          // SUCCESS!
          this.successState = true;
          if (submitButton) {
            submitButton.disabled = true;
          }
          this.showFormSuccess();
        } else if (e.target.status === 422) {
          // FORM ERRORS =\
          this.successState = false;
          if (submitButton) {
            submitButton.disabled = false;
          }
          var jsonResponse = JSON.parse(e.target.response);
          var errors = jsonResponse.messages;

          for (var err in errors) {
            if (errors.hasOwnProperty(err)) {
              alertErrorElementBody.innerHTML += err;
              alertErrorElementBody.innerHTML += " ";
              alertErrorElementBody.innerHTML += errors[err];
              alertErrorElementBody.innerHTML += "<br />";
            }
          }
          alertErrorElement.removeAttribute("hidden");
        } else {
          // SERVER ERROR
          alertErrorElement.removeAttribute("hidden");
          alertErrorElementBody.innerHTML +=
            "Server error. We're sorry, but this submission was not successful. The Product Team has been notified.";
        }
      }
    },
    ajaxPost: function (form, callback) {
      var url = form.action;
      var xhr = new XMLHttpRequest();

      // for each form question
      var params = {
        answer_01:
          form.querySelector("#answer_01") &&
          form.querySelector("#answer_01").value,
        answer_02:
          form.querySelector("input[name=answer_02]:checked") &&
          Array.apply(
            null,
            form.querySelectorAll("input[name=answer_02]:checked")
          )
            .map(function (x) {
              return x.value;
            })
            .join(","),
        answer_03:
          form.querySelector("#answer_03") &&
          form.querySelector("#answer_03").value,
      };

      // Combine Referrer and Pathname with Form-specific params
      params["referer"] = d.referrer;
      params["page"] = window.location.pathname;
      params["location_code"] = form.querySelector("#fba_location_code")
        ? form.querySelector("#fba_location_code").value
        : null;
      params["fba_directive"] = form.querySelector("#fba_directive")
        ? form.querySelector("#fba_directive").value
        : null;
      params["language"] = "en";

      // Submit Feedback with a POST
      xhr.open("POST", url);
      xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8;");
      xhr.onload = callback.bind(this);
      xhr.send(
        JSON.stringify({
          submission: params,
        })
      );
    },
    pagination: function () {
      var previousButtons = document.getElementsByClassName("previous-section");
      var nextButtons = document.getElementsByClassName("next-section");

      var self = this;
      for (var i = 0; i < previousButtons.length; i++) {
        previousButtons[i].addEventListener(
          "click",
          function (e) {
            e.preventDefault();
            var currentPage = e.target.closest(".section");
            if (!this.validateForm(currentPage)) return false;
            currentPage.classList.remove("visible");
            currentPage.previousElementSibling.classList.add("visible");
            window.scrollTo(0, 0);
          }.bind(self)
        );
      }

      for (var i = 0; i < nextButtons.length; i++) {
        nextButtons[i].addEventListener(
          "click",
          function (e) {
            e.preventDefault();
            var currentPage = e.target.closest(".section");
            if (!this.validateForm(currentPage)) return false;
            currentPage.classList.remove("visible");
            currentPage.nextElementSibling.classList.add("visible");
            window.scrollTo(0, 0);
          }.bind(self)
        );
      }
    },
  };
}

// Form Settings
var formOptions = {
  modalButtonText: "How can we improve this site?",
};

const touchpointForm5b1efe87 = new FBAform(document, window).init(formOptions);
