import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import process from 'node:process'

dotenv.config({ path: '.env.test' })
dotenv.config({ path: '.env' })

const requiredVariables = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'E2E_EMAIL',
    'E2E_PASSWORD',
]

for (const name of requiredVariables) {
    if (!process.env[name]) {
        throw new Error(`Missing test environment variable: ${name}`)
    }
}

export default defineConfig({
    testDir: './e2e',
    fullyParallel: false,
    workers: 1,
    forbidOnly: Boolean(process.env.CI),
    retries: 0,
    timeout: 60_000,

    expect: {
        timeout: 15_000,
    },

    reporter: [
        ['list'],
        ['html', { open: 'never' }],
    ],

    use: {
        baseURL: 'http://localhost:5173',
        trace: 'off',
        screenshot: 'off',
        video: 'off',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    webServer: [
        {
            command: 'npm start',
            cwd: '../JOEGGING-backend',
            url: 'http://localhost:3000/posts',
            reuseExistingServer: false,
            timeout: 60_000,
            env: {
                PORT: '3000',
                SUPABASE_URL: process.env.VITE_SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY:
                    process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
        },
        {
            command: 'npm run dev -- --port 5173 --strictPort',
            url: 'http://localhost:5173',
            reuseExistingServer: false,
            timeout: 60_000,
            env: {
                VITE_API_URL: 'http://localhost:3000',
            },
        },
    ],
})