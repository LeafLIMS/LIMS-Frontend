FROM nginx

ENV HOME /root

COPY default.conf /etc/nginx/conf.d/
RUN rm /usr/share/nginx/html/*
COPY index.html /usr/share/nginx/html
COPY favicon.ico /usr/share/nginx/html
COPY scripts/ /usr/share/nginx/html/scripts/
COPY img/ /usr/share/nginx/html/img/
COPY third_party/semantic-ui/themes/ /usr/share/nginx/html/themes/
COPY plugins/dist/ /usr/share/nginx/html/plugins/dist/
