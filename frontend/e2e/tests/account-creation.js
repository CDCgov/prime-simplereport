const { execSync, spawn } = require("child_process");

const startWiremock = () => spawn("./e2e/utils/start-wiremock.sh");

module.exports = {
  // "@disabled": true,
  "1. Account creation w/ SMS MFA": (browser) => {
    execSync("./e2e/utils/download-wiremock.sh");
    const wm = startWiremock();
    browser.page
      .accountCreation()
      .navigate("/uac/?activationToken=h971awbXda7y7jGaxN8f")
      .setPassword()
      .setSecurityQuestion()
      .mfaSelect("@smsMfaRadio")
      .enterPhoneNumber()
      .verifySecurityCode("033457")
      .success();
    wm.kill();
  },
  "2. Account creation w/ Okta Verify MFA": (browser) => {
    const wm = startWiremock();
    browser
      .deleteCookies()
      .page.accountCreation()
      .navigate("/uac/?activationToken=NOr20VqF5M6m8AnwcSUJ")
      .setPassword()
      .setSecurityQuestion()
      .mfaSelect("@oktaMfaRadio")
      .scanQrCode()
      .verifySecurityCode("543663")
      .success();
    wm.kill();
  },
  "3. Account creation w/ Google Authenticator MFA": (browser) => {
    const wm = startWiremock();
    browser
      .deleteCookies()
      .page.accountCreation()
      .navigate("/uac/?activationToken=gqYPzH1FlPzVr0U3tQ7H")
      .setPassword()
      .setSecurityQuestion()
      .mfaSelect("@googleMfaRadio")
      .scanQrCode()
      .verifySecurityCode("985721")
      .success();
    wm.kill();
  },
  "4. Account creation w/ Voice Call MFA": (browser) => {
    const wm = startWiremock();
    browser
      .deleteCookies()
      .page.accountCreation()
      .navigate("/uac/?activationToken=wN5mR-8SXao1TP2PLaFe")
      .setPassword()
      .setSecurityQuestion()
      .mfaSelect("@voiceMfaRadio")
      .enterPhoneNumber()
      .verifySecurityCode("30835")
      .success();
    wm.kill();
  },
  "5. Account creation w/ Email MFA": (browser) => {
    const wm = startWiremock();
    browser
      .deleteCookies()
      .page.accountCreation()
      .navigate("/uac/?activationToken=4OVwdVhc6M1I-UwvLrNX")
      .setPassword()
      .setSecurityQuestion()
      .mfaSelect("@emailMfaRadio")
      .verifySecurityCode("007781")
      .success();
    wm.kill();
  },
};
