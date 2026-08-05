# ---------- Build ----------
    FROM node:22-alpine AS builder

    WORKDIR /app/dashboard
    
    # package files
    COPY dashboard/package*.json ./
    
    RUN npm ci
    
    # dashboard source
    COPY dashboard/ .
    
    # shared folder
    COPY shared ../shared
    
    RUN npm run build
    
    
    # ---------- Production ----------
    FROM nginx:alpine
    
    COPY --from=builder /app/dashboard/dist /usr/share/nginx/html

    COPY dashboard/nginx.conf /etc/nginx/conf.d/default.conf
    
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]