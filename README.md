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
- To test, run `grunt serve --force`
    - The server runs on port 9000
- To build run `grunt build --force`
