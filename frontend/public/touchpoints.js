/* eslint-disable no-undef */
/**
 * Script taken from our touchpoints configuration here: https://touchpoints.app.cloud.gov/touchpoints/5b1efe87.js
 */

// Form components are namespaced under 'fba' = 'Feedback Analytics'

function FBAform(d) {
  return {
    formId: "5b1efe87",
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
      var touchpointForm =
        document.getElementsByClassName("touchpoint-form")[0];
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
        if (x === 27 && self.dialogOpen === true) {
          self.closeDialog();
        }
      });
      d.addEventListener("click", function (event) {
        self.handleClick(event);
      });
    },
    loadCss: function () {
      const urlPrefix = String(window.location.href).includes("localhost")
        ? ""
        : "/app/static/";
      let link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = `${urlPrefix}touchpoints.css`;
      link.media = "all";
      d.head.appendChild(link);
    },
    loadHtml: function () {
      this.dialogEl = document.createElement("div");
      this.dialogEl.setAttribute("hidden", true);
      this.dialogEl.setAttribute("class", "fba-modal");
      this.dialogEl.setAttribute("role", "dialog");
      this.dialogEl.setAttribute("aria-modal", "true");
      this.dialogEl.innerHTML = touchpointsFormHtmlString;
      d.querySelector("footer").appendChild(this.dialogEl);

      d.querySelector(".fba-modal-close").addEventListener(
        "click",
        this.handleDialogClose.bind(this),
        false
      );
      var otherElements = d.querySelectorAll(".usa-input.other-option");
      for (let i = 0; i < otherElements.length; i++) {
        otherElements[i].addEventListener(
          "keyup",
          this.handleOtherOption.bind(this),
          false
        );
      }
      var phoneElements = d.querySelectorAll("input[type='tel']");
      for (let i = 0; i < phoneElements.length; i++) {
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
      var alertElementHeading =
        formComponent.getElementsByClassName("usa-alert__heading")[0];
      var alertElementBody =
        formComponent.getElementsByClassName("usa-alert__text")[0];
      var alertErrorElement = formComponent.querySelector(".fba-alert-error");
      var alertErrorElementBody =
        alertErrorElement.getElementsByClassName("usa-alert__text")[0];
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
      if (other_val === "") other_val = "other";
      var option = this.formElement().querySelector(selectorId);
      option.checked = true;
      option.value = other_val;
    },
    handlePhoneInput: function (e) {
      var number = e.srcElement.value.replace(/[^\d]/g, "");
      if (number.length === 7) {
        number = number.replace(/(\d{3})(\d{4})/, "$1-$2");
      } else if (number.length === 10) {
        number = number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      }
      e.srcElement.value = number;
    },
    handleEmailInput: function (e) {
      var EmailRegex =
        /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      var email = e.srcElement.value.trim();
      if (email.length === 0) {
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
        if (item.value.length === 0) {
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
        if (item.value.length === 0) {
          delete questions[item.name];
        } else {
          var EmailRegex =
            /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
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
        if (item.value.length === 0) {
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
      elem = form.querySelector("#input-error-message");
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
    showFormSuccess: function () {
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
      var alertElementBody =
        formComponent.getElementsByClassName("usa-alert__text")[0];
      var alertErrorElement = formComponent.querySelector(".fba-alert-error");
      var alertErrorElementBody =
        alertErrorElement.getElementsByClassName("usa-alert__text")[0];
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

      for (let i = 0; i < nextButtons.length; i++) {
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

// Note: When updating Touchpoints you need to update this HTML
// To whoever has to maintain this, I'm sorry this is so gross.
var touchpointsFormHtmlString = `
  <div class="fba-modal">
    <div id="fba-modal-dialog" class="fba-modal-dialog" role="dialog" aria-modal="true">
      <div class="touchpoints-form-wrapper" id="touchpoints-form-5b1efe87" data-touchpoints-form-id="5b1efe87" tabindex="-1">
        <div class="wrapper">
          <h2 class="justify-vertical word-break fba-modal-title">
            Help improve SimpleReport
          </h2>
          <a class="fba-modal-close" type="button" href="#">×</a>
          <p class="fba-instructions">
            If you need immediate help with an issue, please contact 
            <a href="mailto:support@simplereport.gov">
            support@simplereport.gov</a> or visit our 
            <a href="https://www.simplereport.gov/support/">
            Support page</a>.
          </p>
          <div class="fba-alert usa-alert usa-alert--success" role="status" hidden="">
            <div class="usa-alert__body">
              <h3 class="usa-alert__heading">
                Success
              </h3>
              <p class="usa-alert__text">
                Thanks for your feedback!
              </p>
            </div>
          </div>
          <div class="fba-alert-error usa-alert usa-alert--error" role="alert" hidden="">
            <div class="usa-alert__body">
              <h3 class="usa-alert__heading">
                Error
              </h3>
              <p class="usa-alert__text">
                alert message
              </p>
            </div>
          </div>
          <form action="https://touchpoints.app.cloud.gov/touchpoints/5b1efe87/submissions.json" method="POST">
            <div class="touchpoints-form-body">
              <input type="hidden" name="fba_location_code" id="fba_location_code" autocomplete="off">
              <input type="text" name="fba_directive" id="fba_directive" style="display:none !important" tabindex="-1" autocomplete="off">
                <div class="section visible">
                  <div class="questions">
                    <div class="question white-bg">
                      <div class="touchpoints-form-text-display" id="answer_04">
                        <h3>Provide feedback on SimpleReport</h3>
                      </div>
                    </div>
                    <div class="question white-bg">
                      <div role="group">
                        <label class="usa-label" for="answer_01">
                          What do you think about SimpleReport? Please share feedback on anything you like, or how we can improve.
                        </label>
                        <textarea name="answer_01" id="answer_01" class="usa-textarea" required="required" maxlength="100000"></textarea>
                      </div>
                    </div>
                    <div class="question white-bg">
                      <fieldset class="usa-fieldset" role="group">
                        <legend class="usa-sr-only"></legend>
                        <div class="usa-label">
                        </div>
                        <div class="question-options" id="answer_02">
                          <div class="usa-checkbox" id="question_option_10594" data-id="10594">
                            <input type="checkbox" name="answer_02" id="answer_02_1" value="I’m interested in providing more feedback about SimpleReport (usually via a video call)." multiple="multiple" class="usa-checkbox__input usa-checkbox__input--tile">
                            <label for="answer_02_1" class="usa-checkbox__label">I’m interested in providing more feedback about SimpleReport (usually via a video call).</label>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                    <div class="question white-bg">      
                      <div role="group">
                        <label class="usa-label" for="answer_03">
                          Email
                        </label>
                        <input type="email" name="answer_03" id="answer_03" class="usa-input">
                      </div>
                    </div>
                  </div>
                  <p class="submit-button">
                    <button type="submit" class="usa-button submit_form_button">Submit</button>
                  </p>
                </div>
              </div>
            </form>
          </div>
          <div class="touchpoints-form-disclaimer">
            <hr style="border: none; border-top: 1px solid #E5E5E5;">
            <div class="grid-container">
              <div class="grid-row">
                <div class="grid-col-12">
                  <small id="fba-dialog-privacy">
                    <a href="https://www.gsa.gov/reference/gsa-privacy-program/privacy-act-statement-for-design-research" target="_blank" rel="noopener">Privacy Act Statement for Design Research</a>
                      |
                    <a href="https://www.simplereport.gov/support/">SimpleReport support</a>
                      | 
                    <a href="https://www.simplereport.gov/terms-of-service/">SimpleReport terms of service</a>
                   </small>
                 </div>
               </div>
            </div>
          </div>
          <div class="usa-banner">
            <header class="usa-banner__header touchpoints-footer-banner">
              <div class="usa-banner__inner">
                <div class="grid-col-auto">
                  <img class="usa-banner__header-flag" src="https://touchpoints.app.cloud.gov/assets/us_flag_small-9c507b1ff21f65c4b8f0c45d0e0d0a10bb5c9864c1a76e07aa3293da574968a1.png" alt="U.S. flag">
                </div>
                <div class="grid-col-fill tablet:grid-col-auto">
                  <p class="usa-banner__header-text">
                    An official form of the United States government.
                    Provided by
                    <a href="https://touchpoints.app.cloud.gov/" target="_blank" rel="noopener">Touchpoints</a>
                    <br>
                  </p>
                </div>
              </div>
            </header>
          </div>
        </div>
      </div>
    </div>`;

new FBAform(document).init(formOptions);
