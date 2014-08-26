
test: clean
	@./node_modules/.bin/mocha \
		--harmony-generators \
		--require co-mocha \
		--require gnode \
		--reporter spec \
		--timeout 10s

clean:
	@rm -rf test/fixtures/*/{components,build}

.PHONY: test clean
