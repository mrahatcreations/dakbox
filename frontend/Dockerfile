# Build stage
FROM node:18-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY . .
# We don't have .env here during build on coolify by default unless injected, 
# but Vite can use runtime envs if configured, or build-time.
RUN npm run build

# Production stage
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copy custom nginx config if needed, otherwise default is fine for basic SPA
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
