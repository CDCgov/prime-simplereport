const { execSync, spawn } = require("child_process");

const downloadWiremock = () => execSync("./e2e/utils/download-wiremock.sh");
const startWiremock = () => {
  const wm = spawn("./e2e/utils/start-wiremock.sh");
  execSync("./e2e/utils/ping-wiremock.sh");
  return wm;
};
const stopWiremock = () => execSync("./e2e/utils/stop-wiremock.sh");

let wm;

module.exports = {
  before: () => {
    downloadWiremock();
  },
  beforeEach: () => {
    wm = startWiremock();
  },
  afterEach: () => {
    wm.kill();
  },
  after: () => {
    stopWiremock();
  },
  "1. Account creation w/ SMS MFA": (browser) => {
    browser.page
      .accountCreation()
      .navigate("/uac/?activationToken=h971awbXda7y7jGaxN8f")
      .setPassword()
      .setSecurityQuestion()
      .mfaSelect("@smsMfaRadio")
      .enterPhoneNumber()
      .verifySecurityCode("033457")
      .success();
  },
  "2. Account creation w/ Okta Verify MFA": (browser) => {
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
  },
  "3. Account creation w/ Google Authenticator MFA": (browser) => {
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
  },
  "4. Account creation w/ Voice Call MFA": (browser) => {
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
  },
  "5. Account creation w/ Email MFA": (browser) => {
    browser
      .deleteCookies()
      .page.accountCreation()
      .navigate("/uac/?activationToken=4OVwdVhc6M1I-UwvLrNX")
      .setPassword()
      .setSecurityQuestion()
      .mfaSelect("@emailMfaRadio")
      .verifySecurityCode("007781")
      .success();
  },
};
