# ---------- Build ----------
    FROM node:22-alpine AS builder

    WORKDIR /app/builder
    
    COPY builder/package*.json ./
    
    RUN npm ci
    
    COPY builder/ .
    COPY shared ../shared
    
    RUN npm run build
    
    # ---------- Runtime ----------
    FROM nginx:alpine
    
    COPY --from=builder /app/builder/dist /usr/share/nginx/html
    
    COPY builder/nginx.conf /etc/nginx/conf.d/default.conf
    
    EXPOSE 80
    
    CMD ["nginx","-g","daemon off;"]