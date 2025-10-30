const { test, describe, beforeEach, afterEach, beforeAll, afterAll, expect } = require('@playwright/test');
const { chromium } = require('playwright');

const host = 'http://localhost:3000';

let browser;
let context;
let page;

let user = {
    email: "",
    password: "123456",
    confirmPass: "123456",
};

let eventName = "";

async function loginUser(page, email, password) {
    await page.goto(host)
    await page.click('text=Login')
    await page.waitForSelector('form')
    await page.locator('#email').fill(email)
    await page.locator('#password').fill(password)
    await page.click('[type="submit"]')
    await page.waitForURL(host + '/')
    await page.waitForSelector('nav >> text=Logout')
}

describe("e2e tests", () => {
    beforeAll(async () => {
        browser = await chromium.launch();
    });

    afterAll(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        context = await browser.newContext();
        page = await context.newPage();
    });

    afterEach(async () => {
        await page.close();
        await context.close();
    });


    describe("authentication", () => {
        test('Registration with Valid Data', async () => {
            await page.goto(host)
            await page.click('text=Register')
            await page.waitForSelector('form')

            let random = Math.floor(Math.random() * 10000)
            user.email = `diddy_${random}@biggy.bg`

            await page.locator('#register-email').fill(user.email)
            await page.locator('#register-password').fill(user.password)
            await page.locator('#repeat-password').fill(user.confirmPass)

            await page.click('[type="submit"]')
            await page.waitForURL(host + '/')

            await expect(page.locator('nav >> text=Logout')).toBeVisible()
            expect(page.url()).toBe(host + '/')

        })

        test('Login with Valid Data', async () => {
            await loginUser(page, user.email, user.password)

            await expect(page.locator('nav >> text=Logout')).toBeVisible()
            expect(page.url()).toBe(host + '/')
        })

        test('Logout from the Application', async () => {
            await loginUser(page, user.email, user.password)
            await page.locator('nav >> text=Logout').click()
            await page.waitForURL(host + '/')

            await expect(page.locator('nav >> text=Login')).toBeVisible()
            expect(page.url()).toBe(host + '/')

        })
    });




    describe("navbar", () => {
        test('Navigation for Logged-In User Testing', async () => {
            await loginUser(page, user.email, user.password)

            await expect(page.locator('nav >> text=Events')).toBeVisible()
            await expect(page.locator('nav >> text=Add Event')).toBeVisible()
            await expect(page.locator('nav >> text=Logout')).toBeVisible()
            await expect(page.locator('nav >> text=Login')).toBeHidden()
            await expect(page.locator('nav >> text=Register')).toBeHidden()

        })

        test('Navigation for Guest User Testing', async () => {
            await page.goto(host)

            await expect(page.locator('nav >> text=Login')).toBeVisible()
            await expect(page.locator('nav >> text=Add Event')).toBeHidden()
            await expect(page.locator('nav >> text=Logout')).toBeHidden()
            await expect(page.locator('nav >> text=Register')).toBeVisible()


        })
    });

    describe("CRUD", () => {

        test('Add an Event Testing', async () => {
            await loginUser(page, user.email, user.password)
            await page.locator('nav >> text=Add Event').click()
            await page.goto(host + '/add-event')

            let random = Math.floor(Math.random() * 100000)
            eventName = `The best event ever existed_${random}`

            await page.fill('#name', eventName);
            await page.fill('#event-image', 'images/89a9c6ce4e5aad93ce2ef63e5ff5778d.jpg')
            await page.fill('#event-category', 'Party')
            await page.fill('#event-description', 'No phones during the party')
            await page.fill('#date', 'Every night and 10pm at our place')

            await page.click('[type="submit"]')

            await page.waitForURL(host + '/dashboard')

            await expect(page.url()).toBe(host + '/dashboard')
        })


        test('Edit an event', async () => {
            await page.goto(host)
            await page.locator('nav >> text=Login').click()
            await page.locator('#email').fill(user.email)
            await page.locator('#password').fill(user.password)
            await page.click('[type="submit"]')

            await page.click('text=Events')
            await page.waitForSelector('.event')

            const divEvent = page.locator('.event').filter({ hasText: eventName })
            await divEvent.locator('text=Details').click()

            await page.click('#edit-btn')
            await page.waitForSelector('form')

            const newTitle = eventName + '-edited'
            await page.fill('#name', newTitle)
            await page.click('[type="submit"]')

            await expect(page.locator('#details-title')).toContainText(newTitle)
        })

        test('Delete an event', async () => {
            await page.goto(host)
            await page.locator('nav >> text=Login').click()
            await page.locator('#email').fill(user.email)
            await page.locator('#password').fill(user.password)
            await page.click('[type="submit"]')

            await page.click('text=Events')
            await page.waitForSelector('.event')

            const divEvent = page.locator('.event').filter({ hasText: eventName })
            await divEvent.locator('text=Details').click()

            page.once('dialog', dialog => dialog.accept())

            await page.locator('#delete-btn').click()

            await page.waitForURL(host + '/dashboard')
            await expect(page.locator(`.event:has-text("${eventName}")`)).toHaveCount(0)
        })
    });
});