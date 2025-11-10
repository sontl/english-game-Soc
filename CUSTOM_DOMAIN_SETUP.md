# Custom Domain Setup Guide

This guide explains how to configure your English Game application to work with custom domains.

## Quick Setup

### 1. Add Your Domain to Vite Config

Edit `frontend/vite.config.ts`:

```typescript
preview: {
  port: 4173,
  host: true,
  strictPort: true,
  allowedHosts: [
    'localhost',
    '127.0.0.1',
    'your-domain.com',      // Add your domain
    '.your-domain.com'      // Add for subdomains
  ]
}
```

### 2. Rebuild Frontend

```bash
docker compose up --build frontend
```

### 3. Configure Reverse Proxy

Point your domain to the Docker services using a reverse proxy.

## Reverse Proxy Examples

### Nginx

```nginx
server {
    listen 80;
    server_name game.i4y.net;
    
    # Frontend
    location / {
        proxy_pass http://localhost:4173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Caddy

```caddy
game.i4y.net {
    # Frontend
    reverse_proxy localhost:4173
    
    # Backend API
    handle /api/* {
        reverse_proxy localhost:4000
    }
}
```

### Traefik (docker-compose.yml)

```yaml
services:
  frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`game.i4y.net`)"
      - "traefik.http.services.frontend.loadbalancer.server.port=4173"
  
  backend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`game.i4y.net`) && PathPrefix(`/api`)"
      - "traefik.http.services.backend.loadbalancer.server.port=4000"
```

## DNS Configuration

Point your domain to your server's IP address:

```
Type: A
Name: game (or @)
Value: YOUR_SERVER_IP
TTL: 3600
```

For subdomains:
```
Type: A
Name: *.game
Value: YOUR_SERVER_IP
TTL: 3600
```

## HTTPS Setup

### Using Certbot (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d game.i4y.net

# Auto-renewal is configured automatically
```

### Using Caddy (Automatic HTTPS)

Caddy automatically handles HTTPS certificates. Just use your domain in the Caddyfile:

```caddy
game.i4y.net {
    reverse_proxy localhost:4173
}
```

## Multiple Domains

To support multiple domains, add them all to `allowedHosts`:

```typescript
allowedHosts: [
  'localhost',
  'game.i4y.net',
  'game.example.com',
  'english-game.com',
  '.i4y.net',           // All i4y.net subdomains
  '.example.com'        // All example.com subdomains
]
```

## Wildcard Domains

Use a leading dot to allow all subdomains:

```typescript
allowedHosts: [
  '.i4y.net'  // Allows: game.i4y.net, test.i4y.net, etc.
]
```

## Environment-Specific Configuration

For different environments, you can use environment variables:

```typescript
// vite.config.ts
const allowedHosts = process.env.VITE_ALLOWED_HOSTS
  ? process.env.VITE_ALLOWED_HOSTS.split(',')
  : ['localhost', '127.0.0.1'];

export default defineConfig({
  preview: {
    allowedHosts
  }
});
```

Then in docker-compose.yml:

```yaml
frontend:
  build:
    args:
      VITE_ALLOWED_HOSTS: "localhost,game.i4y.net,.i4y.net"
```

## Troubleshooting

### "Blocked request" Error

**Symptom:** Browser shows "Blocked request. This host is not allowed."

**Solution:**
1. Add your domain to `allowedHosts` in `vite.config.ts`
2. Rebuild: `docker compose up --build frontend`
3. Verify the domain is in the list

### Domain Not Resolving

**Check DNS:**
```bash
nslookup game.i4y.net
dig game.i4y.net
```

**Check if server is reachable:**
```bash
curl -I http://YOUR_SERVER_IP:4173
```

### HTTPS Not Working

**Check certificate:**
```bash
sudo certbot certificates
```

**Renew certificate:**
```bash
sudo certbot renew --dry-run
```

### Proxy Not Working

**Check nginx config:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Check logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

## Security Considerations

### Production Recommendations

1. **Use HTTPS** - Always use HTTPS in production
2. **Limit allowed hosts** - Only add domains you actually use
3. **Use environment variables** - Don't hardcode production domains
4. **Enable CORS properly** - Configure backend CORS for your domains
5. **Use a proper web server** - Consider nginx instead of vite preview

### Backend CORS Configuration

Update `backend/src/app.ts` to allow your domain:

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://game.i4y.net'
  ],
  credentials: true
}));
```

## Production Deployment

For production, consider serving static files instead of using vite preview:

### Nginx Serving Static Files

```dockerfile
# frontend/Dockerfile.prod
FROM node:20-alpine AS builder
# ... build steps ...

FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

This is more efficient and secure than using vite preview in production.

## Testing

### Test Locally

```bash
# Add to /etc/hosts
127.0.0.1 game.i4y.net

# Access
http://game.i4y.net:4173
```

### Test Remote

```bash
# Test HTTP
curl -H "Host: game.i4y.net" http://YOUR_SERVER_IP:4173

# Test with browser
# Just navigate to http://game.i4y.net
```

## Summary

1. ✅ Add domain to `vite.config.ts` `allowedHosts`
2. ✅ Rebuild frontend container
3. ✅ Configure DNS to point to your server
4. ✅ Set up reverse proxy (nginx/Caddy/Traefik)
5. ✅ Enable HTTPS with Let's Encrypt
6. ✅ Test access from your domain

Your app should now be accessible from your custom domain! 🎉
