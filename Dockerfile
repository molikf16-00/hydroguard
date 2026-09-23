FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_DATA_MODE=server
RUN npm run build
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
RUN mkdir /app/data && chown node:node /app/data
USER node
ENV PORT=3000
ENV HYDROGUARD_DATA_DIR=/app/data
EXPOSE 3000
CMD ["npm", "start"]
