# Rite - DJ Event Management Platform

This is a DJ event management platform built with [Next.js](https://nextjs.org/) and [Convex](https://convex.dev/).

## Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) with React 18, TypeScript, and Turbopack
- **Backend**: [Convex](https://convex.dev/) for real-time database and file storage
- **Authentication**: [NextAuth v5](https://authjs.dev/) with Instagram OAuth integration
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with shadcn/ui components
- **Validation**: [ArkType](https://arktype.io/) for high-performance schema validation
- **Package Manager**: npm

## Get started

If you just cloned this codebase and didn't use `npm create convex`, run:

```
npm install
npm run dev
```

## Environment Setup

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_DEPLOY_KEY=your_convex_deploy_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_OAUTH_PROXY_URL=https://rite-instagram-oauth-proxy.sehyunchung.workers.dev
```

## Learn more

To learn more about developing your project with Convex, check out:

- The [Tour of Convex](https://docs.convex.dev/get-started) for a thorough introduction to Convex principles.
- The rest of [Convex docs](https://docs.convex.dev/) to learn about all Convex features.
- [Stack](https://stack.convex.dev/) for in-depth articles on advanced topics.

## Join the community

Join thousands of developers building full-stack apps with Convex:

- Join the [Convex Discord community](https://convex.dev/community) to get help in real-time.
- Follow [Convex on GitHub](https://github.com/get-convex/), star and contribute to the open-source implementation of Convex.
