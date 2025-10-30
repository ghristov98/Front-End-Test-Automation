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

let albumName = "";

async function loginUser(page, email, password) {
    await page.goto(host)
    await page.click('text=Login')
    await page.waitForSelector('form')
    await page.locator('#email').fill(email)
    await page.locator('#password').fill(password)
    await page.click('[type="submit"]')
    await page.waitForURL(host)
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
            user.email = `test_${random}@example.com`

            await page.locator('#email').fill(user.email)
            await page.locator('#password').fill(user.password)
            await page.locator('#conf-pass').fill(user.confirmPass)

            await page.click('[type="submit"]')
            await page.waitForURL(host + '/')

            await expect(page.locator('nav >> text=Logout')).toBeVisible()
            expect(page.url()).toBe(host + '/')

        })

        test('Login with Valid Data', async () => {
            await loginUser(page, user.email, user.password)

            await expect(page.locator('nav >>text=Logout')).toBeVisible()
            expect(page.url()).toBe(host + '/')
        })

        test('Logout from Application', async () => {
            await loginUser(page, user.email, user.password)
            await page.locator('nav >> text=Logout').click()
            await page.waitForURL(host + '/')
            await expect(page.locator('nav >>text=Login')).toBeVisible()
            expect(page.url()).toBe(host + '/')
        })
    });

    describe("navbar", () => {

        test('Navigation for Logged-In User', async () => {
            await loginUser(page, user.email, user.password)
            await expect(page.locator('nav >>text=Logout')).toBeVisible()
            await expect(page.locator('nav >>text=Create Album')).toBeVisible()
            await expect(page.locator('nav >>text=Search')).toBeVisible()
            await expect(page.locator('nav >>text=Catalog')).toBeVisible()
            await expect(page.locator('nav >>text=Home')).toBeVisible()
        })

        test('Navigation for Guest User', async () => {
            await page.goto(host)
            await expect(page.locator('nav >>text=Register')).toBeVisible()
            await expect(page.locator('nav >>text=Login')).toBeVisible()
            await expect(page.locator('nav >>text=Search')).toBeVisible()
            await expect(page.locator('nav >>text=Catalog')).toBeVisible()
            await expect(page.locator('nav >>text=Home')).toBeVisible()
        })

    });

    describe("CRUD", () => {
        beforeEach(async () => {
            await loginUser(page, user.email, user.password)
        })
        test('Create an Album', async () => {
            await page.click('text=Create Album')
            await page.waitForSelector('form')

            let random = Math.floor(Math.random() * 10000)
            albumName = `Cool album_${random}`

            await page.locator('#name').fill(albumName)
            await page.locator('#imgUrl').fill('images/Lorde.jpg')
            await page.locator('#price').fill('15')
            await page.locator('#releaseDate').fill('1/1/2026')
            await page.locator('#genre').fill('Rock')
            await page.locator('[name="description"]').fill('Good album for real')

            await page.click('[type = "submit"]')
            await page.waitForURL(host + '/catalog')
            await expect(page.locator('div.text-center p.name'), {hasText: albumName}).toHaveCount(1)
            expect(page.url()).toBe(host + '/catalog')

        });
        test('Edit an Album', async () => {
            await page.click('text=Search')
            await page.locator('#search-input').fill(albumName)
            await page.click('.button-list')
            await page.locator('text=Details').first().click()
            await page.click('text=Edit')
            await page.waitForSelector('form')

            albumName = albumName + '- edited'
            await page.locator('#name').fill(albumName)

            await page.click('[type="submit"]')
            await expect(page.locator('h1', { hasText: `Name: ${albumName}` })).toHaveCount(1)
        });
        test('Delete an Album', async () => {
            await page.click('text=Search')
            await page.locator('#search-input').fill(albumName)
            await page.click('.button-list')
            await page.locator('text=Details').first().click()
            await page.click('text=Delete')
            await page.waitForURL(host + '/catalog')
            expect(page.url()).toBe(host + '/catalog')
        });
    });
});