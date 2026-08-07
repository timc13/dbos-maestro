# syntax=docker/dockerfile:1

FROM node:26-slim AS base
WORKDIR /app
RUN npm install -g pnpm@11

# Build tools for native deps (better-sqlite3) in case a prebuilt binary
# isn't available for this Node/arch combination.
FROM base AS with-build-tools
RUN apt-get update && apt-get install -y --no-install-recommends \
		python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*

FROM with-build-tools AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm run build

FROM with-build-tools AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY package.json ./

EXPOSE 3000
CMD ["node", "build"]
