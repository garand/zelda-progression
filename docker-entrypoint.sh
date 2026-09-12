#!/bin/sh
set -eu
PORT="${PORT:-8080}"
cat > /etc/nginx/conf.d/default.conf <<NGINX
server {
    listen       ${PORT};
    server_name  _;
    root   /usr/share/nginx/html;
    index  index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public";
        try_files \$uri =404;
    }

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
}
NGINX
exec nginx -g 'daemon off;'
