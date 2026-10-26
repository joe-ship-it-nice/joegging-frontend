import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import process from 'node:process'
import { URL } from 'node:url'

async function signIn(page) {
    await page.goto('/login')

    await page.getByLabel('Email address', { exact: true })
        .fill(process.env.E2E_EMAIL)

    await page.getByLabel('Password', { exact: true })
        .fill(process.env.E2E_PASSWORD)

    await page.getByRole('button', {
        name: /start joegging/i,
    }).click()

    await expect(page).toHaveURL(/\/feed\/?$/)

    await expect(
        page.getByRole('heading', { name: 'Share your run.' })
    ).toBeVisible()
}

test('email/password login survives a refresh', async ({ page }) => {
    await signIn(page)

    await page.reload()

    await expect(
        page.getByRole('heading', { name: 'Share your run.' })
    ).toBeVisible()

    await expect(
        page.getByRole('button', { name: /log out/i })
    ).toBeVisible()
})

test('creating a post saves it after refreshing', async ({ page }) => {
    await signIn(page)

    const title = `E2E running post ${randomUUID()}`
    const content = 'Automated test: completed a steady 5 km run.'

    await page.getByLabel('Title', { exact: true }).fill(title)
    await page.getByLabel('Your story', { exact: true }).fill(content)
    await page.getByLabel('Public', { exact: true }).check()

    const responsePromise = page.waitForResponse((response) => {
        const url = new URL(response.url())

        return (
            url.pathname === '/posts' &&
            response.request().method() === 'POST'
        )
    })

    await page.getByRole('button', {
        name: /share with the club/i,
    }).click()

    const response = await responsePromise
    expect(response.status()).toBe(201)

    const post = page.getByRole('article').filter({
        has: page.getByRole('heading', {
            name: title,
            exact: true,
        }),
    })

    await expect(post).toBeVisible()
    await expect(post).toContainText(content)

    await page.reload()

    await expect(post).toBeVisible()
    await expect(post).toContainText(content)
})