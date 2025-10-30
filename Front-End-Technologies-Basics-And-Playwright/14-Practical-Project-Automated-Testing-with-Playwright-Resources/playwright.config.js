const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({

    testDir: './tests',
    fullyParallel: false,
    workers: 1,
    timeout: 60 * 1000,
    reporter: 'html',

    // Settings for all tests

    use:{
        baseURL: 'http://localhost:3000/',

        // Visualization
        headless: true,
        slowMo: 2500,
        viewport: { width: 1200, height: 840 },

        // Debugging
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',

    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            lauchOptions: {
                slowMo: 500,
                args:[
                    '--start-maximized'
                ]
          },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            launchOptions: {
                slowMo: 500,
                args:[
                    '--start-maximized'
                ]
            },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
            launchOptions: {
                slowMo: 500,
                args:[
                    '--start-maximized'
                ]
            },
        },
    ],

    webServer: [
        {
            command: 'npm run start', // FE server command
            port: 3000,
            timeout: 120 * 1000,
            reuseExistingServer: !process.env.CI,
        },
         {
            command: 'npm run server', // BE server command
            port: 3030,
            timeout: 120 * 1000,
            reuseExistingServer: !process.env.CI,
        }
    ]

});

// After that, go to package.json and add a new script right under "test": "playwright test"
// "test:headed": "playwright test --headed"