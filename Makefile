SHELL = /bin/bash

# Colors
COLOR_END     = \033[0m
COLOR_INFO    = \033[36m
COLOR_COMMENT = \033[33m
COLOR_GROUP   = \033[1m

# CI variables
JEST = node_modules/.bin/jest
JSCPD = node_modules/.bin/jscpd
TYPEDOC = node_modules/.bin/typedoc
TSLINT = node_modules/.bin/tslint
PRETTIER = node_modules/.bin/prettier
PLATO = node_modules/.bin/plato
WEBPACK = node_modules/.bin/webpack
CONCURRENTLY = node_modules/.bin/concurrently
CIDIR = $(CURDIR)/ci
LOGDIR = $(CURDIR)/var/ci_log

# Docker variables
APPLICATION_NAME = user-api
LIGNES = 'all'
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_EXEC = $(DOCKER_COMPOSE) exec $(APPLICATION_NAME)
WORKDIR = /var/www/applicatif

# Prebuilded docker variables
IMAGE = node:12

TASK = start
ENVIRONMENT_NAME = dev

# Check if the variable BRANCH is defined
ifeq ($(BRANCH),master)
	ENVIRONMENT_NAME = prod
	TASK = build
endif

ifeq ($(BRANCH),develop)
	ENVIRONMENT_NAME = preprod
	TASK = build
endif

.PHONY:
	docker-pull docker-start docker-stop docker-log docker-bash docker-inspect docker-install docker-update docker-cc docker-exec
	install ci
	create-table delete-table
	build@dev build
	docker-run-task docker-run-script
	quick-build-ci full-build-ci

.DEFAULT_GOAL := help

help:
	@awk 'BEGIN {FS = ":.*##"; printf "\n${COLOR_COMMENT}Usage:${COLOR_END}\n  make ${COLOR_INFO}<target>${COLOR_COMMENT}\n\nTargets:\n${COLOR_END}"} /^[a-zA-Z_-]+:.*?##/ { printf "  ${COLOR_INFO}%-20s${COLOR_END} %s\n", $$1, $$2 } /^##@/ { printf "\n${COLOR_GROUP}%s${COLOR_END}\n", substr($$0, 5) }' $(MAKEFILE_LIST)

###########
##@ Docker
##########

docker-start: ## Run (and build) docker instance
	@$(DOCKER_COMPOSE) pull
	@$(DOCKER_COMPOSE) up -d --force-recreate --build --remove-orphans

docker-stop: ## Stop docker instance
	@$(DOCKER_COMPOSE) down --remove-orphans

docker-log: ## Output logs of docker (to update the number of lines, you can specify the number with the argument LIGNES: make docker-log LIGNES=5)
	@$(DOCKER_COMPOSE) logs -t --tail=$(LIGNES) $(APPLICATION_NAME)

docker-bash: ## Login to docker instance
	@$(DOCKER_COMPOSE_EXEC) bash

docker-inspect: ## Inspect the applicatif docker container
	@docker inspect $(APPLICATION_NAME)

docker-install: ## Run npm install on docker
	@$(DOCKER_COMPOSE_EXEC) $(MAKE) install

docker-update: ## Run npm ci on docker
	@$(DOCKER_COMPOSE_EXEC) $(MAKE) ci

docker-exec: ## Execute any other make task on docker (make docker-exec TASK=test to use it)
	@$(DOCKER_COMPOSE_EXEC) $(MAKE) $(TASK)

#####################
##@ Install Commands
#####################

install: ## Run npm install
	@npm install

######################
##@ Dynamodb Commands
#####################

create-table: ## Create the table from config/db/users.json into local dynamo
	aws dynamodb create-table --cli-input-json file://config/db/schema/users.json --endpoint-url http://localhost:8000

delete-table: ## Delete the table "Users" from local dynamo
	aws dynamodb delete-table --table-name 'Users' --endpoint-url http://localhost:8000

#####################
##@ Build and Deploy
####################

webpack-watch: ## Run Wabpack with watch option
	rm -rf dist/
	$(WEBPACK) -w --env.NODE_ENV=${ENVIRONMENT_NAME}

webpack: ## Run Wabpack without watch option
	rm -rf dist/
	$(WEBPACK) --config ./webpack.config.js

sam-start: ## Start api with SAM AWS
	export TABLE_NAME=Users; sam local start-api --debug --docker-network ${APPLICATION_NAME}

nest-start: ## Start api with Nest
	export NODE_ENV=${ENVIRONMENT_NAME} && nest start

start: ## Package application and run it with SAM AWS
	-$(MAKE) create-table
	$(MAKE) -j 2 webpack-watch sam-start

build: ## Prepare build for preprod/prod
	# $(MAKE) install
	$(MAKE) webpack
	sam package \
		--profile amf \
		--region eu-west-1 \
		--template-file template.yaml \
		--output-template-file packaged.yaml \
		--s3-bucket amf-serverless-packages \
		--s3-prefix ${APPLICATION_NAME}/${ENVIRONMENT_NAME}

deploy: ## Deploy build for preprod/prod
	sam deploy \
		--profile amf \
		--template-file packaged.yaml \
		--region eu-west-1 \
		--stack-name ${APPLICATION_NAME}-${ENVIRONMENT_NAME} \
		--capabilities CAPABILITY_IAM \
		--parameter-overrides EnvironmentName=${ENVIRONMENT_NAME}

delete: ## Remove all SAM Stack
	aws cloudformation delete-stack --stack-name ${APPLICATION_NAME}-${ENVIRONMENT_NAME}

######################
##@ Commands On Docker
######################

docker-run-task: ## Run a task (build ...) on docker, example: make docker-run-task IMAGE=node:12 TASK=quick-build-ci
	@docker run --rm -v ${PWD}:${WORKDIR} -w ${WORKDIR} $(IMAGE):latest $(MAKE) $(TASK)

docker-run-script: ## Run a script (build ...) on docker, example: make docker-run-script IMAGE=node:12 SCRIPT=bin/deploy/eb-deploy.sh
	@docker run --rm -v ${PWD}:${WORKDIR} -w ${WORKDIR} $(IMAGE):latest bash -c "$(SCRIPT)"

#######
##@ CI
######

prepare: ## Prepare folder for CI logs
	rm -rf $(LOGDIR)
	mkdir -p $(LOGDIR)

prettier: ## Format code with standards
	@$(PRETTIER) --write "{src,tests}/**/*.ts" --config ${CIDIR}/.prettierrc.json

jspcd: ## Find duplicate code using JSCPD and print human readable output. Intended for usage on the command line before committing.
	@$(JSCPD) src

jspcd-ci: ## Find duplicate code using JSCPD and log result in XML format. Intended for usage within a continuous integration environment.
	-@$(JSCPD) src --reporters xml --output ${LOGDIR}

tslint: ## Perform syntax check of sourcecode files. Intended for usage on the command line before committing.
	@$(TSLINT) -p tsconfig.json --config ${CIDIR}/tslint.json

tslint-ci: ## Perform syntax check of sourcecode files. Intended for usage within a continuous integration environment.
	-@$(TSLINT) -p tsconfig.json --config ${CIDIR}/tslint.json --out ${LOGDIR}/tslint-checkstyle.xml --format checkstyle | true

plato-ci: ## Generate complextity graphs.
	-@$(PLATO) -r -d ${LOGDIR}/plato src

typedoc: ## Generate project documentation using TypeDoc
	-@$(TYPEDOC) --out ${LOGDIR}/doc src

unit-test: ## Run unit tests with PHPUnit
	@printf "${COLOR_INFO}UNIT TESTS WITH COVERAGE${COLOR_END}\n"
	@${JEST} --config ${CIDIR}/jest.json --coverage --coverageDirectory=${LOGDIR}/jest

e2e-test: ## Run e2e tests with PHPUnit
	@printf "${COLOR_INFO}E2E TESTS WITH COVERAGE${COLOR_END}\n"
	@${JEST} --config ${CIDIR}/jest-e2e.json --coverage --coverageDirectory=${LOGDIR}/jest-e2e

test: ## Run tests
	@printf "${COLOR_INFO}TESTS WITH COVERAGE${COLOR_END}\n"
	$(MAKE) unit-test

unit-test-no-coverage: ## Run unit tests with PHPUnit (without generating code coverage reports)
	@printf "${COLOR_INFO}UNIT TESTS WITHOUT COVERAGE${COLOR_END}\n"
	@${JEST} --config ${CIDIR}/jest.json

test-no-coverage: ## Run unit tests (without generating code coverage reports)
	@printf "${COLOR_INFO}TESTS WITHOUT COVERAGE${COLOR_END}\n"
	$(MAKE) unit-test-no-coverage

static-analysis: ## Perform static analysis (intended to local)
	$(MAKE) prettier jspcd tslint test-no-coverage

static-analysis-ci: ## Perform static analysis (intended to ci)
	$(MAKE) jspcd-ci typedoc tslint-ci

quick-build-ci: ## Perform a lint check and runs the unit tests (without generating code coverage reports)
	$(MAKE) prepare install static-analysis-ci unit-test-no-coverage

full-build-ci: ## Perform static analysis, runs the tests, and generates project documentation
	@printf "${COLOR_INFO}FULL BUILD CI${COLOR_END}\n"
	$(MAKE) prepare install static-analysis-ci plato-ci test