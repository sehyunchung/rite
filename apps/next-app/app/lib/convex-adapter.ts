import type { Adapter } from "@auth/core/adapters"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@rite/backend/convex/_generated/api"
import { Id, Doc } from "@rite/backend/convex/_generated/dataModel"

// Utility function to safely cast optional account fields
function safeString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function safeNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined
}

export function ConvexAdapter(convex: ConvexHttpClient): Adapter {
  return {
    async createUser(user) {
      const userId = await convex.mutation(api.auth.createUser, {
        email: user.email || '',
        name: user.name || undefined,
        image: user.image || undefined,
        emailVerified: user.emailVerified?.getTime(),
      })
      
      return {
        id: userId,
        email: user.email || '',
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
      }
    },

    async getUser(id) {
      // id here is the NextAuth UUID, need to find user by nextAuthId
      const userDoc = await convex.query(api.auth.getUserByNextAuthId, { nextAuthId: id })
      if (!userDoc) return null
      
      return {
        id: id, // Return the NextAuth UUID, not Convex ID
        email: userDoc.email,
        name: userDoc.name,
        image: userDoc.image,
        emailVerified: userDoc.emailVerified ? new Date(userDoc.emailVerified) : null,
      }
    },

    async getUserByEmail(email) {
      const userDoc = await convex.query(api.auth.getUserByEmail, { email })
      if (!userDoc) return null
      
      return {
        id: userDoc._id,
        email: userDoc.email,
        name: userDoc.name,
        image: userDoc.image,
        emailVerified: userDoc.emailVerified ? new Date(userDoc.emailVerified) : null,
      }
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await convex.query(api.auth.getAccountByProvider, {
        provider,
        providerAccountId,
      })
      if (!account) return null
      
      const userDoc = await convex.query(api.auth.getUser, { userId: account.userId })
      if (!userDoc) return null
      
      return {
        id: userDoc._id,
        email: userDoc.email,
        name: userDoc.name,
        image: userDoc.image,
        emailVerified: userDoc.emailVerified ? new Date(userDoc.emailVerified) : null,
      }
    },

    async updateUser({ id, ...user }) {
      await convex.mutation(api.auth.updateUser, {
        userId: id as Id<"users">,
        email: user.email || undefined,
        name: user.name || undefined,
        image: user.image || undefined,
        emailVerified: user.emailVerified?.getTime(),
      })
      
      // Get the updated user
      const userDoc = await convex.query(api.auth.getUser, { userId: id as Id<"users"> })
      if (!userDoc) {
        throw new Error(`User with id ${id} not found`)
      }
      
      return {
        id: userDoc._id,
        email: userDoc.email,
        name: userDoc.name,
        image: userDoc.image,
        emailVerified: userDoc.emailVerified ? new Date(userDoc.emailVerified) : null,
      }
    },

    async linkAccount(account) {
      await convex.mutation(api.auth.linkAccount, {
        userId: account.userId as Id<"users">,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: safeString(account.refresh_token),
        access_token: safeString(account.access_token),
        expires_at: safeNumber(account.expires_at),
        token_type: safeString(account.token_type),
        scope: safeString(account.scope),
        id_token: safeString(account.id_token),
        session_state: safeString(account.session_state),
      })
      
      return account
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await convex.mutation(api.auth.unlinkAccount, {
        provider,
        providerAccountId,
      })
    },

    async createSession({ sessionToken, userId, expires }) {
      await convex.mutation(api.auth.createSession, {
        sessionToken,
        userId: userId as Id<"users">,
        expires: expires.getTime(),
      })
      
      return { sessionToken, userId, expires }
    },

    async getSessionAndUser(sessionToken) {
      const sessionDoc = await convex.query(api.auth.getSession, { sessionToken })
      if (!sessionDoc) return null
      
      const userDoc = await convex.query(api.auth.getUser, { userId: sessionDoc.userId })
      if (!userDoc) return null
      
      return {
        session: {
          sessionToken: sessionDoc.sessionToken,
          userId: sessionDoc.userId,
          expires: new Date(sessionDoc.expires),
        },
        user: {
          id: userDoc._id,
          email: userDoc.email,
          name: userDoc.name,
          image: userDoc.image,
          emailVerified: userDoc.emailVerified ? new Date(userDoc.emailVerified) : null,
        },
      }
    },

    async updateSession({ sessionToken, ...session }) {
      await convex.mutation(api.auth.updateSession, {
        sessionToken,
        ...session,
        expires: session.expires?.getTime(),
      })
      
      // Get the updated session
      const sessionDoc = await convex.query(api.auth.getSession, { sessionToken })
      if (!sessionDoc) return null
      
      return {
        sessionToken: sessionDoc.sessionToken,
        userId: sessionDoc.userId,
        expires: new Date(sessionDoc.expires),
      }
    },

    async deleteSession(sessionToken) {
      await convex.mutation(api.auth.deleteSession, { sessionToken })
    },

    async createVerificationToken({ identifier, expires, token }) {
      await convex.mutation(api.auth.createVerificationToken, {
        identifier,
        token,
        expires: expires.getTime(),
      })
      
      return { identifier, expires, token }
    },

    async useVerificationToken({ identifier, token }) {
      const verificationToken = await convex.mutation(api.auth.useVerificationToken, {
        identifier,
        token,
      })
      
      if (!verificationToken) return null
      
      return {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: new Date(verificationToken.expires),
      }
    },
  }
}