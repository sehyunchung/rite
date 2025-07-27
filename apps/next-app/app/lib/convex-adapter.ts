import type { Adapter } from "@auth/core/adapters"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@rite/backend/convex/_generated/api"
import { Id } from "@rite/backend/convex/_generated/dataModel"

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
      const user = await convex.query(api.auth.getUserByNextAuthId, { nextAuthId: id })
      if (!user) return null
      
      // Type assertion since we know this is a user document
      const userDoc = user as any
      return {
        id: id, // Return the NextAuth UUID, not Convex ID
        email: userDoc.email,
        name: userDoc.name,
        image: userDoc.image,
        emailVerified: userDoc.emailVerified ? new Date(userDoc.emailVerified) : null,
      }
    },

    async getUserByEmail(email) {
      const user = await convex.query(api.auth.getUserByEmail, { email })
      if (!user) return null
      
      // Type assertion since we know this is a user document
      const userDoc = user as any
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
      
      const user = await convex.query(api.auth.getUser, { userId: account.userId })
      if (!user) return null
      
      // Type assertion since we know this is a user document
      const userDoc = user as any
      return {
        id: userDoc._id,
        email: userDoc.email,
        name: userDoc.name,
        image: userDoc.image,
        emailVerified: userDoc.emailVerified ? new Date(userDoc.emailVerified) : null,
      }
    },

    async updateUser({ id, ...user }) {
      const updatedUser = await convex.mutation(api.auth.updateUser, {
        userId: id as Id<"users">,
        email: user.email || undefined,
        name: user.name || undefined,
        image: user.image || undefined,
        emailVerified: user.emailVerified?.getTime(),
      })
      
      // Type assertion since we know this is a user document
      const userDoc = updatedUser as any
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
        refresh_token: typeof account.refresh_token === 'string' ? account.refresh_token : undefined,
        access_token: typeof account.access_token === 'string' ? account.access_token : undefined,
        expires_at: typeof account.expires_at === 'number' ? account.expires_at : undefined,
        token_type: typeof account.token_type === 'string' ? account.token_type : undefined,
        scope: typeof account.scope === 'string' ? account.scope : undefined,
        id_token: typeof account.id_token === 'string' ? account.id_token : undefined,
        session_state: typeof account.session_state === 'string' ? account.session_state : undefined,
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
      const session = await convex.query(api.auth.getSession, { sessionToken })
      if (!session) return null
      
      const user = await convex.query(api.auth.getUser, { userId: session.userId })
      if (!user) return null
      
      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: new Date(session.expires),
        },
        user: {
          id: (user as any)._id,
          email: (user as any).email,
          name: (user as any).name,
          image: (user as any).image,
          emailVerified: (user as any).emailVerified ? new Date((user as any).emailVerified) : null,
        },
      }
    },

    async updateSession({ sessionToken, ...session }) {
      const updatedSession = await convex.mutation(api.auth.updateSession, {
        sessionToken,
        ...session,
        expires: session.expires?.getTime(),
      })
      
      if (!updatedSession) return null
      
      return {
        sessionToken: (updatedSession as any).sessionToken,
        userId: (updatedSession as any).userId,
        expires: new Date((updatedSession as any).expires),
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