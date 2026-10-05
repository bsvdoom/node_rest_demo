FROM node:24.20.0-bookworm-slim@sha256:ba849c60be29959425b8734d57b8b4b7d56f98edd9504c9af091d5281095a71e

ENV NODE_ENV=production

WORKDIR /usr/src/app

RUN chown node:node /usr/src/app

COPY --chown=node:node package.json package-lock.json ./

USER node

RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node . .

EXPOSE 3000

ENTRYPOINT []
CMD ["node", "./bin/www"]
