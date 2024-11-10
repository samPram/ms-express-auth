import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: process.env.K_CLIENTID as string,
  brokers: [`localhost:9092`],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "auth" });

export { producer, consumer };
