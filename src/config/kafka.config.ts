import { Kafka } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

const kafka = new Kafka({
  clientId: process.env.K_CLIENTID as string,
  brokers: [`kafka:9092`],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "auth" });

export { producer, consumer };
