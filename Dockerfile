# Static Zelda progression site for Railway
FROM nginx:alpine

COPY index.html styles.css styles-more.css app.js data.js data-games.js /usr/share/nginx/html/
COPY docker-entrypoint.sh /docker-entrypoint-zelda.sh

RUN chmod +x /docker-entrypoint-zelda.sh \
 && rm -f /etc/nginx/conf.d/default.conf

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint-zelda.sh"]
