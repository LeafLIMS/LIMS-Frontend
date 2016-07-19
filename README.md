# GET LIMS (Frontend) 

**Please note that this is only the frontend and requires a connection to the API to function. The backend API for this project is stored in another repository**

GET LIMS is a synthetic biology focused LIMS that allows the tracking of samples, running of workflows and automatic inventory handling.

When built the frontend only requires a webserver and access to the API to function.

## Prerequisites for development

- npm (node.js)
- bower
- grunt (system wide)

## Setting up development

- Get with `git clone https://github.com/GETLIMS/LIMS-Frontend` 
- Run `npm install && bower install`
    - If asked, pick the latest version of angular
- To test, run `grunt test --api_url=http://localhost:8000`
    - The URL in --api_url is the URL of the backend server. It defaults to http://localhost:8000
- To start the server, run `grunt serve --api_url=http://localhost:8000 --listen_host=0.0.0.0 --listen_port=9000`
    - The URL in --api_url is the URL of the backend server
    - The frontend server will launch at http://0.0.0.0:9000 by default. Modify with --listen_host and --listen_port
