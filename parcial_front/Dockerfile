# Stage 1: Build React/Vite app
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies based on package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Accept build argument for backend API URL (baked into the static frontend bundle)
ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL

# Build the production bundle
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration for React SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
