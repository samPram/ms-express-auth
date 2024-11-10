import express from "express";
import dotenv from "dotenv";
import supertokens from "supertokens-node";
import Session from "supertokens-node/recipe/session";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import Dashboard from "supertokens-node/recipe/dashboard";
import { middleware, errorHandler } from "supertokens-node/framework/express";
import authRoutes from "./routes/auth.route";

dotenv.config();
const app = express();

app.use(express.json());

console.log("Initializing SuperTokens...");
// supertokens
supertokens.init({
  framework: "express",
  supertokens: {
    connectionURI: `${process.env.S_CONN_URI}`,
    apiKey: `${process.env.S_APIKEY}`, // OR can be undefined
  },
  appInfo: {
    // learn more about this on https://supertokens.com/docs/session/appinfo
    appName: `${process.env.S_APPNAME}`,
    apiDomain: `${process.env.S_APIDOMAIN}`,
    websiteDomain: `${process.env.S_WEBSITEDOMAIN}`,
    apiBasePath: `${process.env.S_APIBASEPATH}`,
    // websiteBasePath: "/auth",
  },
  recipeList: [
    EmailPassword.init(), // initializes signin / sign up features
    Session.init(), // initializes session features
    Dashboard.init(),
  ],
});

console.log("SuperTokens initialized.");

// Cors for incoming req web app / mobile
// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
//     credentials: true,
//   })
// );

// IMPORTANT: CORS should be before the below line.
app.use(middleware());

// Register routes
app.use("/api/v1/auth", authRoutes);

// Add this AFTER all your routes
app.use(errorHandler());

export default app;
