# Deploying Frontend with Docker

- First install and run the Docker container for LIMS-Backend as `app` (see LIMS-Backend for details)

- Build the Frontend image (`getlims/limsweb:v<version>`) from a Dockerfile in the current working directory
   - NB. Edit the Dockerfile first to specify key environment variables and the `app` server URL relative to the user's browser
   - `docker build --no-cache -t getlims/limsweb:v<version> .`

- Run the Frontend container (`web`) 
   - NB. it has no need to connect to the `app` server itself as that is done from the browser
   - `docker run -p 9000:9000 --name web -d getlims/limsweb:v<version>`

- Package Frontend image, bundling in GetLIMS-Frontend:
   - `docker save getlims/limsweb:v<version> > limsweb.tar`

- Load Frontend image into Docker production
   - `docker load -i limsweb.tar`

- Clean and remove old Frontend before deploying new one:
   - `docker stop web`
   - `docker rm web`
   - `docker rmi getlims/limsweb:v<oldversion>`
