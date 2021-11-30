# Get A Room!

## Project structure

The project is divided into frontend and backend folders which contain the corresponding npm projects and README.md:s. Remember to also check those README.md:s for development environment instructions etc.

## Code formatting

To utilize code formatting on commit, run `npm install` in the project root folder

## Setting up a new Google Cloud Environment and GitHub Actions deployment

First a new project should be created to Google Cloud. Name for the project could be for example "get-a-room".

Next up "Container registry" and "Cloud Build API" should be enabled for this newly created project. These are used to storage and build the Cloud Run containers.
Also remember to enable the Google Calendar API and Admin SDK API for the project here:
https://console.cloud.google.com/marketplace/product/google/calendar-json.googleapis.com
https://console.cloud.google.com/marketplace/product/google/admin.googleapis.com

Next up if you are using GitHub actions to deploy the project to this new environment, a new service account should be created for the project. Service account is used to authenticate the GitHub actions so automatic deployments are possible. Service account name could be for example "get-a-room" and the service account should be given these roles:

Cloud Run Admin
Cloud Build Editor
Cloud Build Service Account
Viewer
Service Account User

Next a new service account key should be created. At this newly created service accounts page go to KEYS -> ADD KEY -> Create new key -> JSON -> Create. After downloading the key, its whole content should be saved as GitHub repository secret, so it can be accessed inside the GitHub actions worklow file .github/workflows/ci.yml.

After adding the service account key, next up the Google Clouds project ID should also be added as GitHub repository secret. Project ID probably looks something like this: "get-a-room-123456" and can be checked from Google Cloud. Naming convention on the ci.yml file for the project ID secrets is something like this: GCR_PROJECT_NEW_ENVIRONMENT

Now best way to find out where and how these env variables should be used inside the ci.yml file is to check how the existing variables are used. Existing Google project ID variables and service account keys are named something like this: GCR_PROJECT* and GCR_SA_KEY*

Now after these variables are setted up, a new deployment job could be created that uses these new variables. You can check how the existing deployment jobs are created (i.e. frontend-deploy-prod and backend-deploy-prod) and copy them.

After running the pipeline, the pipeline builds the images and deploys them to the Cloud Runs. Backend deploy to Cloud Run probably fails with errors that ENV variables are not set. ENV variables can be setted up at the backends Cloud Run page. Example on what env variables should be setted up to the backend can be found in file backend/.env.example

Also new nginx.conf should be created for this new environment, you can check how the existing nginx.confs are created (i.e. frontend/.docker/.docker-prod/nginx.conf) Remember to change the "proxy_pass" address from this nginx.conf to point to this newly created environments Cloud Run backend. So the Nginx knows to route the /api paths traffic to the correct backend.

After this you probably want to point some domain to this application. This can done by pointing the domain to the frontend/Nginx Cloud Run service. After the domain is pointed correctly, it should setted up also to the FRONTEND_URL and CALLBACK_URL env variables.

Now you should have a working GitHub actions deployment and a new environment!
