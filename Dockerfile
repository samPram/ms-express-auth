# Dockerfile untuk Auth Service
# Gunakan node image sebagai base
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json dan package-lock.json terlebih dahulu untuk instalasi dependensi
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh kode sumber aplikasi ke dalam container
COPY . .

# Install ts-node-dev and typescript globally (if not installed locally in the project)
RUN npm install -g ts-node-dev typescript

ENV PORT=4001
ENV PG_HOST=db
ENV PG_PORT=5432
ENV PG_USER=postgres
ENV PG_PASS=secret
ENV PG_DB=supertokens
ENV S_CONN_URI=http://supertokens:3567
ENV S_APIKEY=secret
ENV S_APPNAME=ms-aldin-betest
ENV S_APIDOMAIN=http://auth-service:4001
ENV S_APIBASEPATH=/api/v1/auth
ENV S_WEBSITEDOMAIN=http://localhost:3000
ENV K_CLIENTID=kafka-service
ENV K_HOST=kafka:9092
ENV K_TOPIC=kafka_aldin_betest

# Build aplikasi TypeScript
RUN npm run build

# Expose port yang digunakan oleh Express
EXPOSE 4001

# Jalankan aplikasi
CMD ["npm", "run", "dev"]

