# Joegging 🏃

Joegging is a full-stack running community. Runners can share training tips, upload running photos, and connect with other runners.

The project extends **Joefriends API**, keeping its posts and friendship features while adding Google OAuth, photo uploads, automated browser tests, and deployment workflows.

## Preview

![Joegging running community feed](./public/screenshot.png)

## Live Application

- [Joegging website](https://joegging-frontend.vercel.app)
- [Backend API](https://joegging-backend.vercel.app/posts)
- [Frontend repository](https://github.com/joe-ship-it-nice/joegging-frontend)
- [Backend repository](https://github.com/joe-ship-it-nice/joegging-backend)

## Features

- Email/password signup and login.
- Google OAuth through Supabase Authentication.
- Running posts with titles and stories.
- Public and friends-only post visibility.
- Optional JPG, PNG, or WebP photos up to 5 MB.
- Photo storage through Supabase Storage.
- Runner profiles.
- Running-video background with playback controls.

## Tech Stack

| Area | Technology |
|---|---|
| Frontend | React and Vite |
| Routing | React Router |
| Authentication state | React Context |
| Authentication | Supabase Authentication |
| Image storage | Supabase Storage |
| Backend | Existing Express API extended from Joefriends |
| Database | Supabase PostgreSQL |
| Browser testing | Playwright |
| Code checks | ESLint |
| Continuous integration | GitHub Actions |
| Hosting | Vercel |

## Git Workflow

Frontend work has used these branches:

- `feature/add-automated-tests`
- `feature/configure-deployment`
- `feature/add-google-oauth`
- `feature/add-image-posts`

Changes are reviewed through pull requests before merging into `main`.

OAuth and image uploads were initially implemented before the feature branches were created. Their later branches contain review improvements and fixes rather than claiming to recreate the original implementation history.

## Test Account

Use this demo account to try login Joegging:

- Email: joe@joe.com
- Password: JOEJOEJOE

## Author

**Lim Joe Onn**

*Keep moving. Keep Joegging.*