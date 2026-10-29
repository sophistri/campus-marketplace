# take 1
FROM node:lts-slim AS build
WORKDIR /app

# 1. Copy only package files first to leverage build cache
COPY package.json package-lock.json ./

# 2. Install dependencies, prod's gonn ignore em later
RUN npm ci 

# 3. Copy the rest of the application code
COPY . .

# wrap up take 1 - let Vite produce the static website in /app/dist
RUN npm run build


# take 2
FROM nginx:alpine AS prod

# Replace the default Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Runtime config template and startup script - config is for the api_url that vite needs
COPY config.template.js /opt/app-config/config.template.js    
COPY docker-entrypoint.sh /docker-entrypoint.d/40-runtime-config.sh

# Copy the built Vite files
COPY --from=build /app/dist /usr/share/nginx/html

RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh


EXPOSE 80

#CMD ["nginx", "-g", "daemon off;"] #redundant since the official nginx:alpine image already defines this as its default command.

# aaaaaand thats a wrap