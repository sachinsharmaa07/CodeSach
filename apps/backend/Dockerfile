FROM node:20-alpine

WORKDIR /app

# Install dependencies for local code execution
RUN apk add --no-cache g++ openjdk17 python3

# Copy package files (handling mono-repo structure)
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install only production dependencies
RUN npm install --omit=dev --prefix apps/backend

# Copy backend source
COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]
