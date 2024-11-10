import express from "express";
import dotenv from "dotenv";
import supertokens from "supertokens-node";
import Session from "supertokens-node/recipe/session";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import Dashboard from "supertokens-node/recipe/dashboard";
import UserRoles from "supertokens-node/recipe/userroles";
import { middleware, errorHandler } from "supertokens-node/framework/express";
import authRoutes from "./routes/auth.route";
import { consumer, producer } from "./config/kafka.config";
import { ConsumeCreateUser } from "./controllers/auth.controller";

dotenv.config();
const app = express();

app.use(express.json());

// kafka
producer.connect();

console.log("Initializing SuperTokens...");
console.log(process.env.S_APIDOMAIN, process.env.S_WEBSITEDOMAIN);
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
    EmailPassword.init({
      signUpFeature: {
        formFields: [
          {
            id: "userName",
          },
        ],
      },
      override: {
        apis: (originalImplementation) => {
          return {
            ...originalImplementation,
            signUpPOST: async function (input) {
              // First we call the original implementation of signUpPOST.
              let response = await originalImplementation.signUpPOST!(input);

              // Post sign up response, we check if it was successful
              if (
                response.status === "OK" &&
                response.user.loginMethods.length === 1 &&
                input.session === undefined
              ) {
                const { user } = response;

                /**
                 *
                 * response.user contains the following info:
                 * - emails
                 * - id
                 * - timeJoined
                 * - tenantIds
                 * - phone numbers
                 * - third party login info
                 * - all the login methods associated with this user.
                 * - information about if the user's email is verified or not.
                 *
                 */

                // TODO: sign up successful
                // add role
                await UserRoles.addRoleToUser("public", user.id, "User");

                // here we fetch a custom form field for the user's name.
                // Note that for this to be available, you need to define
                // this custom form field.
                let userName = "";
                for (let i = 0; i < input.formFields.length; i++) {
                  if (input.formFields[i].id == "userName") {
                    userName = input.formFields[i].value as string;
                  }
                }

                // Trigger event kafka
                await producer.send({
                  topic: `${process.env.K_TOPIC}`,
                  messages: [
                    {
                      value: JSON.stringify({
                        event: "create",
                        data: {
                          userName,
                          emailAddress: user.emails[0],
                          identityNumber: user?.id,
                        },
                      }),
                    },
                  ],
                });
              }
              return response;
            },
          };
        },
        functions: (originalImplementation) => {
          return {
            ...originalImplementation,
            // TODO: from previous code snippets
          };
        },
      },
    }), // initializes signin / sign up features
    Session.init(), // initializes session features
    Dashboard.init(),
    UserRoles.init(),
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

// kafka
consumer.connect();

// consume data kafka
ConsumeCreateUser().catch(console.error);

export default app;
