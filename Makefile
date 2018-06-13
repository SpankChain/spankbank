compile:
	truffle compile

generate:
	solc --abi ./contracts/SpankBank.sol --overwrite -o build/abi
	abigen --sol=./contracts/SpankBank.sol --pkg=spankbank > spankbank.go

clean:
	rm -rf ./build/*

build: compile generate

.PHONY: compile generate build
