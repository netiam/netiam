# build
all: build
	@tput setaf 6
	@echo "API successfully built"
	@tput sgr0

clean:
	rm -rf ./lib

init:
	mkdir -p ./lib

lint:
	jshint ./src

test: init lint test-coverage

test-unit:
	mocha --compilers js:babel/register

test-coverage:
	istanbul cover _mocha --report lcovonly -- -R spec && cat ./coverage/lcov.info | coveralls

watch:
	babel -w -d ./lib ./src

build: clean init
	babel -d ./lib ./src

dev: init watch

.PHONY: all
