
# FROM node:12 as builder
# RUN mkdir -p /usr/local/app
# WORKDIR /usr/local/app
# COPY package*.json ./
# RUN npm install

FROM node:12-alpine
RUN mkdir -p /usr/local/app
WORKDIR /usr/local/app

# Required for node-rdkafka (uses bindings for C++ and native libs)
RUN apk --no-cache add \
      bash \
      g++ \
      ca-certificates \
      lz4-dev \
      musl-dev \
      cyrus-sasl-dev \
      openssl-dev \
      make \
      python
RUN apk add --no-cache --virtual .build-deps gcc zlib-dev libc-dev bsd-compat-headers py-setuptools bash

#ENV NODE_ENV
#ENV LOG_LEVEL
#ENV KAFKA_BROKER_LIST
#ENV KAFKA_TOPIC_NAME

# COPY --from=builder /usr/local/app/node_modules /usr/local/app/node_modules
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["node", "dist/index.js"]