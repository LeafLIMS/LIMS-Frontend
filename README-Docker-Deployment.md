# Deploying Frontend with Docker

- First install and run the Docker container for LIMS-Backend as `app` (see LIMS-Backend for details)

- Build the Frontend image (`getlims/limsweb:v<version>`) from a Dockerfile in the current working directory
   - NB. Edit the Dockerfile first to specify API URL relative to the user's browser, and server environment variables
   - `docker build --no-cache -t getlims/limsweb:v<version> .`

- Run the Frontend container (`web`) - make sure the `app` backed is running first and that 9000 matches
- the listen port set in the ENV in the frontend Dockerfile
- no need to link the app server as all comms with it is from the browser, not the server side
   - `docker run -p 9000:9000 --name web -d getlims/limsweb:v<version>`

- Package Frontend image, bundling in GetLIMS-Frontend:
   - `docker save getlims/limsweb:v<version> > limsweb.tar`

- Load Frontend image into Docker production
   - `docker load -i limsweb.tar`

- Clean and remove old Frontend before deploying new one:
   - `docker stop web`
   - `docker rm web`
   - `docker rmi getlims/limsweb:v<oldversion>`
