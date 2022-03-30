PATH  := node_modules/.bin:$(PATH)
EMPTY :=

check:

sam-config:
	npm run config:sam

key-config:
	npm run config:key

front-config:
	npm run config:front

config:sam-config key-config front-config


install:check
	yarn install

test:check install config
	npm run test

coverage:test
	npm run coverage && scp -pr coverage $(COVERAGE_REPORT_DEST)

clean:
	rm -rf ./node_modules

api-deploy:
	sam build
	sam deploy

.PHONY: check install  test coverage  clean  config front-config sam-config key-config
