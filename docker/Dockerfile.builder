FROM node:22-alpine AS builder

WORKDIR /app/builder

COPY app/builder/package*.json ./

RUN npm ci

COPY app/builder/ .
COPY app/shared ../shared

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/builder/dist /usr/share/nginx/html

COPY app/builder/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx","-g","daemon off;"]