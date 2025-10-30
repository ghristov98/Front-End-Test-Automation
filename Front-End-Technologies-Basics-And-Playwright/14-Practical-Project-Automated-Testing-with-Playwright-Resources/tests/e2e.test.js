const { test, describe, beforeEach, afterEach, beforeAll, afterAll, expect } = require('@playwright/test');
const { chromium } = require('playwright');

const host = 'http://localhost:3000';

let browser;
let context;
let page;

let user = {
    email: '',
    invalidEmail: 'invalidEmail',
    password: '123456',
    confirmPassword: '123456',
};

let game = {
    title: '',
    category: '',
    id: '',
    maxLevel: '99',
    imageURL: 'https://www.pngplay.com/wp-content/uploads/11/League-Of-Legends-Logo-Download-Free-PNG.png',
    summary: 'This is an amazing game !',
};

describe('E2E tests', () => {
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
        await context.close();
        await page.close();
    });

    describe('authentication tests', () => {

        // Registration tests

        test('Register with Valid Data', async () => {
            await page.goto(host);
            await page.click('text=Register');
            await page.waitForSelector('#register');
            let random = Math.floor(Math.random() * 10000);
            user.email = `test_${random}@example.com`;
            await page.locator('#email').fill(user.email);
            await page.locator('#register-password').fill(user.password);
            await page.locator('#confirm-password').fill(user.confirmPassword);
            await Promise.all([
                page.waitForURL(host + '/'),
                page.click('[type="submit"]'),
            ]);

            await expect(page.locator('nav >> text=Logout')).toBeVisible();
            expect(page.url()).toBe(host + '/');
        });

        test('Register Cannot be Done with Empty Fields', async () => {
            await page.goto(host);
            await page.click('text=Register');
            await page.waitForSelector('#register');
            await page.locator('#email').fill('');
            await page.locator('#register-password').fill('');
            await page.locator('#confirm-password').fill('');
            await page.click('[type="submit"]');
            expect(page.url()).toBe(host + '/register');
        });

        test('Register Cannot be Done with Invalid Email', async () => {
            await page.goto(host);
            await page.click('text=Register');
            await page.waitForSelector('#register');
            await page.locator('#email').fill('invalidEmail');
            await page.locator('#register-password').fill(user.password);
            await page.locator('#confirm-password').fill(user.confirmPassword);
            await page.click('[type="submit"]');
            expect(page.url()).toBe(host + '/register');
        });

        test('Register with Non-Matching Passwords', async () => {
            await page.goto(host);
            await page.click('text=Register');
            await page.waitForSelector('#register');
            let random = Math.floor(Math.random() * 10000);
            user.email = `test_${random}@example.com`;
            await page.locator('#email').fill(user.email);
            await page.locator('#register-password').fill(user.password);
            await page.locator('#confirm-password').fill('differentPassword');
            await page.click('[type="submit"]');
            expect(page.url()).toBe(host + '/register');
        });

        test('Register with Existing Email', async () => {
            await page.goto(host);
            await page.click('text=Register');
            await page.waitForSelector('#register');
            await page.locator('#email').fill(user.email);
            await page.locator('#register-password').fill(user.password);
            await page.locator('#confirm-password').fill(user.confirmPassword);
            await page.click('[type="submit"]');
            await expect(page.locator('nav >> text=Logout')).toBeVisible();
            expect(page.url()).toBe(host + '/');
        });

        // Login tests

        test('Login with Valid Credentials', async () => {
            await page.goto(host);
            await page.click('text=Login');
            await page.waitForSelector('#login');
            await page.locator('#email').fill(user.email);
            await page.locator('#login-password').fill(user.password);
            await page.click('[type="submit"]');
            await expect(page.locator('nav >> text=Logout')).toBeVisible();
            expect(page.url()).toBe(host + '/');
        });

        test('Login Cannot be Done with Empty Fields', async () => {
            await page.goto(host);
            await page.click('text=Login');
            await page.waitForSelector('#login');
            await page.locator('#email').fill('');
            await page.locator('#login-password').fill('');
            await page.click('[type="submit"]');
            expect(page.url()).toBe(host + '/login');
        });

        test('Login Cannot be Done with Invalid Email', async () => {
            await page.goto(host);
            await page.click('text=Login');
            await page.waitForSelector('#login');
            await page.locator('#email').fill('invalidEmail');
            await page.locator('#login-password').fill(user.password);
            await page.click('[type="submit"]');
            expect(page.url()).toBe(host + '/login');
        });

        test('Login Cannot be Done with Wrong Password', async () => {
            await page.goto(host);
            await page.click('text=Login');
            await page.waitForSelector('#login');
            await page.locator('#email').fill(user.email);
            await page.locator('#login-password').fill('wrongPassword');
            await page.click('[type="submit"]');
            expect(page.url()).toBe(host + '/login');
        });

        test('Logout works', async () => {
            await page.goto(host);
            await page.click('text=Login');
            await page.waitForSelector('#login');
            await page.locator('#email').fill(user.email);
            await page.locator('#login-password').fill(user.password);
            await page.click('[type="submit"]');
            await expect(page.locator('nav >> text=Logout')).toBeVisible();
            await page.click('nav >> text=Logout');
            await expect(page.locator('text=Login')).toBeVisible();
            expect(page.url()).toBe(host + '/');
        });
    });

    describe('navbar tests', () => {

        // Logged in user

        test('Navbar links are Visible and Correct for Logged in User', async () => {
            await page.goto(host);
            await page.click('text=Login');
            await page.waitForSelector('#login');
            await page.locator('#email').fill(user.email);
            await page.locator('#login-password').fill(user.password);
            await page.click('[type="submit"]');
            await expect(page.locator('nav >> text=All games')).toBeVisible();
            await expect(page.locator('nav >> text=Create Game')).toBeVisible();
            await expect(page.locator('nav >> text=Logout')).toBeVisible();
            expect(page.url()).toBe(host + '/');
        });

        // Guest user

        test('Navbar links are Visible and Correct for Guest User', async () => {
            await page.goto(host);
            await expect(page.locator('nav >> text=All games')).toBeVisible();
            await expect(page.locator('nav >> text=Login')).toBeVisible();
            await expect(page.locator('nav >> text=Register')).toBeVisible();
            expect(page.url()).toBe(host + '/');
        });
    });

    describe('CRUD', () => {

        beforeEach(async () => {
            await page.goto(host);
            await page.click('text=Login');
            await page.waitForSelector('#login');
            await page.locator('#email').fill(user.email);
            await page.locator('#login-password').fill(user.password);
            
            await Promise.all([
                page.waitForURL(host + '/'),
                page.click('[type="submit"]'),
            ]);
        });

        // Create Game tests

        test('Create Game does not work with Empty Data', async () => {
            await page.click('text=Create Game');
            await page.waitForSelector('#create-page');
            await page.click('[type="submit"]');
            expect(page.url()).toBe(host + '/create');
        });

        test('Create Game works with Valid Data', async () => {
            await page.click('text=Create Game')
            await page.waitForSelector('#create')
            let random = Math.floor(Math.random() * 1000)
            game.title = `Game title number ${random}`
            game.category = `Game category ${random}`
            await page.fill('#title', game.title)
            await page.fill('#category', game.category)
            await page.fill('#maxLevel', game.maxLevel)
            await page.fill('#imageUrl', game.imageURL)
            await page.fill('#summary', game.summary)

            await Promise.all([
                page.waitForURL(host + '/'),
                page.click('[type="submit"]')
            ])

            await expect(page.locator('.game h3', { hasText: game.title })).toHaveCount(1)
            expect(page.locator('.game h3', { hasText: game.title })).toHaveCount(1)

            expect(page.url()).toBe(host + '/')

        })

        // Edit Game test

        test('Edit Game works with Valid Data', async () => {
            const initialGameCount = await page.locator('.game').count();
            await page.click('text=All games');
            await page.waitForSelector('.game-title');
            await page.click('.game-title >> text=' + game.title);
            await page.waitForSelector('#game-details');
            await page.click('text=Edit');
            await page.waitForSelector('#edit-page');
            game.title = game.title + ' Edited';
            await page.locator('#title').fill(game.title);
            await page.locator('#category').fill(game.category);
            await page.locator('#maxLevel').fill(game.maxLevel);
            await page.locator('#imageUrl').fill(game.imageURL);
            await page.locator('#summary').fill(game.summary);
            await Promise.all([
                page.waitForURL(host + '/'),
                page.click('[type="submit"]'),
            ]);
            await expect(page.locator('.game h3', { hasText: game.title })).toHaveCount(1)
            expect(page.locator('.game h3', { hasText: game.title })).toHaveCount(1)

            expect(page.url()).toBe(host + '/')
        });

        // Delete Game test

        test('Delete Game works', async () => {
            const initialGameCount = await page.locator('.game').count();
            await page.click('text=All games');
            await page.waitForSelector('.game-title');
            await page.click('.game-title >> text=' + game.title);
            await page.waitForSelector('#game-details');
            page.on('dialog', dialog => dialog.accept());
            await Promise.all([
                page.waitForURL(host + '/'),
                page.click('text=Delete'),
            ]);
            await expect(page.locator('.game h3').filter({ hasText: game.title })).toHaveCount(0);
            await expect(page.locator('.game')).toHaveCount(initialGameCount - 1);

            expect(page.url()).toBe(host + '/');
        });
    });
    describe('Home Page tests', () => {

        test('Home Page displays list of Games', async () => {
            await page.goto(host);
            await expect(page.locator('.welcome-message h2')).toHaveText('ALL new games are');
            await expect(page.locator('.welcome-message h3')).toHaveText('Only in GamesPlay');
            await expect(page.locator('#home-page h1')).toHaveText('Latest Games');
        });
    });
});