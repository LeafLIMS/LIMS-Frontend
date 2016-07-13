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
# Need to set API_URL in Gruntfile.js ngconstant section - default Docker setup might be http://app:8000
#  For production (grunt build): update ngconstant:dist
#  For dev (grunt serve): update ngconstant:dev

# Production server:
#CMD ["grunt", "build", "--force"]
# Dev server:
CMD ["grunt", "serve", "--force"]
