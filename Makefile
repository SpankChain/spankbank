compile: clean
	truffle compile

generate:
	solc --abi ./contracts/SpankBank.sol --overwrite -o build/abi
	abigen --sol=./contracts/SpankBank.sol --pkg=spankbank > spankbank.go
	./node_modules/.bin/typechain --force --outDir ./ts/ './build/contracts/*.json'

clean:
	rm -rf ./build/*

build: compile generate

.PHONY: compile generate build clean
