# Smart Auth API

## Download the project

```bash
$ git clone git@github.com:smart/smart-auth.git
```

## How to run and deploy?

### Deploy the application Using SAM with Make

The Serverless Application Model Command Line Interface (SAM CLI) is an extension of the AWS CLI that adds functionality for building and testing Lambda applications. It uses Docker to run your functions in an Amazon Linux environment that matches Lambda. It can also emulate your application's build environment and API.

To use the SAM CLI, you need the following tools.

* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* Node.js - [Install Node.js 12](https://nodejs.org/en/), including the NPM package management tool.
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)

The deployment process is automtically triggered by Jenkins pipelines, pushing on branch `develop/releases` will deploy on preprod,
pushing on `master` will deploy on prod.

### Build and test locally

`make start` will installs dependencies defined in `package.json`, and package them over `webpack` into `dist` folder,
then `sam local start-api` will start a docker with the folder `dist` mounted.

Run api locally with `make start` command as show below:

```bash
user-api$ make docker-start
user-api$ make start ENVIRONMENT_NAME=sam-local
```
