import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: process.env.K_CLIENTID as string,
  brokers: [`${process.env.K_HOST}`], // Ganti dengan alamat broker Kafka Anda
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "auth" });

export { producer, consumer };
