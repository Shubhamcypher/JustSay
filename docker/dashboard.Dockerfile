# ---------- Build ----------
    FROM node:22-alpine AS builder

    WORKDIR /app/dashboard
    
    COPY dashboard/package*.json ./
    
    RUN npm ci
    
    COPY dashboard/ .
    RUN echo "===== FILES ====="
    RUN ls -la
    RUN echo "===== ENV ====="
    RUN cat .env.production
    COPY shared ../shared
    
    RUN npm run build
    
    # ---------- Runtime ----------
    FROM nginx:alpine
    
    COPY --from=builder /app/dashboard/dist /usr/share/nginx/html
    
    COPY dashboard/nginx.conf /etc/nginx/conf.d/default.conf
    
    EXPOSE 80
    
    CMD ["nginx","-g","daemon off;"]