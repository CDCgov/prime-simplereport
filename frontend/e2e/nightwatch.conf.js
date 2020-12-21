// Refer to the online docs for more details: https://nightwatchjs.org/gettingstarted/configuration/

module.exports = {
  // An array of folders (excluding subfolders) where your tests are located;
  // if this is not specified, the test source must be passed as the second argument to the test runner.
  src_folders: ['e2e/tests'],

  // See https://nightwatchjs.org/guide/working-with-page-objects/
  page_objects_path: 'e2e/pages',

  // See https://nightwatchjs.org/guide/extending-nightwatch/#writing-custom-commands
  custom_commands_path: '', // 'e2e/commands',

  // See https://nightwatchjs.org/guide/extending-nightwatch/#writing-custom-assertions
  custom_assertions_path: 'e2e/assertions',

  // See https://nightwatchjs.org/guide/#external-globals
  globals_path: '',

  webdriver: {},

  test_settings: {
    default: {
      disable_error_log: false,
      launch_url: 'http://localhost:3000',

      globals: {
        waitForConditionTimeout: 3000,
      },

      screenshots: {
        enabled: false,
        path: 'screens',
        on_failure: true,
      },

      desiredCapabilities: {
        browserName: 'firefox',
        acceptInsecureCerts: true,
      },

      webdriver: {
        start_process: true,
        port: 4444,
        server_path: './node_modules/.bin/geckodriver',
      },
    },

    selenium: {
      selenium: {
        start_process: false,
        port: 4444,
        cli_args: {
          'webdriver.gecko.driver': './node_modules/.bin/geckodriver',
          'webdriver.chrome.driver': './node_modules/.bin/chromedriver',
        },
      },

      webdriver: {
        start_process: false,
        default_path_prefix: '/wd/hub',
      },
    },

    'selenium.firefox': {
      extends: 'selenium',
      desiredCapabilities: {
        browserName: 'firefox',
        'moz:firefoxOptions': {
          args: ['-headless'],
          prefs: {
            'browser.download.dir': '/app/downloads',
            'browser.download.folderList': 2,
            'browser.download.manager.showWhenStarting': false,
            'browser.download.manager.useWindow': false,
            'browser.download.manager.focusWhenStarting': false,
            'browser.download.manager.showAlertOnComplete': false,
            'browser.download.manager.closeWhenDone': true,
            'browser.helperApps.neverAsk.saveToDisk': 'text/csv',
            'browser.helperApps.neverAsk.openFile': 'text/csv',
            'browser.helperApps.alwaysAsk.force': false,
          },
        },
      },
    },

    'selenium.chrome': {
      extends: 'selenium',
      desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          prefs: {
            'download.default_directory': '/app/downloads',
            'download.prompt_for_download': false,
          },
        },
      },
    },
  },
};
