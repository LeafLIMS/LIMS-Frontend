# Suggest running this as 'web'
# Before running, the backend server ('app') must first be started

FROM ubuntu:latest

# Set API_URL for 'app' server - default http://localhost:8000 will be used
ENV API_URL=http://localhost:8000

# Set LISTEN_HOST (currently ignored - will respond to any hostname) and LISTEN_PORT for 'web' server - default http://localhost:9000/
ENV LISTEN_HOST=localhost
ENV LISTEN_PORT=9000

ENV HOME /root
EXPOSE $LISTEN_PORT

# Rest of build continues
RUN apt-get update
RUN apt-get install -y --fix-missing --allow-unauthenticated apt-utils ruby ruby-dev nodejs npm nodejs-legacy apt-utils autoconf nasm git apache2
RUN sed -i.bak "s/:80/:$LISTEN_PORT/g" /etc/apache2/sites-available/000-default.conf
RUN echo "Listen $LISTEN_PORT\nNameVirtualHost *:$LISTEN_PORT" > /etc/apache2/ports.conf

WORKDIR /usr/src/app
RUN mkdir getlims
COPY . getlims

WORKDIR /usr/src/app/getlims
RUN npm install -g grunt-cli bower 
RUN npm install 
RUN bower --allow-root install
RUN gem install compass

RUN grunt build --api-url=$API_URL --listen-host=$LISTEN_HOST --listen-port=$LISTEN_PORT
RUN mv -f dist/* /var/www/html

CMD ["apachectl","-DFOREGROUND"]
