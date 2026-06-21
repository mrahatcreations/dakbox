# Build stage
FROM node:18-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY . .
# We don't have .env here during build on coolify by default unless injected, 
# but Vite can use runtime envs if configured, or build-time.
RUN npm run build > build.log 2>&1 || (echo "Build failed!" && mkdir -p dist && echo "<h1>Build Failed!</h1><p>Check <a href='/build.log'>/build.log</a></p>" > dist/index.html && cp build.log dist/)

# Production stage
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copy custom nginx config if needed, otherwise default is fine for basic SPA
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
