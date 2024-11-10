import { userInfo } from "os";
import supertokens from "supertokens-node";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import { producer } from "../config/kafka.config";
import UserRoles from "supertokens-node/recipe/userroles";
import { UserType } from "../types/user.type";
import dotenv from "dotenv";

dotenv.config();

const checkUser = async (email: string, password: string) => {
  return await supertokens.listUsersByAccountInfo("public", { email: email });
};

const sendExistingId = async (data: any, other: any) => {
  console.log("sending back");
  await producer.send({
    topic: `${process.env.K_TOPIC}`,
    messages: [
      {
        value: JSON.stringify({
          event: "create",
          data: {
            userName: other?.userName,
            emailAddress: data?.emails[0],
            identityNumber: data?.id,
          },
        }),
      },
    ],
  });
};

const SignUpUser = async (
  email: string,
  password: string,
  other_data: Partial<UserType>
) => {
  const new_signup: any = await EmailPassword.signUp("public", email, password);

  await UserRoles.addRoleToUser("public", new_signup?.user.id, "User");

  console.log(new_signup);

  await producer.send({
    topic: `${process.env.K_TOPIC}`,
    messages: [
      {
        value: JSON.stringify({
          event: "create",
          data: {
            userName: other_data?.userName,
            emailAddress: new_signup?.user.emails[0],
            identityNumber: new_signup?.user?.id,
          },
        }),
      },
    ],
  });
};

export { checkUser, SignUpUser, sendExistingId };
