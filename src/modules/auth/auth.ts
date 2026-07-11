import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

import {
  mongoClient,
  mongoDatabase,
} from "../../database/mongodb.js";

const frontendUrl = process.env.FRONTEND_URL;
const betterAuthUrl = process.env.BETTER_AUTH_URL;
const betterAuthSecret = process.env.BETTER_AUTH_SECRET;

if (!frontendUrl) {
  throw new Error("FRONTEND_URL is missing.");
}

if (!betterAuthUrl) {
  throw new Error("BETTER_AUTH_URL is missing.");
}

if (!betterAuthSecret) {
  throw new Error("BETTER_AUTH_SECRET is missing.");
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const hasGoogleCredentials =
  Boolean(googleClientId) && Boolean(googleClientSecret);

export const auth = betterAuth({
  appName: "MarketHub",

  baseURL: betterAuthUrl,
  basePath: "/api/auth",
  secret: betterAuthSecret,

  database: mongodbAdapter(mongoDatabase, {
    client: mongoClient,
  }),

  trustedOrigins: [frontendUrl],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

 user: {
  modelName: "users",

  additionalFields: {
    role: {
      type: "string",
      required: true,
      defaultValue: "customer",
      input: false,
    },

    status: {
      type: "string",
      required: true,
      defaultValue: "active",
      input: false,
    },

    isBlocked: {
      type: "boolean",
      required: true,
      defaultValue: false,
      input: false,
    },

    phone: {
      type: "string",
      required: false,
      input: true,
    },

    address: {
      type: "string",
      required: false,
      input: true,
    },

    sellerProfileId: {
      type: "string",
      required: false,
      input: false,
    },
  },
},

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  ...(hasGoogleCredentials
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId as string,
            clientSecret: googleClientSecret as string,
            prompt: "select_account" as const,
          },
        },
      }
    : {}),
});