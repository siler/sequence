FROM node:18

# HTTP
EXPOSE 3000
ENV SEQUENCE_PORT 3000
ENV SEQUENCE_PRODUCTION 1

# For canvas
RUN apt-get update
RUN apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev --yes

# For build
RUN curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/bin

# Non-admin build
USER node

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

# do this dance to cache npm install between package file changes
COPY --chown=node:node package*.json .
RUN mkdir core frontend server
COPY --chown=node:node core/package*.json core
COPY --chown=node:node frontend/package*.json frontend
COPY --chown=node:node server/package*.json server

RUN npm install

# build
COPY --chown=node:node . .
RUN just release

# and run
ENTRYPOINT [ "node", "./server/dist/app.js"]