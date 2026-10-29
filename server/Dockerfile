FROM node:lts-slim


WORKDIR /app

# 1. Copy only package files first to leverage build cache
COPY package.json package-lock.json ./

# 2. Install dependencies - omits ev dependiencies
RUN npm ci --omit=dev

COPY --chown=node:node . .
RUN mkdir -p uploads/listings && chown -R node:node uploads

# Switch to the built-in non-root 'node' user
USER node

# not rly necessary but wutevar standard practice documentation and allat 
EXPOSE 5000

CMD ["npm", "start"]
