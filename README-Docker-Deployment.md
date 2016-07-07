# Deploying Frontend with Docker

- First install and run the Docker container for LIMS-Backend as `app` (see LIMS-Backend for details)
- Build the Frontend image (`getlims/limsweb:v<version>`) from a Dockerfile in the current working directory
   - NB. Edit the Dockerfile first to specify key environment variables
   - `docker build --no-cache -t getlims/limsweb:v<version> .`
- Run the Frontend container (`web`)
   - `docker run -p 9000:9000 --link app:app --name web -d getlims/limsweb:v<version>`
- Package Frontend image, bundling in GetLIMS-Frontend, with references to app image but not including it:
   - `docker save web > limsweb.tar`
   - `docker save getlims/limsweb:v<version> > limsweb.tar`
   - `docker load -i limsweb.tar`
- Clean and remove old Frontend before deploying new one:
   - `docker stop web`
   - `docker rm web`
   - `docker rmi getlims/limsweb:v<oldversion>``
