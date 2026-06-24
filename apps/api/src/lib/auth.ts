import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@repo/database";
import * as schema from "@repo/database/schema";


export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.usersTable,
      session: schema.sessionTable,
      account: schema.accountTable,
      verification: schema.verificationTable,
    },
  }),
  user: {
    fields: {
      name: "fullName",
      image: "profileImageUrl",
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,

      mapProfileToUser: async (profile) => {
        return {
          email: profile.email ?? `${profile.id}@users.noreply.github.com`,
          name: profile.name ?? profile.login,
          image: profile.avatar_url,
        };
      },
    },
  },
  trustedOrigins: process.env.BETTER_AUTH_URL ? ["http://localhost:3000", process.env.BETTER_AUTH_URL.replace(/\/$/, "")] : ["http://localhost:3000"],

});

