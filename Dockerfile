# Suggest running this as 'web'
# Before running, the backend server ('app') must first be started

FROM node:latest

ENV HOME /root

WORKDIR /usr/src/app
RUN mkdir limsweb
COPY . limsweb

WORKDIR /usr/src/app/limsweb
RUN npm install
RUN npm install -g grunt-cli bower
RUN bower --allow-root install
RUN apt-get update
RUN apt-get install -y ruby ruby-dev
RUN gem install compass

# BEFORE GOING ANY FURTHER
# Need to set API_URL for 'app' server - otherwise default of http://localhost:8000 will be used
ENV API_URL http://localhost:8000
ENV LISTEN_HOST 0.0.0.0
ENV LISTEN_PORT 9000

# Start the server using sh to pick up the ENV settings above:
CMD ["sh", "-c", "grunt serve --api_url=$API_URL --listen_host=$LISTEN_HOST --listen_port=$LISTEN_PORT"]
