import { consumer, producer } from "../config/kafka.config";
import { SignUpUser, checkUser, sendExistingId } from "../service/auth.service";

import dotenv from "dotenv";

dotenv.config();

const ConsumeCreateUser = async () => {
  await consumer.subscribe({
    topic: `${process.env.K_TOPIC}`,
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }: any) => {
      console.log(topic, message.value.toString());
      const event = JSON.parse(message.value.toString());

      if (event.event === "signup") {
        const { emailAddress, password, ...other_data } = event.data;

        console.log(other_data);

        const exist_data: any = await checkUser(emailAddress, password);
        console.log("existing data on supertokens");
        console.log(exist_data[0]);

        if (exist_data.length !== 0) {
          await sendExistingId(exist_data[0], {
            userName: other_data?.userName,
          });
        } else {
          await SignUpUser(emailAddress, password, other_data);
        }
      }
    },
  });
};

export { ConsumeCreateUser };
