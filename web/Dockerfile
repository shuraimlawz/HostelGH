# Base stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# Build stage
FROM base AS build
COPY . .
# We need to pass the API URL for build-time env if needed, 
# but usually Next.js app router fetches from server-side.
# For client-side requests, it uses the browser's URL or a config.
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
