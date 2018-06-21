// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package spankbank

import (
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// BasicTokenABI is the input ABI used to generate the binding from.
const BasicTokenABI = "[{\"constant\":false,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_owner\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"}]"

// BasicTokenBin is the compiled bytecode used for deploying new contracts.
const BasicTokenBin = `0x608060405234801561001057600080fd5b5061027f806100206000396000f3006080604052600436106100565763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166318160ddd811461005b57806370a0823114610082578063a9059cbb146100b0575b600080fd5b34801561006757600080fd5b506100706100f5565b60408051918252519081900360200190f35b34801561008e57600080fd5b5061007073ffffffffffffffffffffffffffffffffffffffff600435166100fb565b3480156100bc57600080fd5b506100e173ffffffffffffffffffffffffffffffffffffffff60043516602435610123565b604080519115158252519081900360200190f35b60015490565b73ffffffffffffffffffffffffffffffffffffffff1660009081526020819052604090205490565b600073ffffffffffffffffffffffffffffffffffffffff8316151561014757600080fd5b3360009081526020819052604090205482111561016357600080fd5b33600090815260208190526040902054610183908363ffffffff61022b16565b336000908152602081905260408082209290925573ffffffffffffffffffffffffffffffffffffffff8516815220546101c2908363ffffffff61023d16565b73ffffffffffffffffffffffffffffffffffffffff8416600081815260208181526040918290209390935580518581529051919233927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a350600192915050565b60008282111561023757fe5b50900390565b60008282018381101561024c57fe5b93925050505600a165627a7a72305820a523d8da78bc51dea6d4a3d58bf916716c7c384ed17b9a956fa158a3cba7b2210029`

// DeployBasicToken deploys a new Ethereum contract, binding an instance of BasicToken to it.
func DeployBasicToken(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *BasicToken, error) {
	parsed, err := abi.JSON(strings.NewReader(BasicTokenABI))
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	address, tx, contract, err := bind.DeployContract(auth, parsed, common.FromHex(BasicTokenBin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &BasicToken{BasicTokenCaller: BasicTokenCaller{contract: contract}, BasicTokenTransactor: BasicTokenTransactor{contract: contract}, BasicTokenFilterer: BasicTokenFilterer{contract: contract}}, nil
}

// BasicToken is an auto generated Go binding around an Ethereum contract.
type BasicToken struct {
	BasicTokenCaller     // Read-only binding to the contract
	BasicTokenTransactor // Write-only binding to the contract
	BasicTokenFilterer   // Log filterer for contract events
}

// BasicTokenCaller is an auto generated read-only Go binding around an Ethereum contract.
type BasicTokenCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// BasicTokenTransactor is an auto generated write-only Go binding around an Ethereum contract.
type BasicTokenTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// BasicTokenFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type BasicTokenFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// BasicTokenSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type BasicTokenSession struct {
	Contract     *BasicToken       // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// BasicTokenCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type BasicTokenCallerSession struct {
	Contract *BasicTokenCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts     // Call options to use throughout this session
}

// BasicTokenTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type BasicTokenTransactorSession struct {
	Contract     *BasicTokenTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts     // Transaction auth options to use throughout this session
}

// BasicTokenRaw is an auto generated low-level Go binding around an Ethereum contract.
type BasicTokenRaw struct {
	Contract *BasicToken // Generic contract binding to access the raw methods on
}

// BasicTokenCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type BasicTokenCallerRaw struct {
	Contract *BasicTokenCaller // Generic read-only contract binding to access the raw methods on
}

// BasicTokenTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type BasicTokenTransactorRaw struct {
	Contract *BasicTokenTransactor // Generic write-only contract binding to access the raw methods on
}

// NewBasicToken creates a new instance of BasicToken, bound to a specific deployed contract.
func NewBasicToken(address common.Address, backend bind.ContractBackend) (*BasicToken, error) {
	contract, err := bindBasicToken(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &BasicToken{BasicTokenCaller: BasicTokenCaller{contract: contract}, BasicTokenTransactor: BasicTokenTransactor{contract: contract}, BasicTokenFilterer: BasicTokenFilterer{contract: contract}}, nil
}

// NewBasicTokenCaller creates a new read-only instance of BasicToken, bound to a specific deployed contract.
func NewBasicTokenCaller(address common.Address, caller bind.ContractCaller) (*BasicTokenCaller, error) {
	contract, err := bindBasicToken(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &BasicTokenCaller{contract: contract}, nil
}

// NewBasicTokenTransactor creates a new write-only instance of BasicToken, bound to a specific deployed contract.
func NewBasicTokenTransactor(address common.Address, transactor bind.ContractTransactor) (*BasicTokenTransactor, error) {
	contract, err := bindBasicToken(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &BasicTokenTransactor{contract: contract}, nil
}

// NewBasicTokenFilterer creates a new log filterer instance of BasicToken, bound to a specific deployed contract.
func NewBasicTokenFilterer(address common.Address, filterer bind.ContractFilterer) (*BasicTokenFilterer, error) {
	contract, err := bindBasicToken(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &BasicTokenFilterer{contract: contract}, nil
}

// bindBasicToken binds a generic wrapper to an already deployed contract.
func bindBasicToken(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(BasicTokenABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_BasicToken *BasicTokenRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _BasicToken.Contract.BasicTokenCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_BasicToken *BasicTokenRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _BasicToken.Contract.BasicTokenTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_BasicToken *BasicTokenRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _BasicToken.Contract.BasicTokenTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_BasicToken *BasicTokenCallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _BasicToken.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_BasicToken *BasicTokenTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _BasicToken.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_BasicToken *BasicTokenTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _BasicToken.Contract.contract.Transact(opts, method, params...)
}

// BalanceOf is a paid mutator transaction binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(_owner address) returns(uint256)
func (_BasicToken *BasicTokenTransactor) BalanceOf(opts *bind.TransactOpts, _owner common.Address) (*types.Transaction, error) {
	return _BasicToken.contract.Transact(opts, "balanceOf", _owner)
}

// BalanceOf is a paid mutator transaction binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(_owner address) returns(uint256)
func (_BasicToken *BasicTokenSession) BalanceOf(_owner common.Address) (*types.Transaction, error) {
	return _BasicToken.Contract.BalanceOf(&_BasicToken.TransactOpts, _owner)
}

// BalanceOf is a paid mutator transaction binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(_owner address) returns(uint256)
func (_BasicToken *BasicTokenTransactorSession) BalanceOf(_owner common.Address) (*types.Transaction, error) {
	return _BasicToken.Contract.BalanceOf(&_BasicToken.TransactOpts, _owner)
}

// TotalSupply is a paid mutator transaction binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() returns(uint256)
func (_BasicToken *BasicTokenTransactor) TotalSupply(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _BasicToken.contract.Transact(opts, "totalSupply")
}

// TotalSupply is a paid mutator transaction binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() returns(uint256)
func (_BasicToken *BasicTokenSession) TotalSupply() (*types.Transaction, error) {
	return _BasicToken.Contract.TotalSupply(&_BasicToken.TransactOpts)
}

// TotalSupply is a paid mutator transaction binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() returns(uint256)
func (_BasicToken *BasicTokenTransactorSession) TotalSupply() (*types.Transaction, error) {
	return _BasicToken.Contract.TotalSupply(&_BasicToken.TransactOpts)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(_to address, _value uint256) returns(bool)
func (_BasicToken *BasicTokenTransactor) Transfer(opts *bind.TransactOpts, _to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _BasicToken.contract.Transact(opts, "transfer", _to, _value)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(_to address, _value uint256) returns(bool)
func (_BasicToken *BasicTokenSession) Transfer(_to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _BasicToken.Contract.Transfer(&_BasicToken.TransactOpts, _to, _value)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(_to address, _value uint256) returns(bool)
func (_BasicToken *BasicTokenTransactorSession) Transfer(_to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _BasicToken.Contract.Transfer(&_BasicToken.TransactOpts, _to, _value)
}

// BasicTokenTransferIterator is returned from FilterTransfer and is used to iterate over the raw logs and unpacked data for Transfer events raised by the BasicToken contract.
type BasicTokenTransferIterator struct {
	Event *BasicTokenTransfer // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *BasicTokenTransferIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(BasicTokenTransfer)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(BasicTokenTransfer)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *BasicTokenTransferIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *BasicTokenTransferIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// BasicTokenTransfer represents a Transfer event raised by the BasicToken contract.
type BasicTokenTransfer struct {
	From  common.Address
	To    common.Address
	Value *big.Int
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterTransfer is a free log retrieval operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: e Transfer(from indexed address, to indexed address, value uint256)
func (_BasicToken *BasicTokenFilterer) FilterTransfer(opts *bind.FilterOpts, from []common.Address, to []common.Address) (*BasicTokenTransferIterator, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _BasicToken.contract.FilterLogs(opts, "Transfer", fromRule, toRule)
	if err != nil {
		return nil, err
	}
	return &BasicTokenTransferIterator{contract: _BasicToken.contract, event: "Transfer", logs: logs, sub: sub}, nil
}

// WatchTransfer is a free log subscription operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: e Transfer(from indexed address, to indexed address, value uint256)
func (_BasicToken *BasicTokenFilterer) WatchTransfer(opts *bind.WatchOpts, sink chan<- *BasicTokenTransfer, from []common.Address, to []common.Address) (event.Subscription, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _BasicToken.contract.WatchLogs(opts, "Transfer", fromRule, toRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(BasicTokenTransfer)
				if err := _BasicToken.contract.UnpackLog(event, "Transfer", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ERC20ABI is the input ABI used to generate the binding from.
const ERC20ABI = "[{\"constant\":false,\"inputs\":[{\"name\":\"spender\",\"type\":\"address\"},{\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"from\",\"type\":\"address\"},{\"name\":\"to\",\"type\":\"address\"},{\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"who\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"to\",\"type\":\"address\"},{\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"owner\",\"type\":\"address\"},{\"name\":\"spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"spender\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"}]"

// ERC20Bin is the compiled bytecode used for deploying new contracts.
const ERC20Bin = `0x`

// DeployERC20 deploys a new Ethereum contract, binding an instance of ERC20 to it.
func DeployERC20(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *ERC20, error) {
	parsed, err := abi.JSON(strings.NewReader(ERC20ABI))
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	address, tx, contract, err := bind.DeployContract(auth, parsed, common.FromHex(ERC20Bin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &ERC20{ERC20Caller: ERC20Caller{contract: contract}, ERC20Transactor: ERC20Transactor{contract: contract}, ERC20Filterer: ERC20Filterer{contract: contract}}, nil
}

// ERC20 is an auto generated Go binding around an Ethereum contract.
type ERC20 struct {
	ERC20Caller     // Read-only binding to the contract
	ERC20Transactor // Write-only binding to the contract
	ERC20Filterer   // Log filterer for contract events
}

// ERC20Caller is an auto generated read-only Go binding around an Ethereum contract.
type ERC20Caller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ERC20Transactor is an auto generated write-only Go binding around an Ethereum contract.
type ERC20Transactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ERC20Filterer is an auto generated log filtering Go binding around an Ethereum contract events.
type ERC20Filterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ERC20Session is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type ERC20Session struct {
	Contract     *ERC20            // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// ERC20CallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type ERC20CallerSession struct {
	Contract *ERC20Caller  // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts // Call options to use throughout this session
}

// ERC20TransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type ERC20TransactorSession struct {
	Contract     *ERC20Transactor  // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// ERC20Raw is an auto generated low-level Go binding around an Ethereum contract.
type ERC20Raw struct {
	Contract *ERC20 // Generic contract binding to access the raw methods on
}

// ERC20CallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type ERC20CallerRaw struct {
	Contract *ERC20Caller // Generic read-only contract binding to access the raw methods on
}

// ERC20TransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type ERC20TransactorRaw struct {
	Contract *ERC20Transactor // Generic write-only contract binding to access the raw methods on
}

// NewERC20 creates a new instance of ERC20, bound to a specific deployed contract.
func NewERC20(address common.Address, backend bind.ContractBackend) (*ERC20, error) {
	contract, err := bindERC20(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &ERC20{ERC20Caller: ERC20Caller{contract: contract}, ERC20Transactor: ERC20Transactor{contract: contract}, ERC20Filterer: ERC20Filterer{contract: contract}}, nil
}

// NewERC20Caller creates a new read-only instance of ERC20, bound to a specific deployed contract.
func NewERC20Caller(address common.Address, caller bind.ContractCaller) (*ERC20Caller, error) {
	contract, err := bindERC20(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &ERC20Caller{contract: contract}, nil
}

// NewERC20Transactor creates a new write-only instance of ERC20, bound to a specific deployed contract.
func NewERC20Transactor(address common.Address, transactor bind.ContractTransactor) (*ERC20Transactor, error) {
	contract, err := bindERC20(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &ERC20Transactor{contract: contract}, nil
}

// NewERC20Filterer creates a new log filterer instance of ERC20, bound to a specific deployed contract.
func NewERC20Filterer(address common.Address, filterer bind.ContractFilterer) (*ERC20Filterer, error) {
	contract, err := bindERC20(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &ERC20Filterer{contract: contract}, nil
}

// bindERC20 binds a generic wrapper to an already deployed contract.
func bindERC20(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(ERC20ABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_ERC20 *ERC20Raw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _ERC20.Contract.ERC20Caller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_ERC20 *ERC20Raw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _ERC20.Contract.ERC20Transactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_ERC20 *ERC20Raw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _ERC20.Contract.ERC20Transactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_ERC20 *ERC20CallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _ERC20.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_ERC20 *ERC20TransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _ERC20.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_ERC20 *ERC20TransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _ERC20.Contract.contract.Transact(opts, method, params...)
}

// Allowance is a paid mutator transaction binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(owner address, spender address) returns(uint256)
func (_ERC20 *ERC20Transactor) Allowance(opts *bind.TransactOpts, owner common.Address, spender common.Address) (*types.Transaction, error) {
	return _ERC20.contract.Transact(opts, "allowance", owner, spender)
}

// Allowance is a paid mutator transaction binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(owner address, spender address) returns(uint256)
func (_ERC20 *ERC20Session) Allowance(owner common.Address, spender common.Address) (*types.Transaction, error) {
	return _ERC20.Contract.Allowance(&_ERC20.TransactOpts, owner, spender)
}

// Allowance is a paid mutator transaction binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(owner address, spender address) returns(uint256)
func (_ERC20 *ERC20TransactorSession) Allowance(owner common.Address, spender common.Address) (*types.Transaction, error) {
	return _ERC20.Contract.Allowance(&_ERC20.TransactOpts, owner, spender)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(spender address, value uint256) returns(bool)
func (_ERC20 *ERC20Transactor) Approve(opts *bind.TransactOpts, spender common.Address, value *big.Int) (*types.Transaction, error) {
	return _ERC20.contract.Transact(opts, "approve", spender, value)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(spender address, value uint256) returns(bool)
func (_ERC20 *ERC20Session) Approve(spender common.Address, value *big.Int) (*types.Transaction, error) {
	return _ERC20.Contract.Approve(&_ERC20.TransactOpts, spender, value)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(spender address, value uint256) returns(bool)
func (_ERC20 *ERC20TransactorSession) Approve(spender common.Address, value *big.Int) (*types.Transaction, error) {
	return _ERC20.Contract.Approve(&_ERC20.TransactOpts, spender, value)
}

// BalanceOf is a paid mutator transaction binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(who address) returns(uint256)
func (_ERC20 *ERC20Transactor) BalanceOf(opts *bind.TransactOpts, who common.Address) (*types.Transaction, error) {
	return _ERC20.contract.Transact(opts, "balanceOf", who)
}

// BalanceOf is a paid mutator transaction binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(who address) returns(uint256)
func (_ERC20 *ERC20Session) BalanceOf(who common.Address) (*types.Transaction, error) {
	return _ERC20.Contract.BalanceOf(&_ERC20.TransactOpts, who)
}

// BalanceOf is a paid mutator transaction binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(who address) returns(uint256)
func (_ERC20 *ERC20TransactorSession) BalanceOf(who common.Address) (*types.Transaction, error) {
	return _ERC20.Contract.BalanceOf(&_ERC20.TransactOpts, who)
}

// TotalSupply is a paid mutator transaction binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() returns(uint256)
func (_ERC20 *ERC20Transactor) TotalSupply(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _ERC20.contract.Transact(opts, "totalSupply")
}

// TotalSupply is a paid mutator transaction binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() returns(uint256)
func (_ERC20 *ERC20Session) TotalSupply() (*types.Transaction, error) {
	return _ERC20.Contract.TotalSupply(&_ERC20.TransactOpts)
}

// TotalSupply is a paid mutator transaction binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() returns(uint256)
func (_ERC20 *ERC20TransactorSession) TotalSupply() (*types.Transaction, error) {
	return _ERC20.Contract.TotalSupply(&_ERC20.TransactOpts)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(to address, value uint256) returns(bool)
func (_ERC20 *ERC20Transactor) Transfer(opts *bind.TransactOpts, to common.Address, value *big.Int) (*types.Transaction, error) {
	return _ERC20.contract.Transact(opts, "transfer", to, value)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(to address, value uint256) returns(bool)
func (_ERC20 *ERC20Session) Transfer(to common.Address, value *big.Int) (*types.Transaction, error) {
	return _ERC20.Contract.Transfer(&_ERC20.TransactOpts, to, value)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(to address, value uint256) returns(bool)
func (_ERC20 *ERC20TransactorSession) Transfer(to common.Address, value *big.Int) (*types.Transaction, error) {
	return _ERC20.Contract.Transfer(&_ERC20.TransactOpts, to, value)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(from address, to address, value uint256) returns(bool)
func (_ERC20 *ERC20Transactor) TransferFrom(opts *bind.TransactOpts, from common.Address, to common.Address, value *big.Int) (*types.Transaction, error) {
	return _ERC20.contract.Transact(opts, "transferFrom", from, to, value)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(from address, to address, value uint256) returns(bool)
func (_ERC20 *ERC20Session) TransferFrom(from common.Address, to common.Address, value *big.Int) (*types.Transaction, error) {
	return _ERC20.Contract.TransferFrom(&_ERC20.TransactOpts, from, to, value)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(from address, to address, value uint256) returns(bool)
func (_ERC20 *ERC20TransactorSession) TransferFrom(from common.Address, to common.Address, value *big.Int) (*types.Transaction, error) {
	return _ERC20.Contract.TransferFrom(&_ERC20.TransactOpts, from, to, value)
}

// ERC20ApprovalIterator is returned from FilterApproval and is used to iterate over the raw logs and unpacked data for Approval events raised by the ERC20 contract.
type ERC20ApprovalIterator struct {
	Event *ERC20Approval // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *ERC20ApprovalIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(ERC20Approval)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(ERC20Approval)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *ERC20ApprovalIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *ERC20ApprovalIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// ERC20Approval represents a Approval event raised by the ERC20 contract.
type ERC20Approval struct {
	Owner   common.Address
	Spender common.Address
	Value   *big.Int
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterApproval is a free log retrieval operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: e Approval(owner indexed address, spender indexed address, value uint256)
func (_ERC20 *ERC20Filterer) FilterApproval(opts *bind.FilterOpts, owner []common.Address, spender []common.Address) (*ERC20ApprovalIterator, error) {

	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}
	var spenderRule []interface{}
	for _, spenderItem := range spender {
		spenderRule = append(spenderRule, spenderItem)
	}

	logs, sub, err := _ERC20.contract.FilterLogs(opts, "Approval", ownerRule, spenderRule)
	if err != nil {
		return nil, err
	}
	return &ERC20ApprovalIterator{contract: _ERC20.contract, event: "Approval", logs: logs, sub: sub}, nil
}

// WatchApproval is a free log subscription operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: e Approval(owner indexed address, spender indexed address, value uint256)
func (_ERC20 *ERC20Filterer) WatchApproval(opts *bind.WatchOpts, sink chan<- *ERC20Approval, owner []common.Address, spender []common.Address) (event.Subscription, error) {

	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}
	var spenderRule []interface{}
	for _, spenderItem := range spender {
		spenderRule = append(spenderRule, spenderItem)
	}

	logs, sub, err := _ERC20.contract.WatchLogs(opts, "Approval", ownerRule, spenderRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(ERC20Approval)
				if err := _ERC20.contract.UnpackLog(event, "Approval", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ERC20TransferIterator is returned from FilterTransfer and is used to iterate over the raw logs and unpacked data for Transfer events raised by the ERC20 contract.
type ERC20TransferIterator struct {
	Event *ERC20Transfer // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *ERC20TransferIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(ERC20Transfer)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(ERC20Transfer)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *ERC20TransferIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *ERC20TransferIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// ERC20Transfer represents a Transfer event raised by the ERC20 contract.
type ERC20Transfer struct {
	From  common.Address
	To    common.Address
	Value *big.Int
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterTransfer is a free log retrieval operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: e Transfer(from indexed address, to indexed address, value uint256)
func (_ERC20 *ERC20Filterer) FilterTransfer(opts *bind.FilterOpts, from []common.Address, to []common.Address) (*ERC20TransferIterator, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _ERC20.contract.FilterLogs(opts, "Transfer", fromRule, toRule)
	if err != nil {
		return nil, err
	}
	return &ERC20TransferIterator{contract: _ERC20.contract, event: "Transfer", logs: logs, sub: sub}, nil
}

// WatchTransfer is a free log subscription operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: e Transfer(from indexed address, to indexed address, value uint256)
func (_ERC20 *ERC20Filterer) WatchTransfer(opts *bind.WatchOpts, sink chan<- *ERC20Transfer, from []common.Address, to []common.Address) (event.Subscription, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _ERC20.contract.WatchLogs(opts, "Transfer", fromRule, toRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(ERC20Transfer)
				if err := _ERC20.contract.UnpackLog(event, "Transfer", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ERC20BasicABI is the input ABI used to generate the binding from.
const ERC20BasicABI = "[{\"constant\":false,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"who\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"to\",\"type\":\"address\"},{\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"}]"

// ERC20BasicBin is the compiled bytecode used for deploying new contracts.
const ERC20BasicBin = `0x`

// DeployERC20Basic deploys a new Ethereum contract, binding an instance of ERC20Basic to it.
func DeployERC20Basic(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *ERC20Basic, error) {
	parsed, err := abi.JSON(strings.NewReader(ERC20BasicABI))
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	address, tx, contract, err := bind.DeployContract(auth, parsed, common.FromHex(ERC20BasicBin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &ERC20Basic{ERC20BasicCaller: ERC20BasicCaller{contract: contract}, ERC20BasicTransactor: ERC20BasicTransactor{contract: contract}, ERC20BasicFilterer: ERC20BasicFilterer{contract: contract}}, nil
}

// ERC20Basic is an auto generated Go binding around an Ethereum contract.
type ERC20Basic struct {
	ERC20BasicCaller     // Read-only binding to the contract
	ERC20BasicTransactor // Write-only binding to the contract
	ERC20BasicFilterer   // Log filterer for contract events
}

// ERC20BasicCaller is an auto generated read-only Go binding around an Ethereum contract.
type ERC20BasicCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ERC20BasicTransactor is an auto generated write-only Go binding around an Ethereum contract.
type ERC20BasicTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ERC20BasicFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type ERC20BasicFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ERC20BasicSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type ERC20BasicSession struct {
	Contract     *ERC20Basic       // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// ERC20BasicCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type ERC20BasicCallerSession struct {
	Contract *ERC20BasicCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts     // Call options to use throughout this session
}

// ERC20BasicTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type ERC20BasicTransactorSession struct {
	Contract     *ERC20BasicTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts     // Transaction auth options to use throughout this session
}

// ERC20BasicRaw is an auto generated low-level Go binding around an Ethereum contract.
type ERC20BasicRaw struct {
	Contract *ERC20Basic // Generic contract binding to access the raw methods on
}

// ERC20BasicCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type ERC20BasicCallerRaw struct {
	Contract *ERC20BasicCaller // Generic read-only contract binding to access the raw methods on
}

// ERC20BasicTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type ERC20BasicTransactorRaw struct {
	Contract *ERC20BasicTransactor // Generic write-only contract binding to access the raw methods on
}

// NewERC20Basic creates a new instance of ERC20Basic, bound to a specific deployed contract.
func NewERC20Basic(address common.Address, backend bind.ContractBackend) (*ERC20Basic, error) {
	contract, err := bindERC20Basic(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &ERC20Basic{ERC20BasicCaller: ERC20BasicCaller{contract: contract}, ERC20BasicTransactor: ERC20BasicTransactor{contract: contract}, ERC20BasicFilterer: ERC20BasicFilterer{contract: contract}}, nil
}

// NewERC20BasicCaller creates a new read-only instance of ERC20Basic, bound to a specific deployed contract.
func NewERC20BasicCaller(address common.Address, caller bind.ContractCaller) (*ERC20BasicCaller, error) {
	contract, err := bindERC20Basic(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &ERC20BasicCaller{contract: contract}, nil
}

// NewERC20BasicTransactor creates a new write-only instance of ERC20Basic, bound to a specific deployed contract.
func NewERC20BasicTransactor(address common.Address, transactor bind.ContractTransactor) (*ERC20BasicTransactor, error) {
	contract, err := bindERC20Basic(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &ERC20BasicTransactor{contract: contract}, nil
}

// NewERC20BasicFilterer creates a new log filterer instance of ERC20Basic, bound to a specific deployed contract.
func NewERC20BasicFilterer(address common.Address, filterer bind.ContractFilterer) (*ERC20BasicFilterer, error) {
	contract, err := bindERC20Basic(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &ERC20BasicFilterer{contract: contract}, nil
}

// bindERC20Basic binds a generic wrapper to an already deployed contract.
func bindERC20Basic(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(ERC20BasicABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_ERC20Basic *ERC20BasicRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _ERC20Basic.Contract.ERC20BasicCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_ERC20Basic *ERC20BasicRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _ERC20Basic.Contract.ERC20BasicTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_ERC20Basic *ERC20BasicRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _ERC20Basic.Contract.ERC20BasicTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_ERC20Basic *ERC20BasicCallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _ERC20Basic.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_ERC20Basic *ERC20BasicTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _ERC20Basic.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_ERC20Basic *ERC20BasicTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _ERC20Basic.Contract.contract.Transact(opts, method, params...)
}

// BalanceOf is a paid mutator transaction binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(who address) returns(uint256)
func (_ERC20Basic *ERC20BasicTransactor) BalanceOf(opts *bind.TransactOpts, who common.Address) (*types.Transaction, error) {
	return _ERC20Basic.contract.Transact(opts, "balanceOf", who)
}

// BalanceOf is a paid mutator transaction binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(who address) returns(uint256)
func (_ERC20Basic *ERC20BasicSession) BalanceOf(who common.Address) (*types.Transaction, error) {
	return _ERC20Basic.Contract.BalanceOf(&_ERC20Basic.TransactOpts, who)
}

// BalanceOf is a paid mutator transaction binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(who address) returns(uint256)
func (_ERC20Basic *ERC20BasicTransactorSession) BalanceOf(who common.Address) (*types.Transaction, error) {
	return _ERC20Basic.Contract.BalanceOf(&_ERC20Basic.TransactOpts, who)
}

// TotalSupply is a paid mutator transaction binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() returns(uint256)
func (_ERC20Basic *ERC20BasicTransactor) TotalSupply(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _ERC20Basic.contract.Transact(opts, "totalSupply")
}

// TotalSupply is a paid mutator transaction binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() returns(uint256)
func (_ERC20Basic *ERC20BasicSession) TotalSupply() (*types.Transaction, error) {
	return _ERC20Basic.Contract.TotalSupply(&_ERC20Basic.TransactOpts)
}

// TotalSupply is a paid mutator transaction binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() returns(uint256)
func (_ERC20Basic *ERC20BasicTransactorSession) TotalSupply() (*types.Transaction, error) {
	return _ERC20Basic.Contract.TotalSupply(&_ERC20Basic.TransactOpts)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(to address, value uint256) returns(bool)
func (_ERC20Basic *ERC20BasicTransactor) Transfer(opts *bind.TransactOpts, to common.Address, value *big.Int) (*types.Transaction, error) {
	return _ERC20Basic.contract.Transact(opts, "transfer", to, value)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(to address, value uint256) returns(bool)
func (_ERC20Basic *ERC20BasicSession) Transfer(to common.Address, value *big.Int) (*types.Transaction, error) {
	return _ERC20Basic.Contract.Transfer(&_ERC20Basic.TransactOpts, to, value)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(to address, value uint256) returns(bool)
func (_ERC20Basic *ERC20BasicTransactorSession) Transfer(to common.Address, value *big.Int) (*types.Transaction, error) {
	return _ERC20Basic.Contract.Transfer(&_ERC20Basic.TransactOpts, to, value)
}

// ERC20BasicTransferIterator is returned from FilterTransfer and is used to iterate over the raw logs and unpacked data for Transfer events raised by the ERC20Basic contract.
type ERC20BasicTransferIterator struct {
	Event *ERC20BasicTransfer // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *ERC20BasicTransferIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(ERC20BasicTransfer)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(ERC20BasicTransfer)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *ERC20BasicTransferIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *ERC20BasicTransferIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// ERC20BasicTransfer represents a Transfer event raised by the ERC20Basic contract.
type ERC20BasicTransfer struct {
	From  common.Address
	To    common.Address
	Value *big.Int
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterTransfer is a free log retrieval operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: e Transfer(from indexed address, to indexed address, value uint256)
func (_ERC20Basic *ERC20BasicFilterer) FilterTransfer(opts *bind.FilterOpts, from []common.Address, to []common.Address) (*ERC20BasicTransferIterator, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _ERC20Basic.contract.FilterLogs(opts, "Transfer", fromRule, toRule)
	if err != nil {
		return nil, err
	}
	return &ERC20BasicTransferIterator{contract: _ERC20Basic.contract, event: "Transfer", logs: logs, sub: sub}, nil
}

// WatchTransfer is a free log subscription operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: e Transfer(from indexed address, to indexed address, value uint256)
func (_ERC20Basic *ERC20BasicFilterer) WatchTransfer(opts *bind.WatchOpts, sink chan<- *ERC20BasicTransfer, from []common.Address, to []common.Address) (event.Subscription, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _ERC20Basic.contract.WatchLogs(opts, "Transfer", fromRule, toRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(ERC20BasicTransfer)
				if err := _ERC20Basic.contract.UnpackLog(event, "Transfer", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// HumanStandardTokenABI is the input ABI used to generate the binding from.
const HumanStandardTokenABI = "[{\"constant\":true,\"inputs\":[],\"name\":\"name\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_spender\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"name\":\"success\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_from\",\"type\":\"address\"},{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"name\":\"success\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"decimals\",\"outputs\":[{\"name\":\"\",\"type\":\"uint8\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"version\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_owner\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"balance\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"symbol\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"name\":\"success\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_spender\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"},{\"name\":\"_extraData\",\"type\":\"bytes\"}],\"name\":\"approveAndCall\",\"outputs\":[{\"name\":\"success\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_owner\",\"type\":\"address\"},{\"name\":\"_spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"name\":\"remaining\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"name\":\"_initialAmount\",\"type\":\"uint256\"},{\"name\":\"_tokenName\",\"type\":\"string\"},{\"name\":\"_decimalUnits\",\"type\":\"uint8\"},{\"name\":\"_tokenSymbol\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"_from\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"_to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"_owner\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"_spender\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"}]"

// HumanStandardTokenBin is the compiled bytecode used for deploying new contracts.
const HumanStandardTokenBin = `0x60c0604052600460808190527f48302e310000000000000000000000000000000000000000000000000000000060a090815261003e91600691906100d0565b5034801561004b57600080fd5b5060405161097f38038061097f8339810160409081528151602080840151838501516060860151336000908152600185529586208590559484905590850180519395909491939101916100a3916003918601906100d0565b506004805460ff191660ff841617905580516100c69060059060208401906100d0565b505050505061016b565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061011157805160ff191683800117855561013e565b8280016001018555821561013e579182015b8281111561013e578251825591602001919060010190610123565b5061014a92915061014e565b5090565b61016891905b8082111561014a5760008155600101610154565b90565b6108058061017a6000396000f3006080604052600436106100955763ffffffff60e060020a60003504166306fdde03811461009a578063095ea7b31461012457806318160ddd1461015c57806323b872dd14610183578063313ce567146101ad57806354fd4d50146101d857806370a08231146101ed57806395d89b411461020e578063a9059cbb14610223578063cae9ca5114610247578063dd62ed3e146102b0575b600080fd5b3480156100a657600080fd5b506100af6102d7565b6040805160208082528351818301528351919283929083019185019080838360005b838110156100e95781810151838201526020016100d1565b50505050905090810190601f1680156101165780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561013057600080fd5b50610148600160a060020a0360043516602435610365565b604080519115158252519081900360200190f35b34801561016857600080fd5b506101716103cb565b60408051918252519081900360200190f35b34801561018f57600080fd5b50610148600160a060020a03600435811690602435166044356103d1565b3480156101b957600080fd5b506101c26104af565b6040805160ff9092168252519081900360200190f35b3480156101e457600080fd5b506100af6104b8565b3480156101f957600080fd5b50610171600160a060020a0360043516610513565b34801561021a57600080fd5b506100af61052e565b34801561022f57600080fd5b50610148600160a060020a0360043516602435610589565b34801561025357600080fd5b50604080516020600460443581810135601f8101849004840285018401909552848452610148948235600160a060020a03169460248035953695946064949201919081908401838280828437509497506106139650505050505050565b3480156102bc57600080fd5b50610171600160a060020a03600435811690602435166107ae565b6003805460408051602060026001851615610100026000190190941693909304601f8101849004840282018401909252818152929183018282801561035d5780601f106103325761010080835404028352916020019161035d565b820191906000526020600020905b81548152906001019060200180831161034057829003601f168201915b505050505081565b336000818152600260209081526040808320600160a060020a038716808552908352818420869055815186815291519394909390927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925928290030190a350600192915050565b60005481565b600160a060020a038316600090815260016020526040812054821180159061041c5750600160a060020a03841660009081526002602090815260408083203384529091529020548211155b151561042757600080fd5b600160a060020a03808416600081815260016020908152604080832080548801905593881680835284832080548890039055600282528483203384528252918490208054879003905583518681529351929391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35060019392505050565b60045460ff1681565b6006805460408051602060026001851615610100026000190190941693909304601f8101849004840282018401909252818152929183018282801561035d5780601f106103325761010080835404028352916020019161035d565b600160a060020a031660009081526001602052604090205490565b6005805460408051602060026001851615610100026000190190941693909304601f8101849004840282018401909252818152929183018282801561035d5780601f106103325761010080835404028352916020019161035d565b336000908152600160205260408120548211156105a557600080fd5b33600081815260016020908152604080832080548790039055600160a060020a03871680845292819020805487019055805186815290519293927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef929181900390910190a350600192915050565b336000818152600260209081526040808320600160a060020a038816808552908352818420879055815187815291519394909390927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925928290030190a383600160a060020a031660405180807f72656365697665417070726f76616c28616464726573732c75696e743235362c81526020017f616464726573732c627974657329000000000000000000000000000000000000815250602e019050604051809103902060e060020a9004338530866040518563ffffffff1660e060020a0281526004018085600160a060020a0316600160a060020a0316815260200184815260200183600160a060020a0316600160a060020a03168152602001828051906020019080838360005b8381101561075357818101518382015260200161073b565b50505050905090810190601f1680156107805780820380516001836020036101000a031916815260200191505b509450505050506000604051808303816000875af19250505015156107a457600080fd5b5060019392505050565b600160a060020a039182166000908152600260209081526040808320939094168252919091522054905600a165627a7a72305820b9a4a53fb17f87234847437f967b35823b6244ce7127ffaa371b854461dc1fc80029`

// DeployHumanStandardToken deploys a new Ethereum contract, binding an instance of HumanStandardToken to it.
func DeployHumanStandardToken(auth *bind.TransactOpts, backend bind.ContractBackend, _initialAmount *big.Int, _tokenName string, _decimalUnits uint8, _tokenSymbol string) (common.Address, *types.Transaction, *HumanStandardToken, error) {
	parsed, err := abi.JSON(strings.NewReader(HumanStandardTokenABI))
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	address, tx, contract, err := bind.DeployContract(auth, parsed, common.FromHex(HumanStandardTokenBin), backend, _initialAmount, _tokenName, _decimalUnits, _tokenSymbol)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &HumanStandardToken{HumanStandardTokenCaller: HumanStandardTokenCaller{contract: contract}, HumanStandardTokenTransactor: HumanStandardTokenTransactor{contract: contract}, HumanStandardTokenFilterer: HumanStandardTokenFilterer{contract: contract}}, nil
}

// HumanStandardToken is an auto generated Go binding around an Ethereum contract.
type HumanStandardToken struct {
	HumanStandardTokenCaller     // Read-only binding to the contract
	HumanStandardTokenTransactor // Write-only binding to the contract
	HumanStandardTokenFilterer   // Log filterer for contract events
}

// HumanStandardTokenCaller is an auto generated read-only Go binding around an Ethereum contract.
type HumanStandardTokenCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// HumanStandardTokenTransactor is an auto generated write-only Go binding around an Ethereum contract.
type HumanStandardTokenTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// HumanStandardTokenFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type HumanStandardTokenFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// HumanStandardTokenSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type HumanStandardTokenSession struct {
	Contract     *HumanStandardToken // Generic contract binding to set the session for
	CallOpts     bind.CallOpts       // Call options to use throughout this session
	TransactOpts bind.TransactOpts   // Transaction auth options to use throughout this session
}

// HumanStandardTokenCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type HumanStandardTokenCallerSession struct {
	Contract *HumanStandardTokenCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts             // Call options to use throughout this session
}

// HumanStandardTokenTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type HumanStandardTokenTransactorSession struct {
	Contract     *HumanStandardTokenTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts             // Transaction auth options to use throughout this session
}

// HumanStandardTokenRaw is an auto generated low-level Go binding around an Ethereum contract.
type HumanStandardTokenRaw struct {
	Contract *HumanStandardToken // Generic contract binding to access the raw methods on
}

// HumanStandardTokenCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type HumanStandardTokenCallerRaw struct {
	Contract *HumanStandardTokenCaller // Generic read-only contract binding to access the raw methods on
}

// HumanStandardTokenTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type HumanStandardTokenTransactorRaw struct {
	Contract *HumanStandardTokenTransactor // Generic write-only contract binding to access the raw methods on
}

// NewHumanStandardToken creates a new instance of HumanStandardToken, bound to a specific deployed contract.
func NewHumanStandardToken(address common.Address, backend bind.ContractBackend) (*HumanStandardToken, error) {
	contract, err := bindHumanStandardToken(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &HumanStandardToken{HumanStandardTokenCaller: HumanStandardTokenCaller{contract: contract}, HumanStandardTokenTransactor: HumanStandardTokenTransactor{contract: contract}, HumanStandardTokenFilterer: HumanStandardTokenFilterer{contract: contract}}, nil
}

// NewHumanStandardTokenCaller creates a new read-only instance of HumanStandardToken, bound to a specific deployed contract.
func NewHumanStandardTokenCaller(address common.Address, caller bind.ContractCaller) (*HumanStandardTokenCaller, error) {
	contract, err := bindHumanStandardToken(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &HumanStandardTokenCaller{contract: contract}, nil
}

// NewHumanStandardTokenTransactor creates a new write-only instance of HumanStandardToken, bound to a specific deployed contract.
func NewHumanStandardTokenTransactor(address common.Address, transactor bind.ContractTransactor) (*HumanStandardTokenTransactor, error) {
	contract, err := bindHumanStandardToken(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &HumanStandardTokenTransactor{contract: contract}, nil
}

// NewHumanStandardTokenFilterer creates a new log filterer instance of HumanStandardToken, bound to a specific deployed contract.
func NewHumanStandardTokenFilterer(address common.Address, filterer bind.ContractFilterer) (*HumanStandardTokenFilterer, error) {
	contract, err := bindHumanStandardToken(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &HumanStandardTokenFilterer{contract: contract}, nil
}

// bindHumanStandardToken binds a generic wrapper to an already deployed contract.
func bindHumanStandardToken(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(HumanStandardTokenABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_HumanStandardToken *HumanStandardTokenRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _HumanStandardToken.Contract.HumanStandardTokenCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_HumanStandardToken *HumanStandardTokenRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _HumanStandardToken.Contract.HumanStandardTokenTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_HumanStandardToken *HumanStandardTokenRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _HumanStandardToken.Contract.HumanStandardTokenTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_HumanStandardToken *HumanStandardTokenCallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _HumanStandardToken.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_HumanStandardToken *HumanStandardTokenTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _HumanStandardToken.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_HumanStandardToken *HumanStandardTokenTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _HumanStandardToken.Contract.contract.Transact(opts, method, params...)
}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(_owner address, _spender address) constant returns(remaining uint256)
func (_HumanStandardToken *HumanStandardTokenCaller) Allowance(opts *bind.CallOpts, _owner common.Address, _spender common.Address) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _HumanStandardToken.contract.Call(opts, out, "allowance", _owner, _spender)
	return *ret0, err
}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(_owner address, _spender address) constant returns(remaining uint256)
func (_HumanStandardToken *HumanStandardTokenSession) Allowance(_owner common.Address, _spender common.Address) (*big.Int, error) {
	return _HumanStandardToken.Contract.Allowance(&_HumanStandardToken.CallOpts, _owner, _spender)
}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(_owner address, _spender address) constant returns(remaining uint256)
func (_HumanStandardToken *HumanStandardTokenCallerSession) Allowance(_owner common.Address, _spender common.Address) (*big.Int, error) {
	return _HumanStandardToken.Contract.Allowance(&_HumanStandardToken.CallOpts, _owner, _spender)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(_owner address) constant returns(balance uint256)
func (_HumanStandardToken *HumanStandardTokenCaller) BalanceOf(opts *bind.CallOpts, _owner common.Address) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _HumanStandardToken.contract.Call(opts, out, "balanceOf", _owner)
	return *ret0, err
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(_owner address) constant returns(balance uint256)
func (_HumanStandardToken *HumanStandardTokenSession) BalanceOf(_owner common.Address) (*big.Int, error) {
	return _HumanStandardToken.Contract.BalanceOf(&_HumanStandardToken.CallOpts, _owner)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(_owner address) constant returns(balance uint256)
func (_HumanStandardToken *HumanStandardTokenCallerSession) BalanceOf(_owner common.Address) (*big.Int, error) {
	return _HumanStandardToken.Contract.BalanceOf(&_HumanStandardToken.CallOpts, _owner)
}

// Decimals is a free data retrieval call binding the contract method 0x313ce567.
//
// Solidity: function decimals() constant returns(uint8)
func (_HumanStandardToken *HumanStandardTokenCaller) Decimals(opts *bind.CallOpts) (uint8, error) {
	var (
		ret0 = new(uint8)
	)
	out := ret0
	err := _HumanStandardToken.contract.Call(opts, out, "decimals")
	return *ret0, err
}

// Decimals is a free data retrieval call binding the contract method 0x313ce567.
//
// Solidity: function decimals() constant returns(uint8)
func (_HumanStandardToken *HumanStandardTokenSession) Decimals() (uint8, error) {
	return _HumanStandardToken.Contract.Decimals(&_HumanStandardToken.CallOpts)
}

// Decimals is a free data retrieval call binding the contract method 0x313ce567.
//
// Solidity: function decimals() constant returns(uint8)
func (_HumanStandardToken *HumanStandardTokenCallerSession) Decimals() (uint8, error) {
	return _HumanStandardToken.Contract.Decimals(&_HumanStandardToken.CallOpts)
}

// Name is a free data retrieval call binding the contract method 0x06fdde03.
//
// Solidity: function name() constant returns(string)
func (_HumanStandardToken *HumanStandardTokenCaller) Name(opts *bind.CallOpts) (string, error) {
	var (
		ret0 = new(string)
	)
	out := ret0
	err := _HumanStandardToken.contract.Call(opts, out, "name")
	return *ret0, err
}

// Name is a free data retrieval call binding the contract method 0x06fdde03.
//
// Solidity: function name() constant returns(string)
func (_HumanStandardToken *HumanStandardTokenSession) Name() (string, error) {
	return _HumanStandardToken.Contract.Name(&_HumanStandardToken.CallOpts)
}

// Name is a free data retrieval call binding the contract method 0x06fdde03.
//
// Solidity: function name() constant returns(string)
func (_HumanStandardToken *HumanStandardTokenCallerSession) Name() (string, error) {
	return _HumanStandardToken.Contract.Name(&_HumanStandardToken.CallOpts)
}

// Symbol is a free data retrieval call binding the contract method 0x95d89b41.
//
// Solidity: function symbol() constant returns(string)
func (_HumanStandardToken *HumanStandardTokenCaller) Symbol(opts *bind.CallOpts) (string, error) {
	var (
		ret0 = new(string)
	)
	out := ret0
	err := _HumanStandardToken.contract.Call(opts, out, "symbol")
	return *ret0, err
}

// Symbol is a free data retrieval call binding the contract method 0x95d89b41.
//
// Solidity: function symbol() constant returns(string)
func (_HumanStandardToken *HumanStandardTokenSession) Symbol() (string, error) {
	return _HumanStandardToken.Contract.Symbol(&_HumanStandardToken.CallOpts)
}

// Symbol is a free data retrieval call binding the contract method 0x95d89b41.
//
// Solidity: function symbol() constant returns(string)
func (_HumanStandardToken *HumanStandardTokenCallerSession) Symbol() (string, error) {
	return _HumanStandardToken.Contract.Symbol(&_HumanStandardToken.CallOpts)
}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() constant returns(uint256)
func (_HumanStandardToken *HumanStandardTokenCaller) TotalSupply(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _HumanStandardToken.contract.Call(opts, out, "totalSupply")
	return *ret0, err
}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() constant returns(uint256)
func (_HumanStandardToken *HumanStandardTokenSession) TotalSupply() (*big.Int, error) {
	return _HumanStandardToken.Contract.TotalSupply(&_HumanStandardToken.CallOpts)
}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() constant returns(uint256)
func (_HumanStandardToken *HumanStandardTokenCallerSession) TotalSupply() (*big.Int, error) {
	return _HumanStandardToken.Contract.TotalSupply(&_HumanStandardToken.CallOpts)
}

// Version is a free data retrieval call binding the contract method 0x54fd4d50.
//
// Solidity: function version() constant returns(string)
func (_HumanStandardToken *HumanStandardTokenCaller) Version(opts *bind.CallOpts) (string, error) {
	var (
		ret0 = new(string)
	)
	out := ret0
	err := _HumanStandardToken.contract.Call(opts, out, "version")
	return *ret0, err
}

// Version is a free data retrieval call binding the contract method 0x54fd4d50.
//
// Solidity: function version() constant returns(string)
func (_HumanStandardToken *HumanStandardTokenSession) Version() (string, error) {
	return _HumanStandardToken.Contract.Version(&_HumanStandardToken.CallOpts)
}

// Version is a free data retrieval call binding the contract method 0x54fd4d50.
//
// Solidity: function version() constant returns(string)
func (_HumanStandardToken *HumanStandardTokenCallerSession) Version() (string, error) {
	return _HumanStandardToken.Contract.Version(&_HumanStandardToken.CallOpts)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(_spender address, _value uint256) returns(success bool)
func (_HumanStandardToken *HumanStandardTokenTransactor) Approve(opts *bind.TransactOpts, _spender common.Address, _value *big.Int) (*types.Transaction, error) {
	return _HumanStandardToken.contract.Transact(opts, "approve", _spender, _value)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(_spender address, _value uint256) returns(success bool)
func (_HumanStandardToken *HumanStandardTokenSession) Approve(_spender common.Address, _value *big.Int) (*types.Transaction, error) {
	return _HumanStandardToken.Contract.Approve(&_HumanStandardToken.TransactOpts, _spender, _value)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(_spender address, _value uint256) returns(success bool)
func (_HumanStandardToken *HumanStandardTokenTransactorSession) Approve(_spender common.Address, _value *big.Int) (*types.Transaction, error) {
	return _HumanStandardToken.Contract.Approve(&_HumanStandardToken.TransactOpts, _spender, _value)
}

// ApproveAndCall is a paid mutator transaction binding the contract method 0xcae9ca51.
//
// Solidity: function approveAndCall(_spender address, _value uint256, _extraData bytes) returns(success bool)
func (_HumanStandardToken *HumanStandardTokenTransactor) ApproveAndCall(opts *bind.TransactOpts, _spender common.Address, _value *big.Int, _extraData []byte) (*types.Transaction, error) {
	return _HumanStandardToken.contract.Transact(opts, "approveAndCall", _spender, _value, _extraData)
}

// ApproveAndCall is a paid mutator transaction binding the contract method 0xcae9ca51.
//
// Solidity: function approveAndCall(_spender address, _value uint256, _extraData bytes) returns(success bool)
func (_HumanStandardToken *HumanStandardTokenSession) ApproveAndCall(_spender common.Address, _value *big.Int, _extraData []byte) (*types.Transaction, error) {
	return _HumanStandardToken.Contract.ApproveAndCall(&_HumanStandardToken.TransactOpts, _spender, _value, _extraData)
}

// ApproveAndCall is a paid mutator transaction binding the contract method 0xcae9ca51.
//
// Solidity: function approveAndCall(_spender address, _value uint256, _extraData bytes) returns(success bool)
func (_HumanStandardToken *HumanStandardTokenTransactorSession) ApproveAndCall(_spender common.Address, _value *big.Int, _extraData []byte) (*types.Transaction, error) {
	return _HumanStandardToken.Contract.ApproveAndCall(&_HumanStandardToken.TransactOpts, _spender, _value, _extraData)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(_to address, _value uint256) returns(success bool)
func (_HumanStandardToken *HumanStandardTokenTransactor) Transfer(opts *bind.TransactOpts, _to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _HumanStandardToken.contract.Transact(opts, "transfer", _to, _value)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(_to address, _value uint256) returns(success bool)
func (_HumanStandardToken *HumanStandardTokenSession) Transfer(_to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _HumanStandardToken.Contract.Transfer(&_HumanStandardToken.TransactOpts, _to, _value)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(_to address, _value uint256) returns(success bool)
func (_HumanStandardToken *HumanStandardTokenTransactorSession) Transfer(_to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _HumanStandardToken.Contract.Transfer(&_HumanStandardToken.TransactOpts, _to, _value)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(_from address, _to address, _value uint256) returns(success bool)
func (_HumanStandardToken *HumanStandardTokenTransactor) TransferFrom(opts *bind.TransactOpts, _from common.Address, _to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _HumanStandardToken.contract.Transact(opts, "transferFrom", _from, _to, _value)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(_from address, _to address, _value uint256) returns(success bool)
func (_HumanStandardToken *HumanStandardTokenSession) TransferFrom(_from common.Address, _to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _HumanStandardToken.Contract.TransferFrom(&_HumanStandardToken.TransactOpts, _from, _to, _value)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(_from address, _to address, _value uint256) returns(success bool)
func (_HumanStandardToken *HumanStandardTokenTransactorSession) TransferFrom(_from common.Address, _to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _HumanStandardToken.Contract.TransferFrom(&_HumanStandardToken.TransactOpts, _from, _to, _value)
}

// HumanStandardTokenApprovalIterator is returned from FilterApproval and is used to iterate over the raw logs and unpacked data for Approval events raised by the HumanStandardToken contract.
type HumanStandardTokenApprovalIterator struct {
	Event *HumanStandardTokenApproval // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *HumanStandardTokenApprovalIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(HumanStandardTokenApproval)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(HumanStandardTokenApproval)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *HumanStandardTokenApprovalIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *HumanStandardTokenApprovalIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// HumanStandardTokenApproval represents a Approval event raised by the HumanStandardToken contract.
type HumanStandardTokenApproval struct {
	Owner   common.Address
	Spender common.Address
	Value   *big.Int
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterApproval is a free log retrieval operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: e Approval(_owner indexed address, _spender indexed address, _value uint256)
func (_HumanStandardToken *HumanStandardTokenFilterer) FilterApproval(opts *bind.FilterOpts, _owner []common.Address, _spender []common.Address) (*HumanStandardTokenApprovalIterator, error) {

	var _ownerRule []interface{}
	for _, _ownerItem := range _owner {
		_ownerRule = append(_ownerRule, _ownerItem)
	}
	var _spenderRule []interface{}
	for _, _spenderItem := range _spender {
		_spenderRule = append(_spenderRule, _spenderItem)
	}

	logs, sub, err := _HumanStandardToken.contract.FilterLogs(opts, "Approval", _ownerRule, _spenderRule)
	if err != nil {
		return nil, err
	}
	return &HumanStandardTokenApprovalIterator{contract: _HumanStandardToken.contract, event: "Approval", logs: logs, sub: sub}, nil
}

// WatchApproval is a free log subscription operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: e Approval(_owner indexed address, _spender indexed address, _value uint256)
func (_HumanStandardToken *HumanStandardTokenFilterer) WatchApproval(opts *bind.WatchOpts, sink chan<- *HumanStandardTokenApproval, _owner []common.Address, _spender []common.Address) (event.Subscription, error) {

	var _ownerRule []interface{}
	for _, _ownerItem := range _owner {
		_ownerRule = append(_ownerRule, _ownerItem)
	}
	var _spenderRule []interface{}
	for _, _spenderItem := range _spender {
		_spenderRule = append(_spenderRule, _spenderItem)
	}

	logs, sub, err := _HumanStandardToken.contract.WatchLogs(opts, "Approval", _ownerRule, _spenderRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(HumanStandardTokenApproval)
				if err := _HumanStandardToken.contract.UnpackLog(event, "Approval", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// HumanStandardTokenTransferIterator is returned from FilterTransfer and is used to iterate over the raw logs and unpacked data for Transfer events raised by the HumanStandardToken contract.
type HumanStandardTokenTransferIterator struct {
	Event *HumanStandardTokenTransfer // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *HumanStandardTokenTransferIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(HumanStandardTokenTransfer)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(HumanStandardTokenTransfer)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *HumanStandardTokenTransferIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *HumanStandardTokenTransferIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// HumanStandardTokenTransfer represents a Transfer event raised by the HumanStandardToken contract.
type HumanStandardTokenTransfer struct {
	From  common.Address
	To    common.Address
	Value *big.Int
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterTransfer is a free log retrieval operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: e Transfer(_from indexed address, _to indexed address, _value uint256)
func (_HumanStandardToken *HumanStandardTokenFilterer) FilterTransfer(opts *bind.FilterOpts, _from []common.Address, _to []common.Address) (*HumanStandardTokenTransferIterator, error) {

	var _fromRule []interface{}
	for _, _fromItem := range _from {
		_fromRule = append(_fromRule, _fromItem)
	}
	var _toRule []interface{}
	for _, _toItem := range _to {
		_toRule = append(_toRule, _toItem)
	}

	logs, sub, err := _HumanStandardToken.contract.FilterLogs(opts, "Transfer", _fromRule, _toRule)
	if err != nil {
		return nil, err
	}
	return &HumanStandardTokenTransferIterator{contract: _HumanStandardToken.contract, event: "Transfer", logs: logs, sub: sub}, nil
}

// WatchTransfer is a free log subscription operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: e Transfer(_from indexed address, _to indexed address, _value uint256)
func (_HumanStandardToken *HumanStandardTokenFilterer) WatchTransfer(opts *bind.WatchOpts, sink chan<- *HumanStandardTokenTransfer, _from []common.Address, _to []common.Address) (event.Subscription, error) {

	var _fromRule []interface{}
	for _, _fromItem := range _from {
		_fromRule = append(_fromRule, _fromItem)
	}
	var _toRule []interface{}
	for _, _toItem := range _to {
		_toRule = append(_toRule, _toItem)
	}

	logs, sub, err := _HumanStandardToken.contract.WatchLogs(opts, "Transfer", _fromRule, _toRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(HumanStandardTokenTransfer)
				if err := _HumanStandardToken.contract.UnpackLog(event, "Transfer", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// MintableTokenABI is the input ABI used to generate the binding from.
const MintableTokenABI = "[{\"constant\":true,\"inputs\":[],\"name\":\"mintingFinished\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_spender\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_from\",\"type\":\"address\"},{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_amount\",\"type\":\"uint256\"}],\"name\":\"mint\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"burn\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_spender\",\"type\":\"address\"},{\"name\":\"_subtractedValue\",\"type\":\"uint256\"}],\"name\":\"decreaseApproval\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_owner\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"finishMinting\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_spender\",\"type\":\"address\"},{\"name\":\"_addedValue\",\"type\":\"uint256\"}],\"name\":\"increaseApproval\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_owner\",\"type\":\"address\"},{\"name\":\"_spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"Mint\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[],\"name\":\"MintFinished\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"burner\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Burn\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"spender\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"}]"

// MintableTokenBin is the compiled bytecode used for deploying new contracts.
const MintableTokenBin = `0x608060405260038054600160a860020a03191633179055610b35806100256000396000f3006080604052600436106100cf5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166305d2035b81146100d4578063095ea7b3146100fd57806318160ddd1461012157806323b872dd1461014857806340c10f191461017257806342966c681461019657806366188463146101b057806370a08231146101d45780637d64bcb4146101f55780638da5cb5b1461020a578063a9059cbb1461023b578063d73dd6231461025f578063dd62ed3e14610283578063f2fde38b146102aa575b600080fd5b3480156100e057600080fd5b506100e96102cb565b604080519115158252519081900360200190f35b34801561010957600080fd5b506100e9600160a060020a03600435166024356102ec565b34801561012d57600080fd5b50610136610352565b60408051918252519081900360200190f35b34801561015457600080fd5b506100e9600160a060020a0360043581169060243516604435610358565b34801561017e57600080fd5b506100e9600160a060020a03600435166024356104bd565b3480156101a257600080fd5b506101ae6004356105c6565b005b3480156101bc57600080fd5b506100e9600160a060020a03600435166024356105ea565b3480156101e057600080fd5b50610136600160a060020a03600435166106da565b34801561020157600080fd5b506100e96106f5565b34801561021657600080fd5b5061021f61079b565b60408051600160a060020a039092168252519081900360200190f35b34801561024757600080fd5b506100e9600160a060020a03600435166024356107aa565b34801561026b57600080fd5b506100e9600160a060020a0360043516602435610879565b34801561028f57600080fd5b50610136600160a060020a0360043581169060243516610912565b3480156102b657600080fd5b506101ae600160a060020a036004351661093d565b60035474010000000000000000000000000000000000000000900460ff1681565b336000818152600260209081526040808320600160a060020a038716808552908352818420869055815186815291519394909390927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925928290030190a350600192915050565b60015490565b6000600160a060020a038316151561036f57600080fd5b600160a060020a03841660009081526020819052604090205482111561039457600080fd5b600160a060020a03841660009081526002602090815260408083203384529091529020548211156103c457600080fd5b600160a060020a0384166000908152602081905260409020546103ed908363ffffffff6109d216565b600160a060020a038086166000908152602081905260408082209390935590851681522054610422908363ffffffff6109e416565b600160a060020a03808516600090815260208181526040808320949094559187168152600282528281203382529091522054610464908363ffffffff6109d216565b600160a060020a0380861660008181526002602090815260408083203384528252918290209490945580518681529051928716939192600080516020610aea833981519152929181900390910190a35060019392505050565b600354600090600160a060020a031633146104d757600080fd5b60035474010000000000000000000000000000000000000000900460ff16156104ff57600080fd5b600154610512908363ffffffff6109e416565b600155600160a060020a03831660009081526020819052604090205461053e908363ffffffff6109e416565b600160a060020a03841660008181526020818152604091829020939093558051858152905191927f0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d412139688592918290030190a2604080518381529051600160a060020a03851691600091600080516020610aea8339815191529181900360200190a350600192915050565b600354600160a060020a031633146105dd57600080fd5b6105e733826109fa565b50565b336000908152600260209081526040808320600160a060020a03861684529091528120548083111561063f57336000908152600260209081526040808320600160a060020a0388168452909152812055610674565b61064f818463ffffffff6109d216565b336000908152600260209081526040808320600160a060020a03891684529091529020555b336000818152600260209081526040808320600160a060020a0389168085529083529281902054815190815290519293927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929181900390910190a35060019392505050565b600160a060020a031660009081526020819052604090205490565b600354600090600160a060020a0316331461070f57600080fd5b60035474010000000000000000000000000000000000000000900460ff161561073757600080fd5b6003805474ff00000000000000000000000000000000000000001916740100000000000000000000000000000000000000001790556040517fae5184fba832cb2b1f702aca6117b8d265eaf03ad33eb133f19dde0f5920fa0890600090a150600190565b600354600160a060020a031681565b6000600160a060020a03831615156107c157600080fd5b336000908152602081905260409020548211156107dd57600080fd5b336000908152602081905260409020546107fd908363ffffffff6109d216565b3360009081526020819052604080822092909255600160a060020a0385168152205461082f908363ffffffff6109e416565b600160a060020a03841660008181526020818152604091829020939093558051858152905191923392600080516020610aea8339815191529281900390910190a350600192915050565b336000908152600260209081526040808320600160a060020a03861684529091528120546108ad908363ffffffff6109e416565b336000818152600260209081526040808320600160a060020a0389168085529083529281902085905580519485525191937f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929081900390910190a350600192915050565b600160a060020a03918216600090815260026020908152604080832093909416825291909152205490565b600354600160a060020a0316331461095457600080fd5b600160a060020a038116151561096957600080fd5b600354604051600160a060020a038084169216907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a36003805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0392909216919091179055565b6000828211156109de57fe5b50900390565b6000828201838110156109f357fe5b9392505050565b600160a060020a038216600090815260208190526040902054811115610a1f57600080fd5b600160a060020a038216600090815260208190526040902054610a48908263ffffffff6109d216565b600160a060020a038316600090815260208190526040902055600154610a74908263ffffffff6109d216565b600155604080518281529051600160a060020a038416917fcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d397ca5919081900360200190a2604080518281529051600091600160a060020a03851691600080516020610aea8339815191529181900360200190a350505600ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa165627a7a7230582038b2d61fa0b543d9aba9088973162c7d38a1f4689ef6754349ebdc67d04963490029`

// DeployMintableToken deploys a new Ethereum contract, binding an instance of MintableToken to it.
func DeployMintableToken(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *MintableToken, error) {
	parsed, err := abi.JSON(strings.NewReader(MintableTokenABI))
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	address, tx, contract, err := bind.DeployContract(auth, parsed, common.FromHex(MintableTokenBin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &MintableToken{MintableTokenCaller: MintableTokenCaller{contract: contract}, MintableTokenTransactor: MintableTokenTransactor{contract: contract}, MintableTokenFilterer: MintableTokenFilterer{contract: contract}}, nil
}

// MintableToken is an auto generated Go binding around an Ethereum contract.
type MintableToken struct {
	MintableTokenCaller     // Read-only binding to the contract
	MintableTokenTransactor // Write-only binding to the contract
	MintableTokenFilterer   // Log filterer for contract events
}

// MintableTokenCaller is an auto generated read-only Go binding around an Ethereum contract.
type MintableTokenCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// MintableTokenTransactor is an auto generated write-only Go binding around an Ethereum contract.
type MintableTokenTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// MintableTokenFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type MintableTokenFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// MintableTokenSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type MintableTokenSession struct {
	Contract     *MintableToken    // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// MintableTokenCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type MintableTokenCallerSession struct {
	Contract *MintableTokenCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts        // Call options to use throughout this session
}

// MintableTokenTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type MintableTokenTransactorSession struct {
	Contract     *MintableTokenTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts        // Transaction auth options to use throughout this session
}

// MintableTokenRaw is an auto generated low-level Go binding around an Ethereum contract.
type MintableTokenRaw struct {
	Contract *MintableToken // Generic contract binding to access the raw methods on
}

// MintableTokenCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type MintableTokenCallerRaw struct {
	Contract *MintableTokenCaller // Generic read-only contract binding to access the raw methods on
}

// MintableTokenTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type MintableTokenTransactorRaw struct {
	Contract *MintableTokenTransactor // Generic write-only contract binding to access the raw methods on
}

// NewMintableToken creates a new instance of MintableToken, bound to a specific deployed contract.
func NewMintableToken(address common.Address, backend bind.ContractBackend) (*MintableToken, error) {
	contract, err := bindMintableToken(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &MintableToken{MintableTokenCaller: MintableTokenCaller{contract: contract}, MintableTokenTransactor: MintableTokenTransactor{contract: contract}, MintableTokenFilterer: MintableTokenFilterer{contract: contract}}, nil
}

// NewMintableTokenCaller creates a new read-only instance of MintableToken, bound to a specific deployed contract.
func NewMintableTokenCaller(address common.Address, caller bind.ContractCaller) (*MintableTokenCaller, error) {
	contract, err := bindMintableToken(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &MintableTokenCaller{contract: contract}, nil
}

// NewMintableTokenTransactor creates a new write-only instance of MintableToken, bound to a specific deployed contract.
func NewMintableTokenTransactor(address common.Address, transactor bind.ContractTransactor) (*MintableTokenTransactor, error) {
	contract, err := bindMintableToken(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &MintableTokenTransactor{contract: contract}, nil
}

// NewMintableTokenFilterer creates a new log filterer instance of MintableToken, bound to a specific deployed contract.
func NewMintableTokenFilterer(address common.Address, filterer bind.ContractFilterer) (*MintableTokenFilterer, error) {
	contract, err := bindMintableToken(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &MintableTokenFilterer{contract: contract}, nil
}

// bindMintableToken binds a generic wrapper to an already deployed contract.
func bindMintableToken(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(MintableTokenABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_MintableToken *MintableTokenRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _MintableToken.Contract.MintableTokenCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_MintableToken *MintableTokenRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _MintableToken.Contract.MintableTokenTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_MintableToken *MintableTokenRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _MintableToken.Contract.MintableTokenTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_MintableToken *MintableTokenCallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _MintableToken.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_MintableToken *MintableTokenTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _MintableToken.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_MintableToken *MintableTokenTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _MintableToken.Contract.contract.Transact(opts, method, params...)
}

// MintingFinished is a free data retrieval call binding the contract method 0x05d2035b.
//
// Solidity: function mintingFinished() constant returns(bool)
func (_MintableToken *MintableTokenCaller) MintingFinished(opts *bind.CallOpts) (bool, error) {
	var (
		ret0 = new(bool)
	)
	out := ret0
	err := _MintableToken.contract.Call(opts, out, "mintingFinished")
	return *ret0, err
}

// MintingFinished is a free data retrieval call binding the contract method 0x05d2035b.
//
// Solidity: function mintingFinished() constant returns(bool)
func (_MintableToken *MintableTokenSession) MintingFinished() (bool, error) {
	return _MintableToken.Contract.MintingFinished(&_MintableToken.CallOpts)
}

// MintingFinished is a free data retrieval call binding the contract method 0x05d2035b.
//
// Solidity: function mintingFinished() constant returns(bool)
func (_MintableToken *MintableTokenCallerSession) MintingFinished() (bool, error) {
	return _MintableToken.Contract.MintingFinished(&_MintableToken.CallOpts)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_MintableToken *MintableTokenCaller) Owner(opts *bind.CallOpts) (common.Address, error) {
	var (
		ret0 = new(common.Address)
	)
	out := ret0
	err := _MintableToken.contract.Call(opts, out, "owner")
	return *ret0, err
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_MintableToken *MintableTokenSession) Owner() (common.Address, error) {
	return _MintableToken.Contract.Owner(&_MintableToken.CallOpts)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_MintableToken *MintableTokenCallerSession) Owner() (common.Address, error) {
	return _MintableToken.Contract.Owner(&_MintableToken.CallOpts)
}

// Allowance is a paid mutator transaction binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(_owner address, _spender address) returns(uint256)
func (_MintableToken *MintableTokenTransactor) Allowance(opts *bind.TransactOpts, _owner common.Address, _spender common.Address) (*types.Transaction, error) {
	return _MintableToken.contract.Transact(opts, "allowance", _owner, _spender)
}

// Allowance is a paid mutator transaction binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(_owner address, _spender address) returns(uint256)
func (_MintableToken *MintableTokenSession) Allowance(_owner common.Address, _spender common.Address) (*types.Transaction, error) {
	return _MintableToken.Contract.Allowance(&_MintableToken.TransactOpts, _owner, _spender)
}

// Allowance is a paid mutator transaction binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(_owner address, _spender address) returns(uint256)
func (_MintableToken *MintableTokenTransactorSession) Allowance(_owner common.Address, _spender common.Address) (*types.Transaction, error) {
	return _MintableToken.Contract.Allowance(&_MintableToken.TransactOpts, _owner, _spender)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(_spender address, _value uint256) returns(bool)
func (_MintableToken *MintableTokenTransactor) Approve(opts *bind.TransactOpts, _spender common.Address, _value *big.Int) (*types.Transaction, error) {
	return _MintableToken.contract.Transact(opts, "approve", _spender, _value)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(_spender address, _value uint256) returns(bool)
func (_MintableToken *MintableTokenSession) Approve(_spender common.Address, _value *big.Int) (*types.Transaction, error) {
	return _MintableToken.Contract.Approve(&_MintableToken.TransactOpts, _spender, _value)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(_spender address, _value uint256) returns(bool)
func (_MintableToken *MintableTokenTransactorSession) Approve(_spender common.Address, _value *big.Int) (*types.Transaction, error) {
	return _MintableToken.Contract.Approve(&_MintableToken.TransactOpts, _spender, _value)
}

// BalanceOf is a paid mutator transaction binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(_owner address) returns(uint256)
func (_MintableToken *MintableTokenTransactor) BalanceOf(opts *bind.TransactOpts, _owner common.Address) (*types.Transaction, error) {
	return _MintableToken.contract.Transact(opts, "balanceOf", _owner)
}

// BalanceOf is a paid mutator transaction binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(_owner address) returns(uint256)
func (_MintableToken *MintableTokenSession) BalanceOf(_owner common.Address) (*types.Transaction, error) {
	return _MintableToken.Contract.BalanceOf(&_MintableToken.TransactOpts, _owner)
}

// BalanceOf is a paid mutator transaction binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(_owner address) returns(uint256)
func (_MintableToken *MintableTokenTransactorSession) BalanceOf(_owner common.Address) (*types.Transaction, error) {
	return _MintableToken.Contract.BalanceOf(&_MintableToken.TransactOpts, _owner)
}

// Burn is a paid mutator transaction binding the contract method 0x42966c68.
//
// Solidity: function burn(_value uint256) returns()
func (_MintableToken *MintableTokenTransactor) Burn(opts *bind.TransactOpts, _value *big.Int) (*types.Transaction, error) {
	return _MintableToken.contract.Transact(opts, "burn", _value)
}

// Burn is a paid mutator transaction binding the contract method 0x42966c68.
//
// Solidity: function burn(_value uint256) returns()
func (_MintableToken *MintableTokenSession) Burn(_value *big.Int) (*types.Transaction, error) {
	return _MintableToken.Contract.Burn(&_MintableToken.TransactOpts, _value)
}

// Burn is a paid mutator transaction binding the contract method 0x42966c68.
//
// Solidity: function burn(_value uint256) returns()
func (_MintableToken *MintableTokenTransactorSession) Burn(_value *big.Int) (*types.Transaction, error) {
	return _MintableToken.Contract.Burn(&_MintableToken.TransactOpts, _value)
}

// DecreaseApproval is a paid mutator transaction binding the contract method 0x66188463.
//
// Solidity: function decreaseApproval(_spender address, _subtractedValue uint256) returns(bool)
func (_MintableToken *MintableTokenTransactor) DecreaseApproval(opts *bind.TransactOpts, _spender common.Address, _subtractedValue *big.Int) (*types.Transaction, error) {
	return _MintableToken.contract.Transact(opts, "decreaseApproval", _spender, _subtractedValue)
}

// DecreaseApproval is a paid mutator transaction binding the contract method 0x66188463.
//
// Solidity: function decreaseApproval(_spender address, _subtractedValue uint256) returns(bool)
func (_MintableToken *MintableTokenSession) DecreaseApproval(_spender common.Address, _subtractedValue *big.Int) (*types.Transaction, error) {
	return _MintableToken.Contract.DecreaseApproval(&_MintableToken.TransactOpts, _spender, _subtractedValue)
}

// DecreaseApproval is a paid mutator transaction binding the contract method 0x66188463.
//
// Solidity: function decreaseApproval(_spender address, _subtractedValue uint256) returns(bool)
func (_MintableToken *MintableTokenTransactorSession) DecreaseApproval(_spender common.Address, _subtractedValue *big.Int) (*types.Transaction, error) {
	return _MintableToken.Contract.DecreaseApproval(&_MintableToken.TransactOpts, _spender, _subtractedValue)
}

// FinishMinting is a paid mutator transaction binding the contract method 0x7d64bcb4.
//
// Solidity: function finishMinting() returns(bool)
func (_MintableToken *MintableTokenTransactor) FinishMinting(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _MintableToken.contract.Transact(opts, "finishMinting")
}

// FinishMinting is a paid mutator transaction binding the contract method 0x7d64bcb4.
//
// Solidity: function finishMinting() returns(bool)
func (_MintableToken *MintableTokenSession) FinishMinting() (*types.Transaction, error) {
	return _MintableToken.Contract.FinishMinting(&_MintableToken.TransactOpts)
}

// FinishMinting is a paid mutator transaction binding the contract method 0x7d64bcb4.
//
// Solidity: function finishMinting() returns(bool)
func (_MintableToken *MintableTokenTransactorSession) FinishMinting() (*types.Transaction, error) {
	return _MintableToken.Contract.FinishMinting(&_MintableToken.TransactOpts)
}

// IncreaseApproval is a paid mutator transaction binding the contract method 0xd73dd623.
//
// Solidity: function increaseApproval(_spender address, _addedValue uint256) returns(bool)
func (_MintableToken *MintableTokenTransactor) IncreaseApproval(opts *bind.TransactOpts, _spender common.Address, _addedValue *big.Int) (*types.Transaction, error) {
	return _MintableToken.contract.Transact(opts, "increaseApproval", _spender, _addedValue)
}

// IncreaseApproval is a paid mutator transaction binding the contract method 0xd73dd623.
//
// Solidity: function increaseApproval(_spender address, _addedValue uint256) returns(bool)
func (_MintableToken *MintableTokenSession) IncreaseApproval(_spender common.Address, _addedValue *big.Int) (*types.Transaction, error) {
	return _MintableToken.Contract.IncreaseApproval(&_MintableToken.TransactOpts, _spender, _addedValue)
}

// IncreaseApproval is a paid mutator transaction binding the contract method 0xd73dd623.
//
// Solidity: function increaseApproval(_spender address, _addedValue uint256) returns(bool)
func (_MintableToken *MintableTokenTransactorSession) IncreaseApproval(_spender common.Address, _addedValue *big.Int) (*types.Transaction, error) {
	return _MintableToken.Contract.IncreaseApproval(&_MintableToken.TransactOpts, _spender, _addedValue)
}

// Mint is a paid mutator transaction binding the contract method 0x40c10f19.
//
// Solidity: function mint(_to address, _amount uint256) returns(bool)
func (_MintableToken *MintableTokenTransactor) Mint(opts *bind.TransactOpts, _to common.Address, _amount *big.Int) (*types.Transaction, error) {
	return _MintableToken.contract.Transact(opts, "mint", _to, _amount)
}

// Mint is a paid mutator transaction binding the contract method 0x40c10f19.
//
// Solidity: function mint(_to address, _amount uint256) returns(bool)
func (_MintableToken *MintableTokenSession) Mint(_to common.Address, _amount *big.Int) (*types.Transaction, error) {
	return _MintableToken.Contract.Mint(&_MintableToken.TransactOpts, _to, _amount)
}

// Mint is a paid mutator transaction binding the contract method 0x40c10f19.
//
// Solidity: function mint(_to address, _amount uint256) returns(bool)
func (_MintableToken *MintableTokenTransactorSession) Mint(_to common.Address, _amount *big.Int) (*types.Transaction, error) {
	return _MintableToken.Contract.Mint(&_MintableToken.TransactOpts, _to, _amount)
}

// TotalSupply is a paid mutator transaction binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() returns(uint256)
func (_MintableToken *MintableTokenTransactor) TotalSupply(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _MintableToken.contract.Transact(opts, "totalSupply")
}

// TotalSupply is a paid mutator transaction binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() returns(uint256)
func (_MintableToken *MintableTokenSession) TotalSupply() (*types.Transaction, error) {
	return _MintableToken.Contract.TotalSupply(&_MintableToken.TransactOpts)
}

// TotalSupply is a paid mutator transaction binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() returns(uint256)
func (_MintableToken *MintableTokenTransactorSession) TotalSupply() (*types.Transaction, error) {
	return _MintableToken.Contract.TotalSupply(&_MintableToken.TransactOpts)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(_to address, _value uint256) returns(bool)
func (_MintableToken *MintableTokenTransactor) Transfer(opts *bind.TransactOpts, _to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _MintableToken.contract.Transact(opts, "transfer", _to, _value)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(_to address, _value uint256) returns(bool)
func (_MintableToken *MintableTokenSession) Transfer(_to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _MintableToken.Contract.Transfer(&_MintableToken.TransactOpts, _to, _value)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(_to address, _value uint256) returns(bool)
func (_MintableToken *MintableTokenTransactorSession) Transfer(_to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _MintableToken.Contract.Transfer(&_MintableToken.TransactOpts, _to, _value)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(_from address, _to address, _value uint256) returns(bool)
func (_MintableToken *MintableTokenTransactor) TransferFrom(opts *bind.TransactOpts, _from common.Address, _to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _MintableToken.contract.Transact(opts, "transferFrom", _from, _to, _value)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(_from address, _to address, _value uint256) returns(bool)
func (_MintableToken *MintableTokenSession) TransferFrom(_from common.Address, _to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _MintableToken.Contract.TransferFrom(&_MintableToken.TransactOpts, _from, _to, _value)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(_from address, _to address, _value uint256) returns(bool)
func (_MintableToken *MintableTokenTransactorSession) TransferFrom(_from common.Address, _to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _MintableToken.Contract.TransferFrom(&_MintableToken.TransactOpts, _from, _to, _value)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(newOwner address) returns()
func (_MintableToken *MintableTokenTransactor) TransferOwnership(opts *bind.TransactOpts, newOwner common.Address) (*types.Transaction, error) {
	return _MintableToken.contract.Transact(opts, "transferOwnership", newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(newOwner address) returns()
func (_MintableToken *MintableTokenSession) TransferOwnership(newOwner common.Address) (*types.Transaction, error) {
	return _MintableToken.Contract.TransferOwnership(&_MintableToken.TransactOpts, newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(newOwner address) returns()
func (_MintableToken *MintableTokenTransactorSession) TransferOwnership(newOwner common.Address) (*types.Transaction, error) {
	return _MintableToken.Contract.TransferOwnership(&_MintableToken.TransactOpts, newOwner)
}

// MintableTokenApprovalIterator is returned from FilterApproval and is used to iterate over the raw logs and unpacked data for Approval events raised by the MintableToken contract.
type MintableTokenApprovalIterator struct {
	Event *MintableTokenApproval // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *MintableTokenApprovalIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(MintableTokenApproval)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(MintableTokenApproval)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *MintableTokenApprovalIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *MintableTokenApprovalIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// MintableTokenApproval represents a Approval event raised by the MintableToken contract.
type MintableTokenApproval struct {
	Owner   common.Address
	Spender common.Address
	Value   *big.Int
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterApproval is a free log retrieval operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: e Approval(owner indexed address, spender indexed address, value uint256)
func (_MintableToken *MintableTokenFilterer) FilterApproval(opts *bind.FilterOpts, owner []common.Address, spender []common.Address) (*MintableTokenApprovalIterator, error) {

	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}
	var spenderRule []interface{}
	for _, spenderItem := range spender {
		spenderRule = append(spenderRule, spenderItem)
	}

	logs, sub, err := _MintableToken.contract.FilterLogs(opts, "Approval", ownerRule, spenderRule)
	if err != nil {
		return nil, err
	}
	return &MintableTokenApprovalIterator{contract: _MintableToken.contract, event: "Approval", logs: logs, sub: sub}, nil
}

// WatchApproval is a free log subscription operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: e Approval(owner indexed address, spender indexed address, value uint256)
func (_MintableToken *MintableTokenFilterer) WatchApproval(opts *bind.WatchOpts, sink chan<- *MintableTokenApproval, owner []common.Address, spender []common.Address) (event.Subscription, error) {

	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}
	var spenderRule []interface{}
	for _, spenderItem := range spender {
		spenderRule = append(spenderRule, spenderItem)
	}

	logs, sub, err := _MintableToken.contract.WatchLogs(opts, "Approval", ownerRule, spenderRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(MintableTokenApproval)
				if err := _MintableToken.contract.UnpackLog(event, "Approval", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// MintableTokenBurnIterator is returned from FilterBurn and is used to iterate over the raw logs and unpacked data for Burn events raised by the MintableToken contract.
type MintableTokenBurnIterator struct {
	Event *MintableTokenBurn // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *MintableTokenBurnIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(MintableTokenBurn)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(MintableTokenBurn)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *MintableTokenBurnIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *MintableTokenBurnIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// MintableTokenBurn represents a Burn event raised by the MintableToken contract.
type MintableTokenBurn struct {
	Burner common.Address
	Value  *big.Int
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterBurn is a free log retrieval operation binding the contract event 0xcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d397ca5.
//
// Solidity: e Burn(burner indexed address, value uint256)
func (_MintableToken *MintableTokenFilterer) FilterBurn(opts *bind.FilterOpts, burner []common.Address) (*MintableTokenBurnIterator, error) {

	var burnerRule []interface{}
	for _, burnerItem := range burner {
		burnerRule = append(burnerRule, burnerItem)
	}

	logs, sub, err := _MintableToken.contract.FilterLogs(opts, "Burn", burnerRule)
	if err != nil {
		return nil, err
	}
	return &MintableTokenBurnIterator{contract: _MintableToken.contract, event: "Burn", logs: logs, sub: sub}, nil
}

// WatchBurn is a free log subscription operation binding the contract event 0xcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d397ca5.
//
// Solidity: e Burn(burner indexed address, value uint256)
func (_MintableToken *MintableTokenFilterer) WatchBurn(opts *bind.WatchOpts, sink chan<- *MintableTokenBurn, burner []common.Address) (event.Subscription, error) {

	var burnerRule []interface{}
	for _, burnerItem := range burner {
		burnerRule = append(burnerRule, burnerItem)
	}

	logs, sub, err := _MintableToken.contract.WatchLogs(opts, "Burn", burnerRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(MintableTokenBurn)
				if err := _MintableToken.contract.UnpackLog(event, "Burn", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// MintableTokenMintIterator is returned from FilterMint and is used to iterate over the raw logs and unpacked data for Mint events raised by the MintableToken contract.
type MintableTokenMintIterator struct {
	Event *MintableTokenMint // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *MintableTokenMintIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(MintableTokenMint)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(MintableTokenMint)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *MintableTokenMintIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *MintableTokenMintIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// MintableTokenMint represents a Mint event raised by the MintableToken contract.
type MintableTokenMint struct {
	To     common.Address
	Amount *big.Int
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterMint is a free log retrieval operation binding the contract event 0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885.
//
// Solidity: e Mint(to indexed address, amount uint256)
func (_MintableToken *MintableTokenFilterer) FilterMint(opts *bind.FilterOpts, to []common.Address) (*MintableTokenMintIterator, error) {

	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _MintableToken.contract.FilterLogs(opts, "Mint", toRule)
	if err != nil {
		return nil, err
	}
	return &MintableTokenMintIterator{contract: _MintableToken.contract, event: "Mint", logs: logs, sub: sub}, nil
}

// WatchMint is a free log subscription operation binding the contract event 0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885.
//
// Solidity: e Mint(to indexed address, amount uint256)
func (_MintableToken *MintableTokenFilterer) WatchMint(opts *bind.WatchOpts, sink chan<- *MintableTokenMint, to []common.Address) (event.Subscription, error) {

	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _MintableToken.contract.WatchLogs(opts, "Mint", toRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(MintableTokenMint)
				if err := _MintableToken.contract.UnpackLog(event, "Mint", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// MintableTokenMintFinishedIterator is returned from FilterMintFinished and is used to iterate over the raw logs and unpacked data for MintFinished events raised by the MintableToken contract.
type MintableTokenMintFinishedIterator struct {
	Event *MintableTokenMintFinished // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *MintableTokenMintFinishedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(MintableTokenMintFinished)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(MintableTokenMintFinished)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *MintableTokenMintFinishedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *MintableTokenMintFinishedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// MintableTokenMintFinished represents a MintFinished event raised by the MintableToken contract.
type MintableTokenMintFinished struct {
	Raw types.Log // Blockchain specific contextual infos
}

// FilterMintFinished is a free log retrieval operation binding the contract event 0xae5184fba832cb2b1f702aca6117b8d265eaf03ad33eb133f19dde0f5920fa08.
//
// Solidity: e MintFinished()
func (_MintableToken *MintableTokenFilterer) FilterMintFinished(opts *bind.FilterOpts) (*MintableTokenMintFinishedIterator, error) {

	logs, sub, err := _MintableToken.contract.FilterLogs(opts, "MintFinished")
	if err != nil {
		return nil, err
	}
	return &MintableTokenMintFinishedIterator{contract: _MintableToken.contract, event: "MintFinished", logs: logs, sub: sub}, nil
}

// WatchMintFinished is a free log subscription operation binding the contract event 0xae5184fba832cb2b1f702aca6117b8d265eaf03ad33eb133f19dde0f5920fa08.
//
// Solidity: e MintFinished()
func (_MintableToken *MintableTokenFilterer) WatchMintFinished(opts *bind.WatchOpts, sink chan<- *MintableTokenMintFinished) (event.Subscription, error) {

	logs, sub, err := _MintableToken.contract.WatchLogs(opts, "MintFinished")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(MintableTokenMintFinished)
				if err := _MintableToken.contract.UnpackLog(event, "MintFinished", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// MintableTokenOwnershipTransferredIterator is returned from FilterOwnershipTransferred and is used to iterate over the raw logs and unpacked data for OwnershipTransferred events raised by the MintableToken contract.
type MintableTokenOwnershipTransferredIterator struct {
	Event *MintableTokenOwnershipTransferred // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *MintableTokenOwnershipTransferredIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(MintableTokenOwnershipTransferred)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(MintableTokenOwnershipTransferred)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *MintableTokenOwnershipTransferredIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *MintableTokenOwnershipTransferredIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// MintableTokenOwnershipTransferred represents a OwnershipTransferred event raised by the MintableToken contract.
type MintableTokenOwnershipTransferred struct {
	PreviousOwner common.Address
	NewOwner      common.Address
	Raw           types.Log // Blockchain specific contextual infos
}

// FilterOwnershipTransferred is a free log retrieval operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: e OwnershipTransferred(previousOwner indexed address, newOwner indexed address)
func (_MintableToken *MintableTokenFilterer) FilterOwnershipTransferred(opts *bind.FilterOpts, previousOwner []common.Address, newOwner []common.Address) (*MintableTokenOwnershipTransferredIterator, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}
	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _MintableToken.contract.FilterLogs(opts, "OwnershipTransferred", previousOwnerRule, newOwnerRule)
	if err != nil {
		return nil, err
	}
	return &MintableTokenOwnershipTransferredIterator{contract: _MintableToken.contract, event: "OwnershipTransferred", logs: logs, sub: sub}, nil
}

// WatchOwnershipTransferred is a free log subscription operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: e OwnershipTransferred(previousOwner indexed address, newOwner indexed address)
func (_MintableToken *MintableTokenFilterer) WatchOwnershipTransferred(opts *bind.WatchOpts, sink chan<- *MintableTokenOwnershipTransferred, previousOwner []common.Address, newOwner []common.Address) (event.Subscription, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}
	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _MintableToken.contract.WatchLogs(opts, "OwnershipTransferred", previousOwnerRule, newOwnerRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(MintableTokenOwnershipTransferred)
				if err := _MintableToken.contract.UnpackLog(event, "OwnershipTransferred", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// MintableTokenTransferIterator is returned from FilterTransfer and is used to iterate over the raw logs and unpacked data for Transfer events raised by the MintableToken contract.
type MintableTokenTransferIterator struct {
	Event *MintableTokenTransfer // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *MintableTokenTransferIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(MintableTokenTransfer)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(MintableTokenTransfer)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *MintableTokenTransferIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *MintableTokenTransferIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// MintableTokenTransfer represents a Transfer event raised by the MintableToken contract.
type MintableTokenTransfer struct {
	From  common.Address
	To    common.Address
	Value *big.Int
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterTransfer is a free log retrieval operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: e Transfer(from indexed address, to indexed address, value uint256)
func (_MintableToken *MintableTokenFilterer) FilterTransfer(opts *bind.FilterOpts, from []common.Address, to []common.Address) (*MintableTokenTransferIterator, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _MintableToken.contract.FilterLogs(opts, "Transfer", fromRule, toRule)
	if err != nil {
		return nil, err
	}
	return &MintableTokenTransferIterator{contract: _MintableToken.contract, event: "Transfer", logs: logs, sub: sub}, nil
}

// WatchTransfer is a free log subscription operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: e Transfer(from indexed address, to indexed address, value uint256)
func (_MintableToken *MintableTokenFilterer) WatchTransfer(opts *bind.WatchOpts, sink chan<- *MintableTokenTransfer, from []common.Address, to []common.Address) (event.Subscription, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _MintableToken.contract.WatchLogs(opts, "Transfer", fromRule, toRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(MintableTokenTransfer)
				if err := _MintableToken.contract.UnpackLog(event, "Transfer", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// OwnableABI is the input ABI used to generate the binding from.
const OwnableABI = "[{\"constant\":true,\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"}]"

// OwnableBin is the compiled bytecode used for deploying new contracts.
const OwnableBin = `0x608060405234801561001057600080fd5b5060008054600160a060020a03191633179055610173806100326000396000f30060806040526004361061004b5763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416638da5cb5b8114610050578063f2fde38b14610081575b600080fd5b34801561005c57600080fd5b506100656100a4565b60408051600160a060020a039092168252519081900360200190f35b34801561008d57600080fd5b506100a2600160a060020a03600435166100b3565b005b600054600160a060020a031681565b600054600160a060020a031633146100ca57600080fd5b600160a060020a03811615156100df57600080fd5b60008054604051600160a060020a03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a36000805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a03929092169190911790555600a165627a7a723058206bf4f5de0a5d02aa9cd3446bac20541c5515cf2da74ef4826512a6f6aaaea95d0029`

// DeployOwnable deploys a new Ethereum contract, binding an instance of Ownable to it.
func DeployOwnable(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *Ownable, error) {
	parsed, err := abi.JSON(strings.NewReader(OwnableABI))
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	address, tx, contract, err := bind.DeployContract(auth, parsed, common.FromHex(OwnableBin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &Ownable{OwnableCaller: OwnableCaller{contract: contract}, OwnableTransactor: OwnableTransactor{contract: contract}, OwnableFilterer: OwnableFilterer{contract: contract}}, nil
}

// Ownable is an auto generated Go binding around an Ethereum contract.
type Ownable struct {
	OwnableCaller     // Read-only binding to the contract
	OwnableTransactor // Write-only binding to the contract
	OwnableFilterer   // Log filterer for contract events
}

// OwnableCaller is an auto generated read-only Go binding around an Ethereum contract.
type OwnableCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// OwnableTransactor is an auto generated write-only Go binding around an Ethereum contract.
type OwnableTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// OwnableFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type OwnableFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// OwnableSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type OwnableSession struct {
	Contract     *Ownable          // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// OwnableCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type OwnableCallerSession struct {
	Contract *OwnableCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts  // Call options to use throughout this session
}

// OwnableTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type OwnableTransactorSession struct {
	Contract     *OwnableTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts  // Transaction auth options to use throughout this session
}

// OwnableRaw is an auto generated low-level Go binding around an Ethereum contract.
type OwnableRaw struct {
	Contract *Ownable // Generic contract binding to access the raw methods on
}

// OwnableCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type OwnableCallerRaw struct {
	Contract *OwnableCaller // Generic read-only contract binding to access the raw methods on
}

// OwnableTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type OwnableTransactorRaw struct {
	Contract *OwnableTransactor // Generic write-only contract binding to access the raw methods on
}

// NewOwnable creates a new instance of Ownable, bound to a specific deployed contract.
func NewOwnable(address common.Address, backend bind.ContractBackend) (*Ownable, error) {
	contract, err := bindOwnable(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Ownable{OwnableCaller: OwnableCaller{contract: contract}, OwnableTransactor: OwnableTransactor{contract: contract}, OwnableFilterer: OwnableFilterer{contract: contract}}, nil
}

// NewOwnableCaller creates a new read-only instance of Ownable, bound to a specific deployed contract.
func NewOwnableCaller(address common.Address, caller bind.ContractCaller) (*OwnableCaller, error) {
	contract, err := bindOwnable(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &OwnableCaller{contract: contract}, nil
}

// NewOwnableTransactor creates a new write-only instance of Ownable, bound to a specific deployed contract.
func NewOwnableTransactor(address common.Address, transactor bind.ContractTransactor) (*OwnableTransactor, error) {
	contract, err := bindOwnable(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &OwnableTransactor{contract: contract}, nil
}

// NewOwnableFilterer creates a new log filterer instance of Ownable, bound to a specific deployed contract.
func NewOwnableFilterer(address common.Address, filterer bind.ContractFilterer) (*OwnableFilterer, error) {
	contract, err := bindOwnable(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &OwnableFilterer{contract: contract}, nil
}

// bindOwnable binds a generic wrapper to an already deployed contract.
func bindOwnable(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(OwnableABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Ownable *OwnableRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _Ownable.Contract.OwnableCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Ownable *OwnableRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Ownable.Contract.OwnableTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Ownable *OwnableRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Ownable.Contract.OwnableTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Ownable *OwnableCallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _Ownable.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Ownable *OwnableTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Ownable.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Ownable *OwnableTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Ownable.Contract.contract.Transact(opts, method, params...)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_Ownable *OwnableCaller) Owner(opts *bind.CallOpts) (common.Address, error) {
	var (
		ret0 = new(common.Address)
	)
	out := ret0
	err := _Ownable.contract.Call(opts, out, "owner")
	return *ret0, err
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_Ownable *OwnableSession) Owner() (common.Address, error) {
	return _Ownable.Contract.Owner(&_Ownable.CallOpts)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_Ownable *OwnableCallerSession) Owner() (common.Address, error) {
	return _Ownable.Contract.Owner(&_Ownable.CallOpts)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(newOwner address) returns()
func (_Ownable *OwnableTransactor) TransferOwnership(opts *bind.TransactOpts, newOwner common.Address) (*types.Transaction, error) {
	return _Ownable.contract.Transact(opts, "transferOwnership", newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(newOwner address) returns()
func (_Ownable *OwnableSession) TransferOwnership(newOwner common.Address) (*types.Transaction, error) {
	return _Ownable.Contract.TransferOwnership(&_Ownable.TransactOpts, newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(newOwner address) returns()
func (_Ownable *OwnableTransactorSession) TransferOwnership(newOwner common.Address) (*types.Transaction, error) {
	return _Ownable.Contract.TransferOwnership(&_Ownable.TransactOpts, newOwner)
}

// OwnableOwnershipTransferredIterator is returned from FilterOwnershipTransferred and is used to iterate over the raw logs and unpacked data for OwnershipTransferred events raised by the Ownable contract.
type OwnableOwnershipTransferredIterator struct {
	Event *OwnableOwnershipTransferred // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *OwnableOwnershipTransferredIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(OwnableOwnershipTransferred)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(OwnableOwnershipTransferred)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *OwnableOwnershipTransferredIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *OwnableOwnershipTransferredIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// OwnableOwnershipTransferred represents a OwnershipTransferred event raised by the Ownable contract.
type OwnableOwnershipTransferred struct {
	PreviousOwner common.Address
	NewOwner      common.Address
	Raw           types.Log // Blockchain specific contextual infos
}

// FilterOwnershipTransferred is a free log retrieval operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: e OwnershipTransferred(previousOwner indexed address, newOwner indexed address)
func (_Ownable *OwnableFilterer) FilterOwnershipTransferred(opts *bind.FilterOpts, previousOwner []common.Address, newOwner []common.Address) (*OwnableOwnershipTransferredIterator, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}
	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _Ownable.contract.FilterLogs(opts, "OwnershipTransferred", previousOwnerRule, newOwnerRule)
	if err != nil {
		return nil, err
	}
	return &OwnableOwnershipTransferredIterator{contract: _Ownable.contract, event: "OwnershipTransferred", logs: logs, sub: sub}, nil
}

// WatchOwnershipTransferred is a free log subscription operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: e OwnershipTransferred(previousOwner indexed address, newOwner indexed address)
func (_Ownable *OwnableFilterer) WatchOwnershipTransferred(opts *bind.WatchOpts, sink chan<- *OwnableOwnershipTransferred, previousOwner []common.Address, newOwner []common.Address) (event.Subscription, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}
	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _Ownable.contract.WatchLogs(opts, "OwnershipTransferred", previousOwnerRule, newOwnerRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(OwnableOwnershipTransferred)
				if err := _Ownable.contract.UnpackLog(event, "OwnershipTransferred", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// SafeMathABI is the input ABI used to generate the binding from.
const SafeMathABI = "[]"

// SafeMathBin is the compiled bytecode used for deploying new contracts.
const SafeMathBin = `0x604c602c600b82828239805160001a60731460008114601c57601e565bfe5b5030600052607381538281f30073000000000000000000000000000000000000000030146080604052600080fd00a165627a7a723058208e5a4a349a0e2f8b7b903bbe1507dad317fbd2e3ce8cee5af57beb91312338500029`

// DeploySafeMath deploys a new Ethereum contract, binding an instance of SafeMath to it.
func DeploySafeMath(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *SafeMath, error) {
	parsed, err := abi.JSON(strings.NewReader(SafeMathABI))
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	address, tx, contract, err := bind.DeployContract(auth, parsed, common.FromHex(SafeMathBin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &SafeMath{SafeMathCaller: SafeMathCaller{contract: contract}, SafeMathTransactor: SafeMathTransactor{contract: contract}, SafeMathFilterer: SafeMathFilterer{contract: contract}}, nil
}

// SafeMath is an auto generated Go binding around an Ethereum contract.
type SafeMath struct {
	SafeMathCaller     // Read-only binding to the contract
	SafeMathTransactor // Write-only binding to the contract
	SafeMathFilterer   // Log filterer for contract events
}

// SafeMathCaller is an auto generated read-only Go binding around an Ethereum contract.
type SafeMathCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SafeMathTransactor is an auto generated write-only Go binding around an Ethereum contract.
type SafeMathTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SafeMathFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type SafeMathFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SafeMathSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type SafeMathSession struct {
	Contract     *SafeMath         // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// SafeMathCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type SafeMathCallerSession struct {
	Contract *SafeMathCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts   // Call options to use throughout this session
}

// SafeMathTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type SafeMathTransactorSession struct {
	Contract     *SafeMathTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts   // Transaction auth options to use throughout this session
}

// SafeMathRaw is an auto generated low-level Go binding around an Ethereum contract.
type SafeMathRaw struct {
	Contract *SafeMath // Generic contract binding to access the raw methods on
}

// SafeMathCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type SafeMathCallerRaw struct {
	Contract *SafeMathCaller // Generic read-only contract binding to access the raw methods on
}

// SafeMathTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type SafeMathTransactorRaw struct {
	Contract *SafeMathTransactor // Generic write-only contract binding to access the raw methods on
}

// NewSafeMath creates a new instance of SafeMath, bound to a specific deployed contract.
func NewSafeMath(address common.Address, backend bind.ContractBackend) (*SafeMath, error) {
	contract, err := bindSafeMath(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &SafeMath{SafeMathCaller: SafeMathCaller{contract: contract}, SafeMathTransactor: SafeMathTransactor{contract: contract}, SafeMathFilterer: SafeMathFilterer{contract: contract}}, nil
}

// NewSafeMathCaller creates a new read-only instance of SafeMath, bound to a specific deployed contract.
func NewSafeMathCaller(address common.Address, caller bind.ContractCaller) (*SafeMathCaller, error) {
	contract, err := bindSafeMath(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &SafeMathCaller{contract: contract}, nil
}

// NewSafeMathTransactor creates a new write-only instance of SafeMath, bound to a specific deployed contract.
func NewSafeMathTransactor(address common.Address, transactor bind.ContractTransactor) (*SafeMathTransactor, error) {
	contract, err := bindSafeMath(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &SafeMathTransactor{contract: contract}, nil
}

// NewSafeMathFilterer creates a new log filterer instance of SafeMath, bound to a specific deployed contract.
func NewSafeMathFilterer(address common.Address, filterer bind.ContractFilterer) (*SafeMathFilterer, error) {
	contract, err := bindSafeMath(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &SafeMathFilterer{contract: contract}, nil
}

// bindSafeMath binds a generic wrapper to an already deployed contract.
func bindSafeMath(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(SafeMathABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_SafeMath *SafeMathRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _SafeMath.Contract.SafeMathCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_SafeMath *SafeMathRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _SafeMath.Contract.SafeMathTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_SafeMath *SafeMathRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _SafeMath.Contract.SafeMathTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_SafeMath *SafeMathCallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _SafeMath.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_SafeMath *SafeMathTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _SafeMath.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_SafeMath *SafeMathTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _SafeMath.Contract.contract.Transact(opts, method, params...)
}

// SpankBankABI is the input ABI used to generate the binding from.
const SpankBankABI = "[{\"constant\":true,\"inputs\":[],\"name\":\"currentPeriod\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"spankAmount\",\"type\":\"uint256\"},{\"name\":\"stakePeriods\",\"type\":\"uint256\"},{\"name\":\"activityKey\",\"type\":\"address\"},{\"name\":\"bootyBase\",\"type\":\"address\"}],\"name\":\"stake\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"stakerAddress\",\"type\":\"address\"},{\"name\":\"period\",\"type\":\"uint256\"}],\"name\":\"getSpankPoints\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"bootyToken\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"maxPeriods\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"mintBooty\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"unwind\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"voteToUnwind\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"address\"}],\"name\":\"stakers\",\"outputs\":[{\"name\":\"spankStaked\",\"type\":\"uint256\"},{\"name\":\"startingPeriod\",\"type\":\"uint256\"},{\"name\":\"endingPeriod\",\"type\":\"uint256\"},{\"name\":\"activityKey\",\"type\":\"address\"},{\"name\":\"bootyBase\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"spankToken\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"newBootyBase\",\"type\":\"address\"}],\"name\":\"updateBootyBase\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"newActivityKey\",\"type\":\"address\"}],\"name\":\"updateActivityKey\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_period\",\"type\":\"uint256\"}],\"name\":\"claimBooty\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"updatePeriod\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"newAddress\",\"type\":\"address\"},{\"name\":\"newActivityKey\",\"type\":\"address\"},{\"name\":\"newBootyBase\",\"type\":\"address\"},{\"name\":\"spankAmount\",\"type\":\"uint256\"}],\"name\":\"splitStake\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"withdrawStake\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"address\"}],\"name\":\"activityKeys\",\"outputs\":[{\"name\":\"stakerAddress\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"stakerAddress\",\"type\":\"address\"},{\"name\":\"period\",\"type\":\"uint256\"}],\"name\":\"getDidClaimBooty\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"totalSpankStaked\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"periodLength\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"unwindPeriod\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"unwindVotes\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"updatedEndingPeriod\",\"type\":\"uint256\"}],\"name\":\"checkIn\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"periods\",\"outputs\":[{\"name\":\"bootyFees\",\"type\":\"uint256\"},{\"name\":\"totalSpankPoints\",\"type\":\"uint256\"},{\"name\":\"bootyMinted\",\"type\":\"uint256\"},{\"name\":\"mintingComplete\",\"type\":\"bool\"},{\"name\":\"startTime\",\"type\":\"uint256\"},{\"name\":\"endTime\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"bootyAmount\",\"type\":\"uint256\"}],\"name\":\"sendFees\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"name\":\"_periodLength\",\"type\":\"uint256\"},{\"name\":\"_maxPeriods\",\"type\":\"uint256\"},{\"name\":\"spankAddress\",\"type\":\"address\"},{\"name\":\"initialBootySupply\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"staker\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"startPeriod\",\"type\":\"uint256\"},{\"indexed\":true,\"name\":\"endPeriod\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"activityKey\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"bootyBase\",\"type\":\"address\"}],\"name\":\"StakeEvent\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"sender\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"bootyAmount\",\"type\":\"uint256\"},{\"indexed\":true,\"name\":\"currentBootyFees\",\"type\":\"uint256\"}],\"name\":\"SendFeesEvent\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"targetBootySupply\",\"type\":\"uint256\"},{\"indexed\":true,\"name\":\"totalBootySupply\",\"type\":\"uint256\"},{\"indexed\":true,\"name\":\"currentPeriod\",\"type\":\"uint256\"}],\"name\":\"MintBootyEvent\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"staker\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"updatedEndingPeriod\",\"type\":\"uint256\"},{\"indexed\":true,\"name\":\"currentPeriod\",\"type\":\"uint256\"}],\"name\":\"CheckInEvent\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"staker\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"period\",\"type\":\"uint256\"},{\"indexed\":true,\"name\":\"bootyOwed\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"stakerSpankPoints\",\"type\":\"uint256\"}],\"name\":\"ClaimBootyEvent\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"staker\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"totalSpankStaked\",\"type\":\"uint256\"},{\"indexed\":true,\"name\":\"currentPeriod\",\"type\":\"uint256\"}],\"name\":\"WithdrawStakeEvent\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"staker\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"newAddress\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"spankAmount\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"currentPeriod\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"startingPeriod\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"endingPeriod\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"activityKey\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"bootyBase\",\"type\":\"address\"}],\"name\":\"SplitStakeEvent\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"staker\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"spankStaked\",\"type\":\"uint256\"},{\"indexed\":true,\"name\":\"unwind\",\"type\":\"bool\"},{\"indexed\":false,\"name\":\"currentPeriod\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"totalSpankStaked\",\"type\":\"uint256\"}],\"name\":\"VoteToUnwindEvent\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"staker\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"newActivityKey\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"currentPeriod\",\"type\":\"uint256\"}],\"name\":\"UpdateActivityKeyEvent\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"staker\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"newBootyBase\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"currentPeriod\",\"type\":\"uint256\"}],\"name\":\"UpdateBootyBaseEvent\",\"type\":\"event\"}]"

// SpankBankBin is the compiled bytecode used for deploying new contracts.
const SpankBankBin = `0x608060405260006008553480156200001657600080fd5b5060405160808062002f808339810160409081528151602083015191830151606090930151600082815560018490556005805461010060a860020a031916610100600160a060020a03881602179055919391620000726200042b565b604051809103906000f0801580156200008f573d6000803e3d6000fd5b5060068054600160a060020a031916600160a060020a039283161790819055604080517f40c10f1900000000000000000000000000000000000000000000000000000000815230600482015260248101869052905191909216916340c10f199160448083019260209291908290030181600087803b1580156200011157600080fd5b505af115801562000126573d6000803e3d6000fd5b505050506040513d60208110156200013d57600080fd5b50506008546000908152600a6020526040812042600490910181905590549091506200017990829064010000000062001f546200041482021704565b6008546000908152600a602090815260408083206005019390935560065483517fa9059cbb000000000000000000000000000000000000000000000000000000008152336004820152602481018790529351600160a060020a039091169363a9059cbb9360448083019493928390030190829087803b158015620001fc57600080fd5b505af115801562000211573d6000803e3d6000fd5b505050506040513d60208110156200022857600080fd5b50506007602052505060007f6d5257204ebe7d88fd91ae87941cb2dd9d8062b64ae5a2bd2d28ec40b9fbf6df819055602d7fb39221ace053465ec3453ce2b36430bd138b997ecea25c1043da0c366812b8285560327fb7c774451310d1be4108bc180d1b52823cb0ee0274a6c0081bcaf94f115fb96d5560377f3be6fd20d5acfde5b873b48692cd31f4d3c7e8ee8a813af4696af8859e5ca6c655603c7fb805995a7ec585a251200611a61d179cfd7fb105e1ab17dc415a7336783786f75560417fbcdda56b5d08466ec462cbbe0adfa57cb0a15fcc8940ef68f702f21b787bc9355560467f55c5b153ab560fcde54a63b18c7f53d75501706907cef8767fbded79ab9997c755604b7fb7c49cceb9f85950584035457a41ebbd8cf93b9b612733ad25aa9731ac43aad65560507f4b1bf46c9f1bd48ff8274d40bad76a6615cb6c59a637d451a3994194b2db86be5560557ff1f3e9c34634a546b3672c043f73844d83d55591bbe61b8e7e3a72bca1a812bf55605a7f3ed157e83ab1bb1f6b7b3760b3368106283d4e15d1f1b08e20d06576445a999455605f7fb7511a2dbe1513c8574eaafb5266301ff1bbf641d4144b093d6d1b500334bf2f55600c9052505060647f74b6357e277c778e8ad9a2761a935d45336ec91439b9e1b117eda2efdfe38fad55506200043c565b6000828201838110156200042457fe5b9392505050565b604051610b5a806200242683390190565b611fda806200044c6000396000f3006080604052600436106101485763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166306040618811461014d57806340809acd146101745780634cfef220146101a357806350a9b541146101c75780635155bafa146101f857806353547d3f1461020d578063807763ab146102225780639017e2dd1461024b5780639168ae721461026057806392f4d225146102b8578063948cfd0c146102cd5780639f80a856146102ee578063a0ac57761461030f578063a83627de14610327578063b8c0517a1461033c578063bed9d8611461036c578063cadecbf414610381578063cc741c9c146103a2578063cd43ebf9146103c6578063d2ca2115146103db578063ded217fb146103f0578063e8493e0c14610405578063e95a644f1461041a578063ea4a110414610432578063ecd4eb741461047d575b600080fd5b34801561015957600080fd5b50610162610495565b60408051918252519081900360200190f35b34801561018057600080fd5b506101a1600435602435600160a060020a036044358116906064351661049b565b005b3480156101af57600080fd5b50610162600160a060020a0360043516602435610950565b3480156101d357600080fd5b506101dc61097c565b60408051600160a060020a039092168252519081900360200190f35b34801561020457600080fd5b5061016261098b565b34801561021957600080fd5b506101a1610991565b34801561022e57600080fd5b50610237610bb8565b604080519115158252519081900360200190f35b34801561025757600080fd5b506101a1610bc1565b34801561026c57600080fd5b50610281600160a060020a0360043516610d45565b60408051958652602086019490945284840192909252600160a060020a039081166060850152166080830152519081900360a00190f35b3480156102c457600080fd5b506101dc610d80565b3480156102d957600080fd5b506101a1600160a060020a0360043516610d94565b3480156102fa57600080fd5b506101a1600160a060020a0360043516610e13565b34801561031b57600080fd5b506101a1600435610ecf565b34801561033357600080fd5b506101a161122b565b34801561034857600080fd5b506101a1600160a060020a03600435811690602435811690604435166064356112ec565b34801561037857600080fd5b506101a16116f7565b34801561038d57600080fd5b506101dc600160a060020a03600435166118ce565b3480156103ae57600080fd5b50610237600160a060020a03600435166024356118e9565b3480156103d257600080fd5b50610162611918565b3480156103e757600080fd5b5061016261191e565b3480156103fc57600080fd5b50610162611924565b34801561041157600080fd5b5061016261192a565b34801561042657600080fd5b506101a1600435611930565b34801561043e57600080fd5b5061044a600435611c41565b604080519687526020870195909552858501939093529015156060850152608084015260a0830152519081900360c00190f35b34801561048957600080fd5b506101a1600435611c7a565b60085481565b6005546000908190819060ff16156104b257600080fd5b6104ba61122b565b6000861180156104cc57506001548611155b1515610548576040805160e560020a62461bcd02815260206004820152602e60248201527f7374616b653a3a207374616b65206d757374206265206265747765656e20302060448201527f616e64206d6178506572696f6473000000000000000000000000000000000000606482015290519081900360840190fd5b600087116105c6576040805160e560020a62461bcd02815260206004820152602960248201527f7374616b653a3a7370616e6b416d6f756e74206d75737420626520677265617460448201527f6572207468616e20300000000000000000000000000000000000000000000000606482015290519081900360840190fd5b336000908152600960205260409020600101541580156105f6575033600090815260096020526040902060020154155b1515610672576040805160e560020a62461bcd02815260206004820152603060248201527f7374616b653a3a7374617274696e67506572696f6420616e6420656e64696e6760448201527f506572696f64206d757374206265203000000000000000000000000000000000606482015290519081900360840190fd5b600554604080517f23b872dd000000000000000000000000000000000000000000000000000000008152336004820152306024820152604481018a90529051610100909204600160a060020a0316916323b872dd916064808201926020929091908290030181600087803b1580156106e957600080fd5b505af11580156106fd573d6000803e3d6000fd5b505050506040513d602081101561071357600080fd5b50511515610791576040805160e560020a62461bcd02815260206004820152602260248201527f7374616b653a3a7370616e6b546f6b656e207472616e73666572206661696c7560448201527f7265000000000000000000000000000000000000000000000000000000000000606482015290519081900360840190fd5b6000868152600760205260409020546107b6906107af908990611f12565b6064611f3d565b6040805160a0810182528981526008805460018082016020808601918252928d01858701908152600160a060020a038d8116606088019081528d821660808901908152336000908152600988528a812099518a55945189870155925160028901555160068801805473ffffffffffffffffffffffffffffffffffffffff199081169284169290921790559151600788018054909316911617905583548201815260039094018252848420869055915482018352600a9052919020015490935091506108818284611f54565b60085460019081016000908152600a60205260409020018190556002549092506108ab9088611f54565b60025550600160a060020a038085166000908152600b602052604090208054909116156108d757600080fd5b805473ffffffffffffffffffffffffffffffffffffffff191633908117825560085460408051600160a060020a038981168252881660208201528151838b019460019490940193927f9c13c846ec75aea1a0e03d6594d9f3383d1e1e1e6f63a8c8f90b6c86aa7b79c9928290030190a450505050505050565b600160a060020a0391909116600090815260096020908152604080832093835260039093019052205490565b600654600160a060020a031681565b60015481565b60055460009081908190819060ff16156109aa57600080fd5b6109b261122b565b600854600019016000908152600a60205260409020600381015490945060ff1615610a4d576040805160e560020a62461bcd02815260206004820152602860248201527f6d696e74426f6f74793a3a6d696e74696e67436f6d706c657465206d7573742060448201527f62652066616c7365000000000000000000000000000000000000000000000000606482015290519081900360840190fd5b60038401805460ff191660011790558354610a69906014611f12565b9250600660009054906101000a9004600160a060020a0316600160a060020a03166318160ddd6040518163ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401602060405180830381600087803b158015610ad757600080fd5b505af1158015610aeb573d6000803e3d6000fd5b505050506040513d6020811015610b0157600080fd5b5051915081831115610bb25750600654604080517f40c10f190000000000000000000000000000000000000000000000000000000081523060048201528385036024820181905291519192600160a060020a0316916340c10f19916044808201926020929091908290030181600087803b158015610b7e57600080fd5b505af1158015610b92573d6000803e3d6000fd5b505050506040513d6020811015610ba857600080fd5b5050600284018190555b50505050565b60055460ff1681565b6000806000610bce61122b565b60055460ff1615610bde57600080fd5b336000908152600b6020526040902054600160a060020a03169250821515610c0557600080fd5b600160a060020a0383166000908152600960205260408120805490935011610c2c57600080fd5b60085460028301541015610c3f57600080fd5b60085460045414610c70576008546004819055600060038190559081526005830160205260409020805460ff191690555b600854600090815260058301602052604090205460ff1615610c9157600080fd5b60085460009081526005830160205260409020805460ff191660011790556003548254610cbe9190611f54565b60035560028054610cce91611f3d565b9050806003541115610ce8576005805460ff191660011790555b6005548254600854600254604080519283526020830191909152805160ff909416151593600160a060020a038816927f6181df612071041923f95401c4beba899f880201e8e81c6da20e1f574e0ce21f92908290030190a4505050565b60096020526000908152604090208054600182015460028301546006840154600790940154929391929091600160a060020a03908116911685565b6005546101009004600160a060020a031681565b3360009081526009602052604081208054909110610db157600080fd5b60078101805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a03841690811790915560085460405190919033907f5adf14c9b8806eee46c946f8629fb2d05cfdb3ec6870004cc8145e8fa8dfc9e690600090a45050565b33600090815260096020526040812060068101549091908190600160a060020a03161515610e4057600080fd5b5050600681018054600160a060020a0380851673ffffffffffffffffffffffffffffffffffffffff1992831681179384905592166000908152600b6020526040808220805484168155848352818320805490941633908117855560085492519195929390917fa6e8688bef48c01074b1df5fba9beee4b8da987ac92ff7fc4353c6e70258d7ff9190a450505050565b600080610eda611f75565b600080600080610ee861122b565b6008548810610f67576040805160e560020a62461bcd02815260206004820152603360248201527f636c61696d426f6f74793a3a5f706572696f64206d757374206265206c65737360448201527f207468616e2063757272656e74506572696f6400000000000000000000000000606482015290519081900360840190fd5b336000908152600b6020908152604080832054600160a060020a0316808452600983528184208c855260048101909352922054919850965060ff161561101d576040805160e560020a62461bcd02815260206004820152603260248201527f636c61696d426f6f74793a3a646964436c61696d426f6f747920666f7220706560448201527f72696f64206d7573742062652066616c73650000000000000000000000000000606482015290519081900360840190fd5b6000888152600480880160209081526040808420805460ff19166001908117909155600a8352818520825160c08101845281548152918101549382018490526002810154928201839052600381015460ff161515606083015293840154608082015260059093015460a0840152919750909550935083111561122157600088815260038701602052604090205491506110bf6110b98386611f12565b84611f3d565b6006546007880154604080517fa9059cbb000000000000000000000000000000000000000000000000000000008152600160a060020a03928316600482015260248101859052905193945091169163a9059cbb916044808201926020929091908290030181600087803b15801561113557600080fd5b505af1158015611149573d6000803e3d6000fd5b505050506040513d602081101561115f57600080fd5b505115156111dd576040805160e560020a62461bcd02815260206004820152602760248201527f636c61696d426f6f74793a3a626f6f7479546f6b656e207472616e736665722060448201527f6661696c75726500000000000000000000000000000000000000000000000000606482015290519081900360840190fd5b808888600160a060020a03167fe1d1189cee6887b24b34b81f7035870bd447e9a987ed494343b936e029ea583c856040518082815260200191505060405180910390a45b5050505050505050565b611233611f75565b6008546000908152600a602052604090206005015442106112e95750600880546000818152600a60208181526040808420815160c0810183528154815260018083015482860152600283015482850152600383015460ff1615156060830152600480840154608084015260059093015460a08301818152919098019889905597865293909252832001929092559151915490916112cf91611f54565b6008546000908152600a6020526040902060050155611233565b50565b6000806112f761122b565b600160a060020a038616151561137d576040805160e560020a62461bcd02815260206004820152603160248201527f73706c69745374616b653a3a6e657741646472657373206d757374206265206160448201527f206e6f6e2d7a65726f2061646472657373000000000000000000000000000000606482015290519081900360840190fd5b600083116113fb576040805160e560020a62461bcd02815260206004820152602e60248201527f73706c69745374616b653a3a7370616e6b416d6f756e74206d7573742062652060448201527f67726561746572207468616e2030000000000000000000000000000000000000606482015290519081900360840190fd5b336000908152600960205260409020600281015460085491935011611490576040805160e560020a62461bcd02815260206004820152603360248201527f63757272656e74506572696f64206d757374206265206c657373207468616e2060448201527f7374616b65722e656e64696e67506572696f6400000000000000000000000000606482015290519081900360840190fd5b815483111561150f576040805160e560020a62461bcd02815260206004820152603c60248201527f7370616e6b416d6f756e74206d757374206265206c657373207468616e206f7260448201527f20657175616c20746f207374616b65722e7370616e6b5374616b656400000000606482015290519081900360840190fd5b815461151b9084611f63565b826000018190555060a060405190810160405280848152602001836001015481526020018360020154815260200186600160a060020a0316815260200185600160a060020a03168152506009600088600160a060020a0316600160a060020a0316815260200190815260200160002060008201518160000155602082015181600101556040820151816002015560608201518160060160006101000a815481600160a060020a030219169083600160a060020a0316021790555060808201518160070160006101000a815481600160a060020a030219169083600160a060020a03160217905550905050600b600086600160a060020a0316600160a060020a031681526020019081526020016000209050858160000160006101000a815481600160a060020a030219169083600160a060020a031602179055508286600160a060020a031633600160a060020a03167f020ad122863f9d4606cd49b606d739363e29bde82d8674133d9232bc0f4e1110600854866001015487600201548b8b6040518086815260200185815260200184815260200183600160a060020a0316600160a060020a0316815260200182600160a060020a0316600160a060020a031681526020019550505050505060405180910390a4505050505050565b60008061170261122b565b5050336000908152600b6020908152604080832054600160a060020a031680845260099092529091206002810154600854116117d4576040805160e560020a62461bcd02815260206004820152604560248201527f77697468647261775374616b653a3a63757272656e74506572696f64206d757360448201527f742062652067726561746572207468616e207374616b65722e656e64696e675060648201527f6572696f64000000000000000000000000000000000000000000000000000000608482015290519081900360a40190fd5b6005548154604080517fa9059cbb000000000000000000000000000000000000000000000000000000008152600160a060020a038681166004830152602482019390935290516101009093049091169163a9059cbb916044808201926020929091908290030181600087803b15801561184c57600080fd5b505af1158015611860573d6000803e3d6000fd5b505050506040513d602081101561187657600080fd5b505060025481546118879190611f63565b6002908155600080835560085491546040519091600160a060020a038616917ff91cbf8dea09a94f0080cb927fb1d67eb5121d465abe58fadfd50165382961d89190a45050565b600b60205260009081526040902054600160a060020a031681565b600160a060020a0391909116600090815260096020908152604080832093835260049093019052205460ff1690565b60025481565b60005481565b60045481565b60035481565b600554600090819081908190819060ff161561194b57600080fd5b61195361122b565b336000908152600b6020908152604080832054600160a060020a0316808452600990925290912060028101546008549297509095501161199257600080fd5b6000861115611b73576008548611611a1a576040805160e560020a62461bcd02815260206004820152603f60248201527f636865636b496e3a3a75706461746564456e64696e67506572696f64206d757360448201527f742062652067726561746572207468616e2063757272656e74506572696f6400606482015290519081900360840190fd5b60028401548611611ac1576040805160e560020a62461bcd02815260206004820152604560248201527f636865636b496e3a3a75706461746564456e64696e67506572696f64206d757360448201527f742062652067726561746572207468616e207374616b65722e656e64696e675060648201527f6572696f64000000000000000000000000000000000000000000000000000000608482015290519081900360a40190fd5b60015460085401861115611b6b576040805160e560020a62461bcd02815260206004820152604c60248201527f75706461746564456e64696e67506572696f64206d757374206265206c65737360448201527f207468616e206f7220657175616c20746f2063757272656e74506572696f642060648201527f2b206d6178506572696f64730000000000000000000000000000000000000000608482015290519081900360a40190fd5b600284018690555b60085460028501548554919003600081815260076020526040902054909450611b9f916107af91611f12565b60088054600190810160009081526003880160209081526040808320869055935483018252600a90529190912001549092509050611bdd8183611f54565b905080600a60006008546001018152602001908152602001600020600101819055506008548686600160a060020a03167f455c1ec2de533b70dc801a34a71f427f49eab272a8ae032773d40899e546e89060405160405180910390a4505050505050565b600a6020526000908152604090208054600182015460028301546003840154600485015460059095015493949293919260ff9091169186565b60055460009060ff1615611c8d57600080fd5b611c9561122b565b60008211611d13576040805160e560020a62461bcd02815260206004820152602560248201527f73656e64466565733a3a66656573206d7573742062652067726561746572207460448201527f68616e2030000000000000000000000000000000000000000000000000000000606482015290519081900360840190fd5b600654604080517f23b872dd000000000000000000000000000000000000000000000000000000008152336004820152306024820152604481018590529051600160a060020a03909216916323b872dd916064808201926020929091908290030181600087803b158015611d8657600080fd5b505af1158015611d9a573d6000803e3d6000fd5b505050506040513d6020811015611db057600080fd5b50511515611e2d576040805160e560020a62461bcd028152602060048201526024808201527f73656e64466565733a3a626f6f7479546f6b656e207472616e7366657220666160448201527f696c656400000000000000000000000000000000000000000000000000000000606482015290519081900360840190fd5b600654604080517f42966c68000000000000000000000000000000000000000000000000000000008152600481018590529051600160a060020a03909216916342966c689160248082019260009290919082900301818387803b158015611e9357600080fd5b505af1158015611ea7573d6000803e3d6000fd5b50506008546000908152600a60205260409020549250611ecb915083905082611f54565b6008546000908152600a6020526040808220839055519192508291849133917f25ff5f7e1c06929c6e3964f0ddde60bc47b581c30806cff0257a599b78cda3c59190a45050565b6000828202831580611f2e5750828482811515611f2b57fe5b04145b1515611f3657fe5b9392505050565b6000808284811515611f4b57fe5b04949350505050565b600082820183811015611f3657fe5b600082821115611f6f57fe5b50900390565b60c060405190810160405280600081526020016000815260200160008152602001600015158152602001600081526020016000815250905600a165627a7a72305820e9652432bf295d4181596f28a47d790e9f9c3c14eef8a2cf523d48e9e555e23d0029608060405260038054600160a860020a03191633179055610b35806100256000396000f3006080604052600436106100cf5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166305d2035b81146100d4578063095ea7b3146100fd57806318160ddd1461012157806323b872dd1461014857806340c10f191461017257806342966c681461019657806366188463146101b057806370a08231146101d45780637d64bcb4146101f55780638da5cb5b1461020a578063a9059cbb1461023b578063d73dd6231461025f578063dd62ed3e14610283578063f2fde38b146102aa575b600080fd5b3480156100e057600080fd5b506100e96102cb565b604080519115158252519081900360200190f35b34801561010957600080fd5b506100e9600160a060020a03600435166024356102ec565b34801561012d57600080fd5b50610136610352565b60408051918252519081900360200190f35b34801561015457600080fd5b506100e9600160a060020a0360043581169060243516604435610358565b34801561017e57600080fd5b506100e9600160a060020a03600435166024356104bd565b3480156101a257600080fd5b506101ae6004356105c6565b005b3480156101bc57600080fd5b506100e9600160a060020a03600435166024356105ea565b3480156101e057600080fd5b50610136600160a060020a03600435166106da565b34801561020157600080fd5b506100e96106f5565b34801561021657600080fd5b5061021f61079b565b60408051600160a060020a039092168252519081900360200190f35b34801561024757600080fd5b506100e9600160a060020a03600435166024356107aa565b34801561026b57600080fd5b506100e9600160a060020a0360043516602435610879565b34801561028f57600080fd5b50610136600160a060020a0360043581169060243516610912565b3480156102b657600080fd5b506101ae600160a060020a036004351661093d565b60035474010000000000000000000000000000000000000000900460ff1681565b336000818152600260209081526040808320600160a060020a038716808552908352818420869055815186815291519394909390927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925928290030190a350600192915050565b60015490565b6000600160a060020a038316151561036f57600080fd5b600160a060020a03841660009081526020819052604090205482111561039457600080fd5b600160a060020a03841660009081526002602090815260408083203384529091529020548211156103c457600080fd5b600160a060020a0384166000908152602081905260409020546103ed908363ffffffff6109d216565b600160a060020a038086166000908152602081905260408082209390935590851681522054610422908363ffffffff6109e416565b600160a060020a03808516600090815260208181526040808320949094559187168152600282528281203382529091522054610464908363ffffffff6109d216565b600160a060020a0380861660008181526002602090815260408083203384528252918290209490945580518681529051928716939192600080516020610aea833981519152929181900390910190a35060019392505050565b600354600090600160a060020a031633146104d757600080fd5b60035474010000000000000000000000000000000000000000900460ff16156104ff57600080fd5b600154610512908363ffffffff6109e416565b600155600160a060020a03831660009081526020819052604090205461053e908363ffffffff6109e416565b600160a060020a03841660008181526020818152604091829020939093558051858152905191927f0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d412139688592918290030190a2604080518381529051600160a060020a03851691600091600080516020610aea8339815191529181900360200190a350600192915050565b600354600160a060020a031633146105dd57600080fd5b6105e733826109fa565b50565b336000908152600260209081526040808320600160a060020a03861684529091528120548083111561063f57336000908152600260209081526040808320600160a060020a0388168452909152812055610674565b61064f818463ffffffff6109d216565b336000908152600260209081526040808320600160a060020a03891684529091529020555b336000818152600260209081526040808320600160a060020a0389168085529083529281902054815190815290519293927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929181900390910190a35060019392505050565b600160a060020a031660009081526020819052604090205490565b600354600090600160a060020a0316331461070f57600080fd5b60035474010000000000000000000000000000000000000000900460ff161561073757600080fd5b6003805474ff00000000000000000000000000000000000000001916740100000000000000000000000000000000000000001790556040517fae5184fba832cb2b1f702aca6117b8d265eaf03ad33eb133f19dde0f5920fa0890600090a150600190565b600354600160a060020a031681565b6000600160a060020a03831615156107c157600080fd5b336000908152602081905260409020548211156107dd57600080fd5b336000908152602081905260409020546107fd908363ffffffff6109d216565b3360009081526020819052604080822092909255600160a060020a0385168152205461082f908363ffffffff6109e416565b600160a060020a03841660008181526020818152604091829020939093558051858152905191923392600080516020610aea8339815191529281900390910190a350600192915050565b336000908152600260209081526040808320600160a060020a03861684529091528120546108ad908363ffffffff6109e416565b336000818152600260209081526040808320600160a060020a0389168085529083529281902085905580519485525191937f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929081900390910190a350600192915050565b600160a060020a03918216600090815260026020908152604080832093909416825291909152205490565b600354600160a060020a0316331461095457600080fd5b600160a060020a038116151561096957600080fd5b600354604051600160a060020a038084169216907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a36003805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0392909216919091179055565b6000828211156109de57fe5b50900390565b6000828201838110156109f357fe5b9392505050565b600160a060020a038216600090815260208190526040902054811115610a1f57600080fd5b600160a060020a038216600090815260208190526040902054610a48908263ffffffff6109d216565b600160a060020a038316600090815260208190526040902055600154610a74908263ffffffff6109d216565b600155604080518281529051600160a060020a038416917fcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d397ca5919081900360200190a2604080518281529051600091600160a060020a03851691600080516020610aea8339815191529181900360200190a350505600ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa165627a7a7230582038b2d61fa0b543d9aba9088973162c7d38a1f4689ef6754349ebdc67d04963490029`

// DeploySpankBank deploys a new Ethereum contract, binding an instance of SpankBank to it.
func DeploySpankBank(auth *bind.TransactOpts, backend bind.ContractBackend, _periodLength *big.Int, _maxPeriods *big.Int, spankAddress common.Address, initialBootySupply *big.Int) (common.Address, *types.Transaction, *SpankBank, error) {
	parsed, err := abi.JSON(strings.NewReader(SpankBankABI))
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	address, tx, contract, err := bind.DeployContract(auth, parsed, common.FromHex(SpankBankBin), backend, _periodLength, _maxPeriods, spankAddress, initialBootySupply)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &SpankBank{SpankBankCaller: SpankBankCaller{contract: contract}, SpankBankTransactor: SpankBankTransactor{contract: contract}, SpankBankFilterer: SpankBankFilterer{contract: contract}}, nil
}

// SpankBank is an auto generated Go binding around an Ethereum contract.
type SpankBank struct {
	SpankBankCaller     // Read-only binding to the contract
	SpankBankTransactor // Write-only binding to the contract
	SpankBankFilterer   // Log filterer for contract events
}

// SpankBankCaller is an auto generated read-only Go binding around an Ethereum contract.
type SpankBankCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SpankBankTransactor is an auto generated write-only Go binding around an Ethereum contract.
type SpankBankTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SpankBankFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type SpankBankFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SpankBankSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type SpankBankSession struct {
	Contract     *SpankBank        // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// SpankBankCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type SpankBankCallerSession struct {
	Contract *SpankBankCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts    // Call options to use throughout this session
}

// SpankBankTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type SpankBankTransactorSession struct {
	Contract     *SpankBankTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts    // Transaction auth options to use throughout this session
}

// SpankBankRaw is an auto generated low-level Go binding around an Ethereum contract.
type SpankBankRaw struct {
	Contract *SpankBank // Generic contract binding to access the raw methods on
}

// SpankBankCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type SpankBankCallerRaw struct {
	Contract *SpankBankCaller // Generic read-only contract binding to access the raw methods on
}

// SpankBankTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type SpankBankTransactorRaw struct {
	Contract *SpankBankTransactor // Generic write-only contract binding to access the raw methods on
}

// NewSpankBank creates a new instance of SpankBank, bound to a specific deployed contract.
func NewSpankBank(address common.Address, backend bind.ContractBackend) (*SpankBank, error) {
	contract, err := bindSpankBank(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &SpankBank{SpankBankCaller: SpankBankCaller{contract: contract}, SpankBankTransactor: SpankBankTransactor{contract: contract}, SpankBankFilterer: SpankBankFilterer{contract: contract}}, nil
}

// NewSpankBankCaller creates a new read-only instance of SpankBank, bound to a specific deployed contract.
func NewSpankBankCaller(address common.Address, caller bind.ContractCaller) (*SpankBankCaller, error) {
	contract, err := bindSpankBank(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &SpankBankCaller{contract: contract}, nil
}

// NewSpankBankTransactor creates a new write-only instance of SpankBank, bound to a specific deployed contract.
func NewSpankBankTransactor(address common.Address, transactor bind.ContractTransactor) (*SpankBankTransactor, error) {
	contract, err := bindSpankBank(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &SpankBankTransactor{contract: contract}, nil
}

// NewSpankBankFilterer creates a new log filterer instance of SpankBank, bound to a specific deployed contract.
func NewSpankBankFilterer(address common.Address, filterer bind.ContractFilterer) (*SpankBankFilterer, error) {
	contract, err := bindSpankBank(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &SpankBankFilterer{contract: contract}, nil
}

// bindSpankBank binds a generic wrapper to an already deployed contract.
func bindSpankBank(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(SpankBankABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_SpankBank *SpankBankRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _SpankBank.Contract.SpankBankCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_SpankBank *SpankBankRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _SpankBank.Contract.SpankBankTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_SpankBank *SpankBankRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _SpankBank.Contract.SpankBankTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_SpankBank *SpankBankCallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _SpankBank.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_SpankBank *SpankBankTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _SpankBank.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_SpankBank *SpankBankTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _SpankBank.Contract.contract.Transact(opts, method, params...)
}

// ActivityKeys is a free data retrieval call binding the contract method 0xcadecbf4.
//
// Solidity: function activityKeys( address) constant returns(stakerAddress address)
func (_SpankBank *SpankBankCaller) ActivityKeys(opts *bind.CallOpts, arg0 common.Address) (common.Address, error) {
	var (
		ret0 = new(common.Address)
	)
	out := ret0
	err := _SpankBank.contract.Call(opts, out, "activityKeys", arg0)
	return *ret0, err
}

// ActivityKeys is a free data retrieval call binding the contract method 0xcadecbf4.
//
// Solidity: function activityKeys( address) constant returns(stakerAddress address)
func (_SpankBank *SpankBankSession) ActivityKeys(arg0 common.Address) (common.Address, error) {
	return _SpankBank.Contract.ActivityKeys(&_SpankBank.CallOpts, arg0)
}

// ActivityKeys is a free data retrieval call binding the contract method 0xcadecbf4.
//
// Solidity: function activityKeys( address) constant returns(stakerAddress address)
func (_SpankBank *SpankBankCallerSession) ActivityKeys(arg0 common.Address) (common.Address, error) {
	return _SpankBank.Contract.ActivityKeys(&_SpankBank.CallOpts, arg0)
}

// BootyToken is a free data retrieval call binding the contract method 0x50a9b541.
//
// Solidity: function bootyToken() constant returns(address)
func (_SpankBank *SpankBankCaller) BootyToken(opts *bind.CallOpts) (common.Address, error) {
	var (
		ret0 = new(common.Address)
	)
	out := ret0
	err := _SpankBank.contract.Call(opts, out, "bootyToken")
	return *ret0, err
}

// BootyToken is a free data retrieval call binding the contract method 0x50a9b541.
//
// Solidity: function bootyToken() constant returns(address)
func (_SpankBank *SpankBankSession) BootyToken() (common.Address, error) {
	return _SpankBank.Contract.BootyToken(&_SpankBank.CallOpts)
}

// BootyToken is a free data retrieval call binding the contract method 0x50a9b541.
//
// Solidity: function bootyToken() constant returns(address)
func (_SpankBank *SpankBankCallerSession) BootyToken() (common.Address, error) {
	return _SpankBank.Contract.BootyToken(&_SpankBank.CallOpts)
}

// CurrentPeriod is a free data retrieval call binding the contract method 0x06040618.
//
// Solidity: function currentPeriod() constant returns(uint256)
func (_SpankBank *SpankBankCaller) CurrentPeriod(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _SpankBank.contract.Call(opts, out, "currentPeriod")
	return *ret0, err
}

// CurrentPeriod is a free data retrieval call binding the contract method 0x06040618.
//
// Solidity: function currentPeriod() constant returns(uint256)
func (_SpankBank *SpankBankSession) CurrentPeriod() (*big.Int, error) {
	return _SpankBank.Contract.CurrentPeriod(&_SpankBank.CallOpts)
}

// CurrentPeriod is a free data retrieval call binding the contract method 0x06040618.
//
// Solidity: function currentPeriod() constant returns(uint256)
func (_SpankBank *SpankBankCallerSession) CurrentPeriod() (*big.Int, error) {
	return _SpankBank.Contract.CurrentPeriod(&_SpankBank.CallOpts)
}

// GetDidClaimBooty is a free data retrieval call binding the contract method 0xcc741c9c.
//
// Solidity: function getDidClaimBooty(stakerAddress address, period uint256) constant returns(bool)
func (_SpankBank *SpankBankCaller) GetDidClaimBooty(opts *bind.CallOpts, stakerAddress common.Address, period *big.Int) (bool, error) {
	var (
		ret0 = new(bool)
	)
	out := ret0
	err := _SpankBank.contract.Call(opts, out, "getDidClaimBooty", stakerAddress, period)
	return *ret0, err
}

// GetDidClaimBooty is a free data retrieval call binding the contract method 0xcc741c9c.
//
// Solidity: function getDidClaimBooty(stakerAddress address, period uint256) constant returns(bool)
func (_SpankBank *SpankBankSession) GetDidClaimBooty(stakerAddress common.Address, period *big.Int) (bool, error) {
	return _SpankBank.Contract.GetDidClaimBooty(&_SpankBank.CallOpts, stakerAddress, period)
}

// GetDidClaimBooty is a free data retrieval call binding the contract method 0xcc741c9c.
//
// Solidity: function getDidClaimBooty(stakerAddress address, period uint256) constant returns(bool)
func (_SpankBank *SpankBankCallerSession) GetDidClaimBooty(stakerAddress common.Address, period *big.Int) (bool, error) {
	return _SpankBank.Contract.GetDidClaimBooty(&_SpankBank.CallOpts, stakerAddress, period)
}

// GetSpankPoints is a free data retrieval call binding the contract method 0x4cfef220.
//
// Solidity: function getSpankPoints(stakerAddress address, period uint256) constant returns(uint256)
func (_SpankBank *SpankBankCaller) GetSpankPoints(opts *bind.CallOpts, stakerAddress common.Address, period *big.Int) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _SpankBank.contract.Call(opts, out, "getSpankPoints", stakerAddress, period)
	return *ret0, err
}

// GetSpankPoints is a free data retrieval call binding the contract method 0x4cfef220.
//
// Solidity: function getSpankPoints(stakerAddress address, period uint256) constant returns(uint256)
func (_SpankBank *SpankBankSession) GetSpankPoints(stakerAddress common.Address, period *big.Int) (*big.Int, error) {
	return _SpankBank.Contract.GetSpankPoints(&_SpankBank.CallOpts, stakerAddress, period)
}

// GetSpankPoints is a free data retrieval call binding the contract method 0x4cfef220.
//
// Solidity: function getSpankPoints(stakerAddress address, period uint256) constant returns(uint256)
func (_SpankBank *SpankBankCallerSession) GetSpankPoints(stakerAddress common.Address, period *big.Int) (*big.Int, error) {
	return _SpankBank.Contract.GetSpankPoints(&_SpankBank.CallOpts, stakerAddress, period)
}

// MaxPeriods is a free data retrieval call binding the contract method 0x5155bafa.
//
// Solidity: function maxPeriods() constant returns(uint256)
func (_SpankBank *SpankBankCaller) MaxPeriods(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _SpankBank.contract.Call(opts, out, "maxPeriods")
	return *ret0, err
}

// MaxPeriods is a free data retrieval call binding the contract method 0x5155bafa.
//
// Solidity: function maxPeriods() constant returns(uint256)
func (_SpankBank *SpankBankSession) MaxPeriods() (*big.Int, error) {
	return _SpankBank.Contract.MaxPeriods(&_SpankBank.CallOpts)
}

// MaxPeriods is a free data retrieval call binding the contract method 0x5155bafa.
//
// Solidity: function maxPeriods() constant returns(uint256)
func (_SpankBank *SpankBankCallerSession) MaxPeriods() (*big.Int, error) {
	return _SpankBank.Contract.MaxPeriods(&_SpankBank.CallOpts)
}

// PeriodLength is a free data retrieval call binding the contract method 0xd2ca2115.
//
// Solidity: function periodLength() constant returns(uint256)
func (_SpankBank *SpankBankCaller) PeriodLength(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _SpankBank.contract.Call(opts, out, "periodLength")
	return *ret0, err
}

// PeriodLength is a free data retrieval call binding the contract method 0xd2ca2115.
//
// Solidity: function periodLength() constant returns(uint256)
func (_SpankBank *SpankBankSession) PeriodLength() (*big.Int, error) {
	return _SpankBank.Contract.PeriodLength(&_SpankBank.CallOpts)
}

// PeriodLength is a free data retrieval call binding the contract method 0xd2ca2115.
//
// Solidity: function periodLength() constant returns(uint256)
func (_SpankBank *SpankBankCallerSession) PeriodLength() (*big.Int, error) {
	return _SpankBank.Contract.PeriodLength(&_SpankBank.CallOpts)
}

// Periods is a free data retrieval call binding the contract method 0xea4a1104.
//
// Solidity: function periods( uint256) constant returns(bootyFees uint256, totalSpankPoints uint256, bootyMinted uint256, mintingComplete bool, startTime uint256, endTime uint256)
func (_SpankBank *SpankBankCaller) Periods(opts *bind.CallOpts, arg0 *big.Int) (struct {
	BootyFees        *big.Int
	TotalSpankPoints *big.Int
	BootyMinted      *big.Int
	MintingComplete  bool
	StartTime        *big.Int
	EndTime          *big.Int
}, error) {
	ret := new(struct {
		BootyFees        *big.Int
		TotalSpankPoints *big.Int
		BootyMinted      *big.Int
		MintingComplete  bool
		StartTime        *big.Int
		EndTime          *big.Int
	})
	out := ret
	err := _SpankBank.contract.Call(opts, out, "periods", arg0)
	return *ret, err
}

// Periods is a free data retrieval call binding the contract method 0xea4a1104.
//
// Solidity: function periods( uint256) constant returns(bootyFees uint256, totalSpankPoints uint256, bootyMinted uint256, mintingComplete bool, startTime uint256, endTime uint256)
func (_SpankBank *SpankBankSession) Periods(arg0 *big.Int) (struct {
	BootyFees        *big.Int
	TotalSpankPoints *big.Int
	BootyMinted      *big.Int
	MintingComplete  bool
	StartTime        *big.Int
	EndTime          *big.Int
}, error) {
	return _SpankBank.Contract.Periods(&_SpankBank.CallOpts, arg0)
}

// Periods is a free data retrieval call binding the contract method 0xea4a1104.
//
// Solidity: function periods( uint256) constant returns(bootyFees uint256, totalSpankPoints uint256, bootyMinted uint256, mintingComplete bool, startTime uint256, endTime uint256)
func (_SpankBank *SpankBankCallerSession) Periods(arg0 *big.Int) (struct {
	BootyFees        *big.Int
	TotalSpankPoints *big.Int
	BootyMinted      *big.Int
	MintingComplete  bool
	StartTime        *big.Int
	EndTime          *big.Int
}, error) {
	return _SpankBank.Contract.Periods(&_SpankBank.CallOpts, arg0)
}

// SpankToken is a free data retrieval call binding the contract method 0x92f4d225.
//
// Solidity: function spankToken() constant returns(address)
func (_SpankBank *SpankBankCaller) SpankToken(opts *bind.CallOpts) (common.Address, error) {
	var (
		ret0 = new(common.Address)
	)
	out := ret0
	err := _SpankBank.contract.Call(opts, out, "spankToken")
	return *ret0, err
}

// SpankToken is a free data retrieval call binding the contract method 0x92f4d225.
//
// Solidity: function spankToken() constant returns(address)
func (_SpankBank *SpankBankSession) SpankToken() (common.Address, error) {
	return _SpankBank.Contract.SpankToken(&_SpankBank.CallOpts)
}

// SpankToken is a free data retrieval call binding the contract method 0x92f4d225.
//
// Solidity: function spankToken() constant returns(address)
func (_SpankBank *SpankBankCallerSession) SpankToken() (common.Address, error) {
	return _SpankBank.Contract.SpankToken(&_SpankBank.CallOpts)
}

// Stakers is a free data retrieval call binding the contract method 0x9168ae72.
//
// Solidity: function stakers( address) constant returns(spankStaked uint256, startingPeriod uint256, endingPeriod uint256, activityKey address, bootyBase address)
func (_SpankBank *SpankBankCaller) Stakers(opts *bind.CallOpts, arg0 common.Address) (struct {
	SpankStaked    *big.Int
	StartingPeriod *big.Int
	EndingPeriod   *big.Int
	ActivityKey    common.Address
	BootyBase      common.Address
}, error) {
	ret := new(struct {
		SpankStaked    *big.Int
		StartingPeriod *big.Int
		EndingPeriod   *big.Int
		ActivityKey    common.Address
		BootyBase      common.Address
	})
	out := ret
	err := _SpankBank.contract.Call(opts, out, "stakers", arg0)
	return *ret, err
}

// Stakers is a free data retrieval call binding the contract method 0x9168ae72.
//
// Solidity: function stakers( address) constant returns(spankStaked uint256, startingPeriod uint256, endingPeriod uint256, activityKey address, bootyBase address)
func (_SpankBank *SpankBankSession) Stakers(arg0 common.Address) (struct {
	SpankStaked    *big.Int
	StartingPeriod *big.Int
	EndingPeriod   *big.Int
	ActivityKey    common.Address
	BootyBase      common.Address
}, error) {
	return _SpankBank.Contract.Stakers(&_SpankBank.CallOpts, arg0)
}

// Stakers is a free data retrieval call binding the contract method 0x9168ae72.
//
// Solidity: function stakers( address) constant returns(spankStaked uint256, startingPeriod uint256, endingPeriod uint256, activityKey address, bootyBase address)
func (_SpankBank *SpankBankCallerSession) Stakers(arg0 common.Address) (struct {
	SpankStaked    *big.Int
	StartingPeriod *big.Int
	EndingPeriod   *big.Int
	ActivityKey    common.Address
	BootyBase      common.Address
}, error) {
	return _SpankBank.Contract.Stakers(&_SpankBank.CallOpts, arg0)
}

// TotalSpankStaked is a free data retrieval call binding the contract method 0xcd43ebf9.
//
// Solidity: function totalSpankStaked() constant returns(uint256)
func (_SpankBank *SpankBankCaller) TotalSpankStaked(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _SpankBank.contract.Call(opts, out, "totalSpankStaked")
	return *ret0, err
}

// TotalSpankStaked is a free data retrieval call binding the contract method 0xcd43ebf9.
//
// Solidity: function totalSpankStaked() constant returns(uint256)
func (_SpankBank *SpankBankSession) TotalSpankStaked() (*big.Int, error) {
	return _SpankBank.Contract.TotalSpankStaked(&_SpankBank.CallOpts)
}

// TotalSpankStaked is a free data retrieval call binding the contract method 0xcd43ebf9.
//
// Solidity: function totalSpankStaked() constant returns(uint256)
func (_SpankBank *SpankBankCallerSession) TotalSpankStaked() (*big.Int, error) {
	return _SpankBank.Contract.TotalSpankStaked(&_SpankBank.CallOpts)
}

// Unwind is a free data retrieval call binding the contract method 0x807763ab.
//
// Solidity: function unwind() constant returns(bool)
func (_SpankBank *SpankBankCaller) Unwind(opts *bind.CallOpts) (bool, error) {
	var (
		ret0 = new(bool)
	)
	out := ret0
	err := _SpankBank.contract.Call(opts, out, "unwind")
	return *ret0, err
}

// Unwind is a free data retrieval call binding the contract method 0x807763ab.
//
// Solidity: function unwind() constant returns(bool)
func (_SpankBank *SpankBankSession) Unwind() (bool, error) {
	return _SpankBank.Contract.Unwind(&_SpankBank.CallOpts)
}

// Unwind is a free data retrieval call binding the contract method 0x807763ab.
//
// Solidity: function unwind() constant returns(bool)
func (_SpankBank *SpankBankCallerSession) Unwind() (bool, error) {
	return _SpankBank.Contract.Unwind(&_SpankBank.CallOpts)
}

// UnwindPeriod is a free data retrieval call binding the contract method 0xded217fb.
//
// Solidity: function unwindPeriod() constant returns(uint256)
func (_SpankBank *SpankBankCaller) UnwindPeriod(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _SpankBank.contract.Call(opts, out, "unwindPeriod")
	return *ret0, err
}

// UnwindPeriod is a free data retrieval call binding the contract method 0xded217fb.
//
// Solidity: function unwindPeriod() constant returns(uint256)
func (_SpankBank *SpankBankSession) UnwindPeriod() (*big.Int, error) {
	return _SpankBank.Contract.UnwindPeriod(&_SpankBank.CallOpts)
}

// UnwindPeriod is a free data retrieval call binding the contract method 0xded217fb.
//
// Solidity: function unwindPeriod() constant returns(uint256)
func (_SpankBank *SpankBankCallerSession) UnwindPeriod() (*big.Int, error) {
	return _SpankBank.Contract.UnwindPeriod(&_SpankBank.CallOpts)
}

// UnwindVotes is a free data retrieval call binding the contract method 0xe8493e0c.
//
// Solidity: function unwindVotes() constant returns(uint256)
func (_SpankBank *SpankBankCaller) UnwindVotes(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _SpankBank.contract.Call(opts, out, "unwindVotes")
	return *ret0, err
}

// UnwindVotes is a free data retrieval call binding the contract method 0xe8493e0c.
//
// Solidity: function unwindVotes() constant returns(uint256)
func (_SpankBank *SpankBankSession) UnwindVotes() (*big.Int, error) {
	return _SpankBank.Contract.UnwindVotes(&_SpankBank.CallOpts)
}

// UnwindVotes is a free data retrieval call binding the contract method 0xe8493e0c.
//
// Solidity: function unwindVotes() constant returns(uint256)
func (_SpankBank *SpankBankCallerSession) UnwindVotes() (*big.Int, error) {
	return _SpankBank.Contract.UnwindVotes(&_SpankBank.CallOpts)
}

// CheckIn is a paid mutator transaction binding the contract method 0xe95a644f.
//
// Solidity: function checkIn(updatedEndingPeriod uint256) returns()
func (_SpankBank *SpankBankTransactor) CheckIn(opts *bind.TransactOpts, updatedEndingPeriod *big.Int) (*types.Transaction, error) {
	return _SpankBank.contract.Transact(opts, "checkIn", updatedEndingPeriod)
}

// CheckIn is a paid mutator transaction binding the contract method 0xe95a644f.
//
// Solidity: function checkIn(updatedEndingPeriod uint256) returns()
func (_SpankBank *SpankBankSession) CheckIn(updatedEndingPeriod *big.Int) (*types.Transaction, error) {
	return _SpankBank.Contract.CheckIn(&_SpankBank.TransactOpts, updatedEndingPeriod)
}

// CheckIn is a paid mutator transaction binding the contract method 0xe95a644f.
//
// Solidity: function checkIn(updatedEndingPeriod uint256) returns()
func (_SpankBank *SpankBankTransactorSession) CheckIn(updatedEndingPeriod *big.Int) (*types.Transaction, error) {
	return _SpankBank.Contract.CheckIn(&_SpankBank.TransactOpts, updatedEndingPeriod)
}

// ClaimBooty is a paid mutator transaction binding the contract method 0xa0ac5776.
//
// Solidity: function claimBooty(_period uint256) returns()
func (_SpankBank *SpankBankTransactor) ClaimBooty(opts *bind.TransactOpts, _period *big.Int) (*types.Transaction, error) {
	return _SpankBank.contract.Transact(opts, "claimBooty", _period)
}

// ClaimBooty is a paid mutator transaction binding the contract method 0xa0ac5776.
//
// Solidity: function claimBooty(_period uint256) returns()
func (_SpankBank *SpankBankSession) ClaimBooty(_period *big.Int) (*types.Transaction, error) {
	return _SpankBank.Contract.ClaimBooty(&_SpankBank.TransactOpts, _period)
}

// ClaimBooty is a paid mutator transaction binding the contract method 0xa0ac5776.
//
// Solidity: function claimBooty(_period uint256) returns()
func (_SpankBank *SpankBankTransactorSession) ClaimBooty(_period *big.Int) (*types.Transaction, error) {
	return _SpankBank.Contract.ClaimBooty(&_SpankBank.TransactOpts, _period)
}

// MintBooty is a paid mutator transaction binding the contract method 0x53547d3f.
//
// Solidity: function mintBooty() returns()
func (_SpankBank *SpankBankTransactor) MintBooty(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _SpankBank.contract.Transact(opts, "mintBooty")
}

// MintBooty is a paid mutator transaction binding the contract method 0x53547d3f.
//
// Solidity: function mintBooty() returns()
func (_SpankBank *SpankBankSession) MintBooty() (*types.Transaction, error) {
	return _SpankBank.Contract.MintBooty(&_SpankBank.TransactOpts)
}

// MintBooty is a paid mutator transaction binding the contract method 0x53547d3f.
//
// Solidity: function mintBooty() returns()
func (_SpankBank *SpankBankTransactorSession) MintBooty() (*types.Transaction, error) {
	return _SpankBank.Contract.MintBooty(&_SpankBank.TransactOpts)
}

// SendFees is a paid mutator transaction binding the contract method 0xecd4eb74.
//
// Solidity: function sendFees(bootyAmount uint256) returns()
func (_SpankBank *SpankBankTransactor) SendFees(opts *bind.TransactOpts, bootyAmount *big.Int) (*types.Transaction, error) {
	return _SpankBank.contract.Transact(opts, "sendFees", bootyAmount)
}

// SendFees is a paid mutator transaction binding the contract method 0xecd4eb74.
//
// Solidity: function sendFees(bootyAmount uint256) returns()
func (_SpankBank *SpankBankSession) SendFees(bootyAmount *big.Int) (*types.Transaction, error) {
	return _SpankBank.Contract.SendFees(&_SpankBank.TransactOpts, bootyAmount)
}

// SendFees is a paid mutator transaction binding the contract method 0xecd4eb74.
//
// Solidity: function sendFees(bootyAmount uint256) returns()
func (_SpankBank *SpankBankTransactorSession) SendFees(bootyAmount *big.Int) (*types.Transaction, error) {
	return _SpankBank.Contract.SendFees(&_SpankBank.TransactOpts, bootyAmount)
}

// SplitStake is a paid mutator transaction binding the contract method 0xb8c0517a.
//
// Solidity: function splitStake(newAddress address, newActivityKey address, newBootyBase address, spankAmount uint256) returns()
func (_SpankBank *SpankBankTransactor) SplitStake(opts *bind.TransactOpts, newAddress common.Address, newActivityKey common.Address, newBootyBase common.Address, spankAmount *big.Int) (*types.Transaction, error) {
	return _SpankBank.contract.Transact(opts, "splitStake", newAddress, newActivityKey, newBootyBase, spankAmount)
}

// SplitStake is a paid mutator transaction binding the contract method 0xb8c0517a.
//
// Solidity: function splitStake(newAddress address, newActivityKey address, newBootyBase address, spankAmount uint256) returns()
func (_SpankBank *SpankBankSession) SplitStake(newAddress common.Address, newActivityKey common.Address, newBootyBase common.Address, spankAmount *big.Int) (*types.Transaction, error) {
	return _SpankBank.Contract.SplitStake(&_SpankBank.TransactOpts, newAddress, newActivityKey, newBootyBase, spankAmount)
}

// SplitStake is a paid mutator transaction binding the contract method 0xb8c0517a.
//
// Solidity: function splitStake(newAddress address, newActivityKey address, newBootyBase address, spankAmount uint256) returns()
func (_SpankBank *SpankBankTransactorSession) SplitStake(newAddress common.Address, newActivityKey common.Address, newBootyBase common.Address, spankAmount *big.Int) (*types.Transaction, error) {
	return _SpankBank.Contract.SplitStake(&_SpankBank.TransactOpts, newAddress, newActivityKey, newBootyBase, spankAmount)
}

// Stake is a paid mutator transaction binding the contract method 0x40809acd.
//
// Solidity: function stake(spankAmount uint256, stakePeriods uint256, activityKey address, bootyBase address) returns()
func (_SpankBank *SpankBankTransactor) Stake(opts *bind.TransactOpts, spankAmount *big.Int, stakePeriods *big.Int, activityKey common.Address, bootyBase common.Address) (*types.Transaction, error) {
	return _SpankBank.contract.Transact(opts, "stake", spankAmount, stakePeriods, activityKey, bootyBase)
}

// Stake is a paid mutator transaction binding the contract method 0x40809acd.
//
// Solidity: function stake(spankAmount uint256, stakePeriods uint256, activityKey address, bootyBase address) returns()
func (_SpankBank *SpankBankSession) Stake(spankAmount *big.Int, stakePeriods *big.Int, activityKey common.Address, bootyBase common.Address) (*types.Transaction, error) {
	return _SpankBank.Contract.Stake(&_SpankBank.TransactOpts, spankAmount, stakePeriods, activityKey, bootyBase)
}

// Stake is a paid mutator transaction binding the contract method 0x40809acd.
//
// Solidity: function stake(spankAmount uint256, stakePeriods uint256, activityKey address, bootyBase address) returns()
func (_SpankBank *SpankBankTransactorSession) Stake(spankAmount *big.Int, stakePeriods *big.Int, activityKey common.Address, bootyBase common.Address) (*types.Transaction, error) {
	return _SpankBank.Contract.Stake(&_SpankBank.TransactOpts, spankAmount, stakePeriods, activityKey, bootyBase)
}

// UpdateActivityKey is a paid mutator transaction binding the contract method 0x9f80a856.
//
// Solidity: function updateActivityKey(newActivityKey address) returns()
func (_SpankBank *SpankBankTransactor) UpdateActivityKey(opts *bind.TransactOpts, newActivityKey common.Address) (*types.Transaction, error) {
	return _SpankBank.contract.Transact(opts, "updateActivityKey", newActivityKey)
}

// UpdateActivityKey is a paid mutator transaction binding the contract method 0x9f80a856.
//
// Solidity: function updateActivityKey(newActivityKey address) returns()
func (_SpankBank *SpankBankSession) UpdateActivityKey(newActivityKey common.Address) (*types.Transaction, error) {
	return _SpankBank.Contract.UpdateActivityKey(&_SpankBank.TransactOpts, newActivityKey)
}

// UpdateActivityKey is a paid mutator transaction binding the contract method 0x9f80a856.
//
// Solidity: function updateActivityKey(newActivityKey address) returns()
func (_SpankBank *SpankBankTransactorSession) UpdateActivityKey(newActivityKey common.Address) (*types.Transaction, error) {
	return _SpankBank.Contract.UpdateActivityKey(&_SpankBank.TransactOpts, newActivityKey)
}

// UpdateBootyBase is a paid mutator transaction binding the contract method 0x948cfd0c.
//
// Solidity: function updateBootyBase(newBootyBase address) returns()
func (_SpankBank *SpankBankTransactor) UpdateBootyBase(opts *bind.TransactOpts, newBootyBase common.Address) (*types.Transaction, error) {
	return _SpankBank.contract.Transact(opts, "updateBootyBase", newBootyBase)
}

// UpdateBootyBase is a paid mutator transaction binding the contract method 0x948cfd0c.
//
// Solidity: function updateBootyBase(newBootyBase address) returns()
func (_SpankBank *SpankBankSession) UpdateBootyBase(newBootyBase common.Address) (*types.Transaction, error) {
	return _SpankBank.Contract.UpdateBootyBase(&_SpankBank.TransactOpts, newBootyBase)
}

// UpdateBootyBase is a paid mutator transaction binding the contract method 0x948cfd0c.
//
// Solidity: function updateBootyBase(newBootyBase address) returns()
func (_SpankBank *SpankBankTransactorSession) UpdateBootyBase(newBootyBase common.Address) (*types.Transaction, error) {
	return _SpankBank.Contract.UpdateBootyBase(&_SpankBank.TransactOpts, newBootyBase)
}

// UpdatePeriod is a paid mutator transaction binding the contract method 0xa83627de.
//
// Solidity: function updatePeriod() returns()
func (_SpankBank *SpankBankTransactor) UpdatePeriod(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _SpankBank.contract.Transact(opts, "updatePeriod")
}

// UpdatePeriod is a paid mutator transaction binding the contract method 0xa83627de.
//
// Solidity: function updatePeriod() returns()
func (_SpankBank *SpankBankSession) UpdatePeriod() (*types.Transaction, error) {
	return _SpankBank.Contract.UpdatePeriod(&_SpankBank.TransactOpts)
}

// UpdatePeriod is a paid mutator transaction binding the contract method 0xa83627de.
//
// Solidity: function updatePeriod() returns()
func (_SpankBank *SpankBankTransactorSession) UpdatePeriod() (*types.Transaction, error) {
	return _SpankBank.Contract.UpdatePeriod(&_SpankBank.TransactOpts)
}

// VoteToUnwind is a paid mutator transaction binding the contract method 0x9017e2dd.
//
// Solidity: function voteToUnwind() returns()
func (_SpankBank *SpankBankTransactor) VoteToUnwind(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _SpankBank.contract.Transact(opts, "voteToUnwind")
}

// VoteToUnwind is a paid mutator transaction binding the contract method 0x9017e2dd.
//
// Solidity: function voteToUnwind() returns()
func (_SpankBank *SpankBankSession) VoteToUnwind() (*types.Transaction, error) {
	return _SpankBank.Contract.VoteToUnwind(&_SpankBank.TransactOpts)
}

// VoteToUnwind is a paid mutator transaction binding the contract method 0x9017e2dd.
//
// Solidity: function voteToUnwind() returns()
func (_SpankBank *SpankBankTransactorSession) VoteToUnwind() (*types.Transaction, error) {
	return _SpankBank.Contract.VoteToUnwind(&_SpankBank.TransactOpts)
}

// WithdrawStake is a paid mutator transaction binding the contract method 0xbed9d861.
//
// Solidity: function withdrawStake() returns()
func (_SpankBank *SpankBankTransactor) WithdrawStake(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _SpankBank.contract.Transact(opts, "withdrawStake")
}

// WithdrawStake is a paid mutator transaction binding the contract method 0xbed9d861.
//
// Solidity: function withdrawStake() returns()
func (_SpankBank *SpankBankSession) WithdrawStake() (*types.Transaction, error) {
	return _SpankBank.Contract.WithdrawStake(&_SpankBank.TransactOpts)
}

// WithdrawStake is a paid mutator transaction binding the contract method 0xbed9d861.
//
// Solidity: function withdrawStake() returns()
func (_SpankBank *SpankBankTransactorSession) WithdrawStake() (*types.Transaction, error) {
	return _SpankBank.Contract.WithdrawStake(&_SpankBank.TransactOpts)
}

// SpankBankCheckInEventIterator is returned from FilterCheckInEvent and is used to iterate over the raw logs and unpacked data for CheckInEvent events raised by the SpankBank contract.
type SpankBankCheckInEventIterator struct {
	Event *SpankBankCheckInEvent // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SpankBankCheckInEventIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SpankBankCheckInEvent)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SpankBankCheckInEvent)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SpankBankCheckInEventIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SpankBankCheckInEventIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SpankBankCheckInEvent represents a CheckInEvent event raised by the SpankBank contract.
type SpankBankCheckInEvent struct {
	Staker              common.Address
	UpdatedEndingPeriod *big.Int
	CurrentPeriod       *big.Int
	Raw                 types.Log // Blockchain specific contextual infos
}

// FilterCheckInEvent is a free log retrieval operation binding the contract event 0x455c1ec2de533b70dc801a34a71f427f49eab272a8ae032773d40899e546e890.
//
// Solidity: e CheckInEvent(staker indexed address, updatedEndingPeriod indexed uint256, currentPeriod indexed uint256)
func (_SpankBank *SpankBankFilterer) FilterCheckInEvent(opts *bind.FilterOpts, staker []common.Address, updatedEndingPeriod []*big.Int, currentPeriod []*big.Int) (*SpankBankCheckInEventIterator, error) {

	var stakerRule []interface{}
	for _, stakerItem := range staker {
		stakerRule = append(stakerRule, stakerItem)
	}
	var updatedEndingPeriodRule []interface{}
	for _, updatedEndingPeriodItem := range updatedEndingPeriod {
		updatedEndingPeriodRule = append(updatedEndingPeriodRule, updatedEndingPeriodItem)
	}
	var currentPeriodRule []interface{}
	for _, currentPeriodItem := range currentPeriod {
		currentPeriodRule = append(currentPeriodRule, currentPeriodItem)
	}

	logs, sub, err := _SpankBank.contract.FilterLogs(opts, "CheckInEvent", stakerRule, updatedEndingPeriodRule, currentPeriodRule)
	if err != nil {
		return nil, err
	}
	return &SpankBankCheckInEventIterator{contract: _SpankBank.contract, event: "CheckInEvent", logs: logs, sub: sub}, nil
}

// WatchCheckInEvent is a free log subscription operation binding the contract event 0x455c1ec2de533b70dc801a34a71f427f49eab272a8ae032773d40899e546e890.
//
// Solidity: e CheckInEvent(staker indexed address, updatedEndingPeriod indexed uint256, currentPeriod indexed uint256)
func (_SpankBank *SpankBankFilterer) WatchCheckInEvent(opts *bind.WatchOpts, sink chan<- *SpankBankCheckInEvent, staker []common.Address, updatedEndingPeriod []*big.Int, currentPeriod []*big.Int) (event.Subscription, error) {

	var stakerRule []interface{}
	for _, stakerItem := range staker {
		stakerRule = append(stakerRule, stakerItem)
	}
	var updatedEndingPeriodRule []interface{}
	for _, updatedEndingPeriodItem := range updatedEndingPeriod {
		updatedEndingPeriodRule = append(updatedEndingPeriodRule, updatedEndingPeriodItem)
	}
	var currentPeriodRule []interface{}
	for _, currentPeriodItem := range currentPeriod {
		currentPeriodRule = append(currentPeriodRule, currentPeriodItem)
	}

	logs, sub, err := _SpankBank.contract.WatchLogs(opts, "CheckInEvent", stakerRule, updatedEndingPeriodRule, currentPeriodRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SpankBankCheckInEvent)
				if err := _SpankBank.contract.UnpackLog(event, "CheckInEvent", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// SpankBankClaimBootyEventIterator is returned from FilterClaimBootyEvent and is used to iterate over the raw logs and unpacked data for ClaimBootyEvent events raised by the SpankBank contract.
type SpankBankClaimBootyEventIterator struct {
	Event *SpankBankClaimBootyEvent // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SpankBankClaimBootyEventIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SpankBankClaimBootyEvent)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SpankBankClaimBootyEvent)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SpankBankClaimBootyEventIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SpankBankClaimBootyEventIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SpankBankClaimBootyEvent represents a ClaimBootyEvent event raised by the SpankBank contract.
type SpankBankClaimBootyEvent struct {
	Staker            common.Address
	Period            *big.Int
	BootyOwed         *big.Int
	StakerSpankPoints *big.Int
	Raw               types.Log // Blockchain specific contextual infos
}

// FilterClaimBootyEvent is a free log retrieval operation binding the contract event 0xe1d1189cee6887b24b34b81f7035870bd447e9a987ed494343b936e029ea583c.
//
// Solidity: e ClaimBootyEvent(staker indexed address, period indexed uint256, bootyOwed indexed uint256, stakerSpankPoints uint256)
func (_SpankBank *SpankBankFilterer) FilterClaimBootyEvent(opts *bind.FilterOpts, staker []common.Address, period []*big.Int, bootyOwed []*big.Int) (*SpankBankClaimBootyEventIterator, error) {

	var stakerRule []interface{}
	for _, stakerItem := range staker {
		stakerRule = append(stakerRule, stakerItem)
	}
	var periodRule []interface{}
	for _, periodItem := range period {
		periodRule = append(periodRule, periodItem)
	}
	var bootyOwedRule []interface{}
	for _, bootyOwedItem := range bootyOwed {
		bootyOwedRule = append(bootyOwedRule, bootyOwedItem)
	}

	logs, sub, err := _SpankBank.contract.FilterLogs(opts, "ClaimBootyEvent", stakerRule, periodRule, bootyOwedRule)
	if err != nil {
		return nil, err
	}
	return &SpankBankClaimBootyEventIterator{contract: _SpankBank.contract, event: "ClaimBootyEvent", logs: logs, sub: sub}, nil
}

// WatchClaimBootyEvent is a free log subscription operation binding the contract event 0xe1d1189cee6887b24b34b81f7035870bd447e9a987ed494343b936e029ea583c.
//
// Solidity: e ClaimBootyEvent(staker indexed address, period indexed uint256, bootyOwed indexed uint256, stakerSpankPoints uint256)
func (_SpankBank *SpankBankFilterer) WatchClaimBootyEvent(opts *bind.WatchOpts, sink chan<- *SpankBankClaimBootyEvent, staker []common.Address, period []*big.Int, bootyOwed []*big.Int) (event.Subscription, error) {

	var stakerRule []interface{}
	for _, stakerItem := range staker {
		stakerRule = append(stakerRule, stakerItem)
	}
	var periodRule []interface{}
	for _, periodItem := range period {
		periodRule = append(periodRule, periodItem)
	}
	var bootyOwedRule []interface{}
	for _, bootyOwedItem := range bootyOwed {
		bootyOwedRule = append(bootyOwedRule, bootyOwedItem)
	}

	logs, sub, err := _SpankBank.contract.WatchLogs(opts, "ClaimBootyEvent", stakerRule, periodRule, bootyOwedRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SpankBankClaimBootyEvent)
				if err := _SpankBank.contract.UnpackLog(event, "ClaimBootyEvent", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// SpankBankMintBootyEventIterator is returned from FilterMintBootyEvent and is used to iterate over the raw logs and unpacked data for MintBootyEvent events raised by the SpankBank contract.
type SpankBankMintBootyEventIterator struct {
	Event *SpankBankMintBootyEvent // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SpankBankMintBootyEventIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SpankBankMintBootyEvent)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SpankBankMintBootyEvent)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SpankBankMintBootyEventIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SpankBankMintBootyEventIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SpankBankMintBootyEvent represents a MintBootyEvent event raised by the SpankBank contract.
type SpankBankMintBootyEvent struct {
	TargetBootySupply *big.Int
	TotalBootySupply  *big.Int
	CurrentPeriod     *big.Int
	Raw               types.Log // Blockchain specific contextual infos
}

// FilterMintBootyEvent is a free log retrieval operation binding the contract event 0x010a0dccde1dc09471f09377456312d6a650dc23f1e296f6f47f2b41061d396a.
//
// Solidity: e MintBootyEvent(targetBootySupply indexed uint256, totalBootySupply indexed uint256, currentPeriod indexed uint256)
func (_SpankBank *SpankBankFilterer) FilterMintBootyEvent(opts *bind.FilterOpts, targetBootySupply []*big.Int, totalBootySupply []*big.Int, currentPeriod []*big.Int) (*SpankBankMintBootyEventIterator, error) {

	var targetBootySupplyRule []interface{}
	for _, targetBootySupplyItem := range targetBootySupply {
		targetBootySupplyRule = append(targetBootySupplyRule, targetBootySupplyItem)
	}
	var totalBootySupplyRule []interface{}
	for _, totalBootySupplyItem := range totalBootySupply {
		totalBootySupplyRule = append(totalBootySupplyRule, totalBootySupplyItem)
	}
	var currentPeriodRule []interface{}
	for _, currentPeriodItem := range currentPeriod {
		currentPeriodRule = append(currentPeriodRule, currentPeriodItem)
	}

	logs, sub, err := _SpankBank.contract.FilterLogs(opts, "MintBootyEvent", targetBootySupplyRule, totalBootySupplyRule, currentPeriodRule)
	if err != nil {
		return nil, err
	}
	return &SpankBankMintBootyEventIterator{contract: _SpankBank.contract, event: "MintBootyEvent", logs: logs, sub: sub}, nil
}

// WatchMintBootyEvent is a free log subscription operation binding the contract event 0x010a0dccde1dc09471f09377456312d6a650dc23f1e296f6f47f2b41061d396a.
//
// Solidity: e MintBootyEvent(targetBootySupply indexed uint256, totalBootySupply indexed uint256, currentPeriod indexed uint256)
func (_SpankBank *SpankBankFilterer) WatchMintBootyEvent(opts *bind.WatchOpts, sink chan<- *SpankBankMintBootyEvent, targetBootySupply []*big.Int, totalBootySupply []*big.Int, currentPeriod []*big.Int) (event.Subscription, error) {

	var targetBootySupplyRule []interface{}
	for _, targetBootySupplyItem := range targetBootySupply {
		targetBootySupplyRule = append(targetBootySupplyRule, targetBootySupplyItem)
	}
	var totalBootySupplyRule []interface{}
	for _, totalBootySupplyItem := range totalBootySupply {
		totalBootySupplyRule = append(totalBootySupplyRule, totalBootySupplyItem)
	}
	var currentPeriodRule []interface{}
	for _, currentPeriodItem := range currentPeriod {
		currentPeriodRule = append(currentPeriodRule, currentPeriodItem)
	}

	logs, sub, err := _SpankBank.contract.WatchLogs(opts, "MintBootyEvent", targetBootySupplyRule, totalBootySupplyRule, currentPeriodRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SpankBankMintBootyEvent)
				if err := _SpankBank.contract.UnpackLog(event, "MintBootyEvent", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// SpankBankSendFeesEventIterator is returned from FilterSendFeesEvent and is used to iterate over the raw logs and unpacked data for SendFeesEvent events raised by the SpankBank contract.
type SpankBankSendFeesEventIterator struct {
	Event *SpankBankSendFeesEvent // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SpankBankSendFeesEventIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SpankBankSendFeesEvent)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SpankBankSendFeesEvent)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SpankBankSendFeesEventIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SpankBankSendFeesEventIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SpankBankSendFeesEvent represents a SendFeesEvent event raised by the SpankBank contract.
type SpankBankSendFeesEvent struct {
	Sender           common.Address
	BootyAmount      *big.Int
	CurrentBootyFees *big.Int
	Raw              types.Log // Blockchain specific contextual infos
}

// FilterSendFeesEvent is a free log retrieval operation binding the contract event 0x25ff5f7e1c06929c6e3964f0ddde60bc47b581c30806cff0257a599b78cda3c5.
//
// Solidity: e SendFeesEvent(sender indexed address, bootyAmount indexed uint256, currentBootyFees indexed uint256)
func (_SpankBank *SpankBankFilterer) FilterSendFeesEvent(opts *bind.FilterOpts, sender []common.Address, bootyAmount []*big.Int, currentBootyFees []*big.Int) (*SpankBankSendFeesEventIterator, error) {

	var senderRule []interface{}
	for _, senderItem := range sender {
		senderRule = append(senderRule, senderItem)
	}
	var bootyAmountRule []interface{}
	for _, bootyAmountItem := range bootyAmount {
		bootyAmountRule = append(bootyAmountRule, bootyAmountItem)
	}
	var currentBootyFeesRule []interface{}
	for _, currentBootyFeesItem := range currentBootyFees {
		currentBootyFeesRule = append(currentBootyFeesRule, currentBootyFeesItem)
	}

	logs, sub, err := _SpankBank.contract.FilterLogs(opts, "SendFeesEvent", senderRule, bootyAmountRule, currentBootyFeesRule)
	if err != nil {
		return nil, err
	}
	return &SpankBankSendFeesEventIterator{contract: _SpankBank.contract, event: "SendFeesEvent", logs: logs, sub: sub}, nil
}

// WatchSendFeesEvent is a free log subscription operation binding the contract event 0x25ff5f7e1c06929c6e3964f0ddde60bc47b581c30806cff0257a599b78cda3c5.
//
// Solidity: e SendFeesEvent(sender indexed address, bootyAmount indexed uint256, currentBootyFees indexed uint256)
func (_SpankBank *SpankBankFilterer) WatchSendFeesEvent(opts *bind.WatchOpts, sink chan<- *SpankBankSendFeesEvent, sender []common.Address, bootyAmount []*big.Int, currentBootyFees []*big.Int) (event.Subscription, error) {

	var senderRule []interface{}
	for _, senderItem := range sender {
		senderRule = append(senderRule, senderItem)
	}
	var bootyAmountRule []interface{}
	for _, bootyAmountItem := range bootyAmount {
		bootyAmountRule = append(bootyAmountRule, bootyAmountItem)
	}
	var currentBootyFeesRule []interface{}
	for _, currentBootyFeesItem := range currentBootyFees {
		currentBootyFeesRule = append(currentBootyFeesRule, currentBootyFeesItem)
	}

	logs, sub, err := _SpankBank.contract.WatchLogs(opts, "SendFeesEvent", senderRule, bootyAmountRule, currentBootyFeesRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SpankBankSendFeesEvent)
				if err := _SpankBank.contract.UnpackLog(event, "SendFeesEvent", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// SpankBankSplitStakeEventIterator is returned from FilterSplitStakeEvent and is used to iterate over the raw logs and unpacked data for SplitStakeEvent events raised by the SpankBank contract.
type SpankBankSplitStakeEventIterator struct {
	Event *SpankBankSplitStakeEvent // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SpankBankSplitStakeEventIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SpankBankSplitStakeEvent)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SpankBankSplitStakeEvent)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SpankBankSplitStakeEventIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SpankBankSplitStakeEventIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SpankBankSplitStakeEvent represents a SplitStakeEvent event raised by the SpankBank contract.
type SpankBankSplitStakeEvent struct {
	Staker         common.Address
	NewAddress     common.Address
	SpankAmount    *big.Int
	CurrentPeriod  *big.Int
	StartingPeriod *big.Int
	EndingPeriod   *big.Int
	ActivityKey    common.Address
	BootyBase      common.Address
	Raw            types.Log // Blockchain specific contextual infos
}

// FilterSplitStakeEvent is a free log retrieval operation binding the contract event 0x020ad122863f9d4606cd49b606d739363e29bde82d8674133d9232bc0f4e1110.
//
// Solidity: e SplitStakeEvent(staker indexed address, newAddress indexed address, spankAmount indexed uint256, currentPeriod uint256, startingPeriod uint256, endingPeriod uint256, activityKey address, bootyBase address)
func (_SpankBank *SpankBankFilterer) FilterSplitStakeEvent(opts *bind.FilterOpts, staker []common.Address, newAddress []common.Address, spankAmount []*big.Int) (*SpankBankSplitStakeEventIterator, error) {

	var stakerRule []interface{}
	for _, stakerItem := range staker {
		stakerRule = append(stakerRule, stakerItem)
	}
	var newAddressRule []interface{}
	for _, newAddressItem := range newAddress {
		newAddressRule = append(newAddressRule, newAddressItem)
	}
	var spankAmountRule []interface{}
	for _, spankAmountItem := range spankAmount {
		spankAmountRule = append(spankAmountRule, spankAmountItem)
	}

	logs, sub, err := _SpankBank.contract.FilterLogs(opts, "SplitStakeEvent", stakerRule, newAddressRule, spankAmountRule)
	if err != nil {
		return nil, err
	}
	return &SpankBankSplitStakeEventIterator{contract: _SpankBank.contract, event: "SplitStakeEvent", logs: logs, sub: sub}, nil
}

// WatchSplitStakeEvent is a free log subscription operation binding the contract event 0x020ad122863f9d4606cd49b606d739363e29bde82d8674133d9232bc0f4e1110.
//
// Solidity: e SplitStakeEvent(staker indexed address, newAddress indexed address, spankAmount indexed uint256, currentPeriod uint256, startingPeriod uint256, endingPeriod uint256, activityKey address, bootyBase address)
func (_SpankBank *SpankBankFilterer) WatchSplitStakeEvent(opts *bind.WatchOpts, sink chan<- *SpankBankSplitStakeEvent, staker []common.Address, newAddress []common.Address, spankAmount []*big.Int) (event.Subscription, error) {

	var stakerRule []interface{}
	for _, stakerItem := range staker {
		stakerRule = append(stakerRule, stakerItem)
	}
	var newAddressRule []interface{}
	for _, newAddressItem := range newAddress {
		newAddressRule = append(newAddressRule, newAddressItem)
	}
	var spankAmountRule []interface{}
	for _, spankAmountItem := range spankAmount {
		spankAmountRule = append(spankAmountRule, spankAmountItem)
	}

	logs, sub, err := _SpankBank.contract.WatchLogs(opts, "SplitStakeEvent", stakerRule, newAddressRule, spankAmountRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SpankBankSplitStakeEvent)
				if err := _SpankBank.contract.UnpackLog(event, "SplitStakeEvent", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// SpankBankStakeEventIterator is returned from FilterStakeEvent and is used to iterate over the raw logs and unpacked data for StakeEvent events raised by the SpankBank contract.
type SpankBankStakeEventIterator struct {
	Event *SpankBankStakeEvent // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SpankBankStakeEventIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SpankBankStakeEvent)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SpankBankStakeEvent)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SpankBankStakeEventIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SpankBankStakeEventIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SpankBankStakeEvent represents a StakeEvent event raised by the SpankBank contract.
type SpankBankStakeEvent struct {
	Staker      common.Address
	StartPeriod *big.Int
	EndPeriod   *big.Int
	ActivityKey common.Address
	BootyBase   common.Address
	Raw         types.Log // Blockchain specific contextual infos
}

// FilterStakeEvent is a free log retrieval operation binding the contract event 0x9c13c846ec75aea1a0e03d6594d9f3383d1e1e1e6f63a8c8f90b6c86aa7b79c9.
//
// Solidity: e StakeEvent(staker indexed address, startPeriod indexed uint256, endPeriod indexed uint256, activityKey address, bootyBase address)
func (_SpankBank *SpankBankFilterer) FilterStakeEvent(opts *bind.FilterOpts, staker []common.Address, startPeriod []*big.Int, endPeriod []*big.Int) (*SpankBankStakeEventIterator, error) {

	var stakerRule []interface{}
	for _, stakerItem := range staker {
		stakerRule = append(stakerRule, stakerItem)
	}
	var startPeriodRule []interface{}
	for _, startPeriodItem := range startPeriod {
		startPeriodRule = append(startPeriodRule, startPeriodItem)
	}
	var endPeriodRule []interface{}
	for _, endPeriodItem := range endPeriod {
		endPeriodRule = append(endPeriodRule, endPeriodItem)
	}

	logs, sub, err := _SpankBank.contract.FilterLogs(opts, "StakeEvent", stakerRule, startPeriodRule, endPeriodRule)
	if err != nil {
		return nil, err
	}
	return &SpankBankStakeEventIterator{contract: _SpankBank.contract, event: "StakeEvent", logs: logs, sub: sub}, nil
}

// WatchStakeEvent is a free log subscription operation binding the contract event 0x9c13c846ec75aea1a0e03d6594d9f3383d1e1e1e6f63a8c8f90b6c86aa7b79c9.
//
// Solidity: e StakeEvent(staker indexed address, startPeriod indexed uint256, endPeriod indexed uint256, activityKey address, bootyBase address)
func (_SpankBank *SpankBankFilterer) WatchStakeEvent(opts *bind.WatchOpts, sink chan<- *SpankBankStakeEvent, staker []common.Address, startPeriod []*big.Int, endPeriod []*big.Int) (event.Subscription, error) {

	var stakerRule []interface{}
	for _, stakerItem := range staker {
		stakerRule = append(stakerRule, stakerItem)
	}
	var startPeriodRule []interface{}
	for _, startPeriodItem := range startPeriod {
		startPeriodRule = append(startPeriodRule, startPeriodItem)
	}
	var endPeriodRule []interface{}
	for _, endPeriodItem := range endPeriod {
		endPeriodRule = append(endPeriodRule, endPeriodItem)
	}

	logs, sub, err := _SpankBank.contract.WatchLogs(opts, "StakeEvent", stakerRule, startPeriodRule, endPeriodRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SpankBankStakeEvent)
				if err := _SpankBank.contract.UnpackLog(event, "StakeEvent", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// SpankBankUpdateActivityKeyEventIterator is returned from FilterUpdateActivityKeyEvent and is used to iterate over the raw logs and unpacked data for UpdateActivityKeyEvent events raised by the SpankBank contract.
type SpankBankUpdateActivityKeyEventIterator struct {
	Event *SpankBankUpdateActivityKeyEvent // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SpankBankUpdateActivityKeyEventIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SpankBankUpdateActivityKeyEvent)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SpankBankUpdateActivityKeyEvent)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SpankBankUpdateActivityKeyEventIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SpankBankUpdateActivityKeyEventIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SpankBankUpdateActivityKeyEvent represents a UpdateActivityKeyEvent event raised by the SpankBank contract.
type SpankBankUpdateActivityKeyEvent struct {
	Staker         common.Address
	NewActivityKey common.Address
	CurrentPeriod  *big.Int
	Raw            types.Log // Blockchain specific contextual infos
}

// FilterUpdateActivityKeyEvent is a free log retrieval operation binding the contract event 0xa6e8688bef48c01074b1df5fba9beee4b8da987ac92ff7fc4353c6e70258d7ff.
//
// Solidity: e UpdateActivityKeyEvent(staker indexed address, newActivityKey indexed address, currentPeriod indexed uint256)
func (_SpankBank *SpankBankFilterer) FilterUpdateActivityKeyEvent(opts *bind.FilterOpts, staker []common.Address, newActivityKey []common.Address, currentPeriod []*big.Int) (*SpankBankUpdateActivityKeyEventIterator, error) {

	var stakerRule []interface{}
	for _, stakerItem := range staker {
		stakerRule = append(stakerRule, stakerItem)
	}
	var newActivityKeyRule []interface{}
	for _, newActivityKeyItem := range newActivityKey {
		newActivityKeyRule = append(newActivityKeyRule, newActivityKeyItem)
	}
	var currentPeriodRule []interface{}
	for _, currentPeriodItem := range currentPeriod {
		currentPeriodRule = append(currentPeriodRule, currentPeriodItem)
	}

	logs, sub, err := _SpankBank.contract.FilterLogs(opts, "UpdateActivityKeyEvent", stakerRule, newActivityKeyRule, currentPeriodRule)
	if err != nil {
		return nil, err
	}
	return &SpankBankUpdateActivityKeyEventIterator{contract: _SpankBank.contract, event: "UpdateActivityKeyEvent", logs: logs, sub: sub}, nil
}

// WatchUpdateActivityKeyEvent is a free log subscription operation binding the contract event 0xa6e8688bef48c01074b1df5fba9beee4b8da987ac92ff7fc4353c6e70258d7ff.
//
// Solidity: e UpdateActivityKeyEvent(staker indexed address, newActivityKey indexed address, currentPeriod indexed uint256)
func (_SpankBank *SpankBankFilterer) WatchUpdateActivityKeyEvent(opts *bind.WatchOpts, sink chan<- *SpankBankUpdateActivityKeyEvent, staker []common.Address, newActivityKey []common.Address, currentPeriod []*big.Int) (event.Subscription, error) {

	var stakerRule []interface{}
	for _, stakerItem := range staker {
		stakerRule = append(stakerRule, stakerItem)
	}
	var newActivityKeyRule []interface{}
	for _, newActivityKeyItem := range newActivityKey {
		newActivityKeyRule = append(newActivityKeyRule, newActivityKeyItem)
	}
	var currentPeriodRule []interface{}
	for _, currentPeriodItem := range currentPeriod {
		currentPeriodRule = append(currentPeriodRule, currentPeriodItem)
	}

	logs, sub, err := _SpankBank.contract.WatchLogs(opts, "UpdateActivityKeyEvent", stakerRule, newActivityKeyRule, currentPeriodRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SpankBankUpdateActivityKeyEvent)
				if err := _SpankBank.contract.UnpackLog(event, "UpdateActivityKeyEvent", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// SpankBankUpdateBootyBaseEventIterator is returned from FilterUpdateBootyBaseEvent and is used to iterate over the raw logs and unpacked data for UpdateBootyBaseEvent events raised by the SpankBank contract.
type SpankBankUpdateBootyBaseEventIterator struct {
	Event *SpankBankUpdateBootyBaseEvent // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SpankBankUpdateBootyBaseEventIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SpankBankUpdateBootyBaseEvent)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SpankBankUpdateBootyBaseEvent)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SpankBankUpdateBootyBaseEventIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SpankBankUpdateBootyBaseEventIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SpankBankUpdateBootyBaseEvent represents a UpdateBootyBaseEvent event raised by the SpankBank contract.
type SpankBankUpdateBootyBaseEvent struct {
	Staker        common.Address
	NewBootyBase  common.Address
	CurrentPeriod *big.Int
	Raw           types.Log // Blockchain specific contextual infos
}

// FilterUpdateBootyBaseEvent is a free log retrieval operation binding the contract event 0x5adf14c9b8806eee46c946f8629fb2d05cfdb3ec6870004cc8145e8fa8dfc9e6.
//
// Solidity: e UpdateBootyBaseEvent(staker indexed address, newBootyBase indexed address, currentPeriod indexed uint256)
func (_SpankBank *SpankBankFilterer) FilterUpdateBootyBaseEvent(opts *bind.FilterOpts, staker []common.Address, newBootyBase []common.Address, currentPeriod []*big.Int) (*SpankBankUpdateBootyBaseEventIterator, error) {

	var stakerRule []interface{}
	for _, stakerItem := range staker {
		stakerRule = append(stakerRule, stakerItem)
	}
	var newBootyBaseRule []interface{}
	for _, newBootyBaseItem := range newBootyBase {
		newBootyBaseRule = append(newBootyBaseRule, newBootyBaseItem)
	}
	var currentPeriodRule []interface{}
	for _, currentPeriodItem := range currentPeriod {
		currentPeriodRule = append(currentPeriodRule, currentPeriodItem)
	}

	logs, sub, err := _SpankBank.contract.FilterLogs(opts, "UpdateBootyBaseEvent", stakerRule, newBootyBaseRule, currentPeriodRule)
	if err != nil {
		return nil, err
	}
	return &SpankBankUpdateBootyBaseEventIterator{contract: _SpankBank.contract, event: "UpdateBootyBaseEvent", logs: logs, sub: sub}, nil
}

// WatchUpdateBootyBaseEvent is a free log subscription operation binding the contract event 0x5adf14c9b8806eee46c946f8629fb2d05cfdb3ec6870004cc8145e8fa8dfc9e6.
//
// Solidity: e UpdateBootyBaseEvent(staker indexed address, newBootyBase indexed address, currentPeriod indexed uint256)
func (_SpankBank *SpankBankFilterer) WatchUpdateBootyBaseEvent(opts *bind.WatchOpts, sink chan<- *SpankBankUpdateBootyBaseEvent, staker []common.Address, newBootyBase []common.Address, currentPeriod []*big.Int) (event.Subscription, error) {

	var stakerRule []interface{}
	for _, stakerItem := range staker {
		stakerRule = append(stakerRule, stakerItem)
	}
	var newBootyBaseRule []interface{}
	for _, newBootyBaseItem := range newBootyBase {
		newBootyBaseRule = append(newBootyBaseRule, newBootyBaseItem)
	}
	var currentPeriodRule []interface{}
	for _, currentPeriodItem := range currentPeriod {
		currentPeriodRule = append(currentPeriodRule, currentPeriodItem)
	}

	logs, sub, err := _SpankBank.contract.WatchLogs(opts, "UpdateBootyBaseEvent", stakerRule, newBootyBaseRule, currentPeriodRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SpankBankUpdateBootyBaseEvent)
				if err := _SpankBank.contract.UnpackLog(event, "UpdateBootyBaseEvent", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// SpankBankVoteToUnwindEventIterator is returned from FilterVoteToUnwindEvent and is used to iterate over the raw logs and unpacked data for VoteToUnwindEvent events raised by the SpankBank contract.
type SpankBankVoteToUnwindEventIterator struct {
	Event *SpankBankVoteToUnwindEvent // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SpankBankVoteToUnwindEventIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SpankBankVoteToUnwindEvent)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SpankBankVoteToUnwindEvent)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SpankBankVoteToUnwindEventIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SpankBankVoteToUnwindEventIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SpankBankVoteToUnwindEvent represents a VoteToUnwindEvent event raised by the SpankBank contract.
type SpankBankVoteToUnwindEvent struct {
	Staker           common.Address
	SpankStaked      *big.Int
	Unwind           bool
	CurrentPeriod    *big.Int
	TotalSpankStaked *big.Int
	Raw              types.Log // Blockchain specific contextual infos
}

// FilterVoteToUnwindEvent is a free log retrieval operation binding the contract event 0x6181df612071041923f95401c4beba899f880201e8e81c6da20e1f574e0ce21f.
//
// Solidity: e VoteToUnwindEvent(staker indexed address, spankStaked indexed uint256, unwind indexed bool, currentPeriod uint256, totalSpankStaked uint256)
func (_SpankBank *SpankBankFilterer) FilterVoteToUnwindEvent(opts *bind.FilterOpts, staker []common.Address, spankStaked []*big.Int, unwind []bool) (*SpankBankVoteToUnwindEventIterator, error) {

	var stakerRule []interface{}
	for _, stakerItem := range staker {
		stakerRule = append(stakerRule, stakerItem)
	}
	var spankStakedRule []interface{}
	for _, spankStakedItem := range spankStaked {
		spankStakedRule = append(spankStakedRule, spankStakedItem)
	}
	var unwindRule []interface{}
	for _, unwindItem := range unwind {
		unwindRule = append(unwindRule, unwindItem)
	}

	logs, sub, err := _SpankBank.contract.FilterLogs(opts, "VoteToUnwindEvent", stakerRule, spankStakedRule, unwindRule)
	if err != nil {
		return nil, err
	}
	return &SpankBankVoteToUnwindEventIterator{contract: _SpankBank.contract, event: "VoteToUnwindEvent", logs: logs, sub: sub}, nil
}

// WatchVoteToUnwindEvent is a free log subscription operation binding the contract event 0x6181df612071041923f95401c4beba899f880201e8e81c6da20e1f574e0ce21f.
//
// Solidity: e VoteToUnwindEvent(staker indexed address, spankStaked indexed uint256, unwind indexed bool, currentPeriod uint256, totalSpankStaked uint256)
func (_SpankBank *SpankBankFilterer) WatchVoteToUnwindEvent(opts *bind.WatchOpts, sink chan<- *SpankBankVoteToUnwindEvent, staker []common.Address, spankStaked []*big.Int, unwind []bool) (event.Subscription, error) {

	var stakerRule []interface{}
	for _, stakerItem := range staker {
		stakerRule = append(stakerRule, stakerItem)
	}
	var spankStakedRule []interface{}
	for _, spankStakedItem := range spankStaked {
		spankStakedRule = append(spankStakedRule, spankStakedItem)
	}
	var unwindRule []interface{}
	for _, unwindItem := range unwind {
		unwindRule = append(unwindRule, unwindItem)
	}

	logs, sub, err := _SpankBank.contract.WatchLogs(opts, "VoteToUnwindEvent", stakerRule, spankStakedRule, unwindRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SpankBankVoteToUnwindEvent)
				if err := _SpankBank.contract.UnpackLog(event, "VoteToUnwindEvent", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// SpankBankWithdrawStakeEventIterator is returned from FilterWithdrawStakeEvent and is used to iterate over the raw logs and unpacked data for WithdrawStakeEvent events raised by the SpankBank contract.
type SpankBankWithdrawStakeEventIterator struct {
	Event *SpankBankWithdrawStakeEvent // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SpankBankWithdrawStakeEventIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SpankBankWithdrawStakeEvent)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SpankBankWithdrawStakeEvent)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SpankBankWithdrawStakeEventIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SpankBankWithdrawStakeEventIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SpankBankWithdrawStakeEvent represents a WithdrawStakeEvent event raised by the SpankBank contract.
type SpankBankWithdrawStakeEvent struct {
	Staker           common.Address
	TotalSpankStaked *big.Int
	CurrentPeriod    *big.Int
	Raw              types.Log // Blockchain specific contextual infos
}

// FilterWithdrawStakeEvent is a free log retrieval operation binding the contract event 0xf91cbf8dea09a94f0080cb927fb1d67eb5121d465abe58fadfd50165382961d8.
//
// Solidity: e WithdrawStakeEvent(staker indexed address, totalSpankStaked indexed uint256, currentPeriod indexed uint256)
func (_SpankBank *SpankBankFilterer) FilterWithdrawStakeEvent(opts *bind.FilterOpts, staker []common.Address, totalSpankStaked []*big.Int, currentPeriod []*big.Int) (*SpankBankWithdrawStakeEventIterator, error) {

	var stakerRule []interface{}
	for _, stakerItem := range staker {
		stakerRule = append(stakerRule, stakerItem)
	}
	var totalSpankStakedRule []interface{}
	for _, totalSpankStakedItem := range totalSpankStaked {
		totalSpankStakedRule = append(totalSpankStakedRule, totalSpankStakedItem)
	}
	var currentPeriodRule []interface{}
	for _, currentPeriodItem := range currentPeriod {
		currentPeriodRule = append(currentPeriodRule, currentPeriodItem)
	}

	logs, sub, err := _SpankBank.contract.FilterLogs(opts, "WithdrawStakeEvent", stakerRule, totalSpankStakedRule, currentPeriodRule)
	if err != nil {
		return nil, err
	}
	return &SpankBankWithdrawStakeEventIterator{contract: _SpankBank.contract, event: "WithdrawStakeEvent", logs: logs, sub: sub}, nil
}

// WatchWithdrawStakeEvent is a free log subscription operation binding the contract event 0xf91cbf8dea09a94f0080cb927fb1d67eb5121d465abe58fadfd50165382961d8.
//
// Solidity: e WithdrawStakeEvent(staker indexed address, totalSpankStaked indexed uint256, currentPeriod indexed uint256)
func (_SpankBank *SpankBankFilterer) WatchWithdrawStakeEvent(opts *bind.WatchOpts, sink chan<- *SpankBankWithdrawStakeEvent, staker []common.Address, totalSpankStaked []*big.Int, currentPeriod []*big.Int) (event.Subscription, error) {

	var stakerRule []interface{}
	for _, stakerItem := range staker {
		stakerRule = append(stakerRule, stakerItem)
	}
	var totalSpankStakedRule []interface{}
	for _, totalSpankStakedItem := range totalSpankStaked {
		totalSpankStakedRule = append(totalSpankStakedRule, totalSpankStakedItem)
	}
	var currentPeriodRule []interface{}
	for _, currentPeriodItem := range currentPeriod {
		currentPeriodRule = append(currentPeriodRule, currentPeriodItem)
	}

	logs, sub, err := _SpankBank.contract.WatchLogs(opts, "WithdrawStakeEvent", stakerRule, totalSpankStakedRule, currentPeriodRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SpankBankWithdrawStakeEvent)
				if err := _SpankBank.contract.UnpackLog(event, "WithdrawStakeEvent", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// StandardTokenABI is the input ABI used to generate the binding from.
const StandardTokenABI = "[{\"constant\":false,\"inputs\":[{\"name\":\"_spender\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"name\":\"success\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_from\",\"type\":\"address\"},{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"name\":\"success\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_owner\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"balance\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"name\":\"success\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_owner\",\"type\":\"address\"},{\"name\":\"_spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"name\":\"remaining\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"_from\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"_to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"_owner\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"_spender\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"}]"

// StandardTokenBin is the compiled bytecode used for deploying new contracts.
const StandardTokenBin = `0x608060405234801561001057600080fd5b506103b7806100206000396000f3006080604052600436106100775763ffffffff7c0100000000000000000000000000000000000000000000000000000000600035041663095ea7b3811461007c57806318160ddd146100b457806323b872dd146100db57806370a0823114610105578063a9059cbb14610126578063dd62ed3e1461014a575b600080fd5b34801561008857600080fd5b506100a0600160a060020a0360043516602435610171565b604080519115158252519081900360200190f35b3480156100c057600080fd5b506100c96101d7565b60408051918252519081900360200190f35b3480156100e757600080fd5b506100a0600160a060020a03600435811690602435166044356101dd565b34801561011157600080fd5b506100c9600160a060020a03600435166102bb565b34801561013257600080fd5b506100a0600160a060020a03600435166024356102d6565b34801561015657600080fd5b506100c9600160a060020a0360043581169060243516610360565b336000818152600260209081526040808320600160a060020a038716808552908352818420869055815186815291519394909390927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925928290030190a350600192915050565b60005481565b600160a060020a03831660009081526001602052604081205482118015906102285750600160a060020a03841660009081526002602090815260408083203384529091529020548211155b151561023357600080fd5b600160a060020a03808416600081815260016020908152604080832080548801905593881680835284832080548890039055600282528483203384528252918490208054879003905583518681529351929391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35060019392505050565b600160a060020a031660009081526001602052604090205490565b336000908152600160205260408120548211156102f257600080fd5b33600081815260016020908152604080832080548790039055600160a060020a03871680845292819020805487019055805186815290519293927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef929181900390910190a350600192915050565b600160a060020a039182166000908152600260209081526040808320939094168252919091522054905600a165627a7a72305820a9c52861eb76cac362cec3e65bb0798d237a7a05cc11e228b38e4d4dc62760b40029`

// DeployStandardToken deploys a new Ethereum contract, binding an instance of StandardToken to it.
func DeployStandardToken(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *StandardToken, error) {
	parsed, err := abi.JSON(strings.NewReader(StandardTokenABI))
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	address, tx, contract, err := bind.DeployContract(auth, parsed, common.FromHex(StandardTokenBin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &StandardToken{StandardTokenCaller: StandardTokenCaller{contract: contract}, StandardTokenTransactor: StandardTokenTransactor{contract: contract}, StandardTokenFilterer: StandardTokenFilterer{contract: contract}}, nil
}

// StandardToken is an auto generated Go binding around an Ethereum contract.
type StandardToken struct {
	StandardTokenCaller     // Read-only binding to the contract
	StandardTokenTransactor // Write-only binding to the contract
	StandardTokenFilterer   // Log filterer for contract events
}

// StandardTokenCaller is an auto generated read-only Go binding around an Ethereum contract.
type StandardTokenCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StandardTokenTransactor is an auto generated write-only Go binding around an Ethereum contract.
type StandardTokenTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StandardTokenFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type StandardTokenFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StandardTokenSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type StandardTokenSession struct {
	Contract     *StandardToken    // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// StandardTokenCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type StandardTokenCallerSession struct {
	Contract *StandardTokenCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts        // Call options to use throughout this session
}

// StandardTokenTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type StandardTokenTransactorSession struct {
	Contract     *StandardTokenTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts        // Transaction auth options to use throughout this session
}

// StandardTokenRaw is an auto generated low-level Go binding around an Ethereum contract.
type StandardTokenRaw struct {
	Contract *StandardToken // Generic contract binding to access the raw methods on
}

// StandardTokenCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type StandardTokenCallerRaw struct {
	Contract *StandardTokenCaller // Generic read-only contract binding to access the raw methods on
}

// StandardTokenTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type StandardTokenTransactorRaw struct {
	Contract *StandardTokenTransactor // Generic write-only contract binding to access the raw methods on
}

// NewStandardToken creates a new instance of StandardToken, bound to a specific deployed contract.
func NewStandardToken(address common.Address, backend bind.ContractBackend) (*StandardToken, error) {
	contract, err := bindStandardToken(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &StandardToken{StandardTokenCaller: StandardTokenCaller{contract: contract}, StandardTokenTransactor: StandardTokenTransactor{contract: contract}, StandardTokenFilterer: StandardTokenFilterer{contract: contract}}, nil
}

// NewStandardTokenCaller creates a new read-only instance of StandardToken, bound to a specific deployed contract.
func NewStandardTokenCaller(address common.Address, caller bind.ContractCaller) (*StandardTokenCaller, error) {
	contract, err := bindStandardToken(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &StandardTokenCaller{contract: contract}, nil
}

// NewStandardTokenTransactor creates a new write-only instance of StandardToken, bound to a specific deployed contract.
func NewStandardTokenTransactor(address common.Address, transactor bind.ContractTransactor) (*StandardTokenTransactor, error) {
	contract, err := bindStandardToken(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &StandardTokenTransactor{contract: contract}, nil
}

// NewStandardTokenFilterer creates a new log filterer instance of StandardToken, bound to a specific deployed contract.
func NewStandardTokenFilterer(address common.Address, filterer bind.ContractFilterer) (*StandardTokenFilterer, error) {
	contract, err := bindStandardToken(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &StandardTokenFilterer{contract: contract}, nil
}

// bindStandardToken binds a generic wrapper to an already deployed contract.
func bindStandardToken(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(StandardTokenABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_StandardToken *StandardTokenRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _StandardToken.Contract.StandardTokenCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_StandardToken *StandardTokenRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _StandardToken.Contract.StandardTokenTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_StandardToken *StandardTokenRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _StandardToken.Contract.StandardTokenTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_StandardToken *StandardTokenCallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _StandardToken.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_StandardToken *StandardTokenTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _StandardToken.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_StandardToken *StandardTokenTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _StandardToken.Contract.contract.Transact(opts, method, params...)
}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(_owner address, _spender address) constant returns(remaining uint256)
func (_StandardToken *StandardTokenCaller) Allowance(opts *bind.CallOpts, _owner common.Address, _spender common.Address) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _StandardToken.contract.Call(opts, out, "allowance", _owner, _spender)
	return *ret0, err
}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(_owner address, _spender address) constant returns(remaining uint256)
func (_StandardToken *StandardTokenSession) Allowance(_owner common.Address, _spender common.Address) (*big.Int, error) {
	return _StandardToken.Contract.Allowance(&_StandardToken.CallOpts, _owner, _spender)
}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(_owner address, _spender address) constant returns(remaining uint256)
func (_StandardToken *StandardTokenCallerSession) Allowance(_owner common.Address, _spender common.Address) (*big.Int, error) {
	return _StandardToken.Contract.Allowance(&_StandardToken.CallOpts, _owner, _spender)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(_owner address) constant returns(balance uint256)
func (_StandardToken *StandardTokenCaller) BalanceOf(opts *bind.CallOpts, _owner common.Address) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _StandardToken.contract.Call(opts, out, "balanceOf", _owner)
	return *ret0, err
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(_owner address) constant returns(balance uint256)
func (_StandardToken *StandardTokenSession) BalanceOf(_owner common.Address) (*big.Int, error) {
	return _StandardToken.Contract.BalanceOf(&_StandardToken.CallOpts, _owner)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(_owner address) constant returns(balance uint256)
func (_StandardToken *StandardTokenCallerSession) BalanceOf(_owner common.Address) (*big.Int, error) {
	return _StandardToken.Contract.BalanceOf(&_StandardToken.CallOpts, _owner)
}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() constant returns(uint256)
func (_StandardToken *StandardTokenCaller) TotalSupply(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _StandardToken.contract.Call(opts, out, "totalSupply")
	return *ret0, err
}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() constant returns(uint256)
func (_StandardToken *StandardTokenSession) TotalSupply() (*big.Int, error) {
	return _StandardToken.Contract.TotalSupply(&_StandardToken.CallOpts)
}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() constant returns(uint256)
func (_StandardToken *StandardTokenCallerSession) TotalSupply() (*big.Int, error) {
	return _StandardToken.Contract.TotalSupply(&_StandardToken.CallOpts)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(_spender address, _value uint256) returns(success bool)
func (_StandardToken *StandardTokenTransactor) Approve(opts *bind.TransactOpts, _spender common.Address, _value *big.Int) (*types.Transaction, error) {
	return _StandardToken.contract.Transact(opts, "approve", _spender, _value)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(_spender address, _value uint256) returns(success bool)
func (_StandardToken *StandardTokenSession) Approve(_spender common.Address, _value *big.Int) (*types.Transaction, error) {
	return _StandardToken.Contract.Approve(&_StandardToken.TransactOpts, _spender, _value)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(_spender address, _value uint256) returns(success bool)
func (_StandardToken *StandardTokenTransactorSession) Approve(_spender common.Address, _value *big.Int) (*types.Transaction, error) {
	return _StandardToken.Contract.Approve(&_StandardToken.TransactOpts, _spender, _value)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(_to address, _value uint256) returns(success bool)
func (_StandardToken *StandardTokenTransactor) Transfer(opts *bind.TransactOpts, _to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _StandardToken.contract.Transact(opts, "transfer", _to, _value)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(_to address, _value uint256) returns(success bool)
func (_StandardToken *StandardTokenSession) Transfer(_to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _StandardToken.Contract.Transfer(&_StandardToken.TransactOpts, _to, _value)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(_to address, _value uint256) returns(success bool)
func (_StandardToken *StandardTokenTransactorSession) Transfer(_to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _StandardToken.Contract.Transfer(&_StandardToken.TransactOpts, _to, _value)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(_from address, _to address, _value uint256) returns(success bool)
func (_StandardToken *StandardTokenTransactor) TransferFrom(opts *bind.TransactOpts, _from common.Address, _to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _StandardToken.contract.Transact(opts, "transferFrom", _from, _to, _value)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(_from address, _to address, _value uint256) returns(success bool)
func (_StandardToken *StandardTokenSession) TransferFrom(_from common.Address, _to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _StandardToken.Contract.TransferFrom(&_StandardToken.TransactOpts, _from, _to, _value)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(_from address, _to address, _value uint256) returns(success bool)
func (_StandardToken *StandardTokenTransactorSession) TransferFrom(_from common.Address, _to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _StandardToken.Contract.TransferFrom(&_StandardToken.TransactOpts, _from, _to, _value)
}

// StandardTokenApprovalIterator is returned from FilterApproval and is used to iterate over the raw logs and unpacked data for Approval events raised by the StandardToken contract.
type StandardTokenApprovalIterator struct {
	Event *StandardTokenApproval // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *StandardTokenApprovalIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StandardTokenApproval)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(StandardTokenApproval)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *StandardTokenApprovalIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StandardTokenApprovalIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StandardTokenApproval represents a Approval event raised by the StandardToken contract.
type StandardTokenApproval struct {
	Owner   common.Address
	Spender common.Address
	Value   *big.Int
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterApproval is a free log retrieval operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: e Approval(_owner indexed address, _spender indexed address, _value uint256)
func (_StandardToken *StandardTokenFilterer) FilterApproval(opts *bind.FilterOpts, _owner []common.Address, _spender []common.Address) (*StandardTokenApprovalIterator, error) {

	var _ownerRule []interface{}
	for _, _ownerItem := range _owner {
		_ownerRule = append(_ownerRule, _ownerItem)
	}
	var _spenderRule []interface{}
	for _, _spenderItem := range _spender {
		_spenderRule = append(_spenderRule, _spenderItem)
	}

	logs, sub, err := _StandardToken.contract.FilterLogs(opts, "Approval", _ownerRule, _spenderRule)
	if err != nil {
		return nil, err
	}
	return &StandardTokenApprovalIterator{contract: _StandardToken.contract, event: "Approval", logs: logs, sub: sub}, nil
}

// WatchApproval is a free log subscription operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: e Approval(_owner indexed address, _spender indexed address, _value uint256)
func (_StandardToken *StandardTokenFilterer) WatchApproval(opts *bind.WatchOpts, sink chan<- *StandardTokenApproval, _owner []common.Address, _spender []common.Address) (event.Subscription, error) {

	var _ownerRule []interface{}
	for _, _ownerItem := range _owner {
		_ownerRule = append(_ownerRule, _ownerItem)
	}
	var _spenderRule []interface{}
	for _, _spenderItem := range _spender {
		_spenderRule = append(_spenderRule, _spenderItem)
	}

	logs, sub, err := _StandardToken.contract.WatchLogs(opts, "Approval", _ownerRule, _spenderRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StandardTokenApproval)
				if err := _StandardToken.contract.UnpackLog(event, "Approval", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// StandardTokenTransferIterator is returned from FilterTransfer and is used to iterate over the raw logs and unpacked data for Transfer events raised by the StandardToken contract.
type StandardTokenTransferIterator struct {
	Event *StandardTokenTransfer // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *StandardTokenTransferIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StandardTokenTransfer)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(StandardTokenTransfer)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *StandardTokenTransferIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StandardTokenTransferIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StandardTokenTransfer represents a Transfer event raised by the StandardToken contract.
type StandardTokenTransfer struct {
	From  common.Address
	To    common.Address
	Value *big.Int
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterTransfer is a free log retrieval operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: e Transfer(_from indexed address, _to indexed address, _value uint256)
func (_StandardToken *StandardTokenFilterer) FilterTransfer(opts *bind.FilterOpts, _from []common.Address, _to []common.Address) (*StandardTokenTransferIterator, error) {

	var _fromRule []interface{}
	for _, _fromItem := range _from {
		_fromRule = append(_fromRule, _fromItem)
	}
	var _toRule []interface{}
	for _, _toItem := range _to {
		_toRule = append(_toRule, _toItem)
	}

	logs, sub, err := _StandardToken.contract.FilterLogs(opts, "Transfer", _fromRule, _toRule)
	if err != nil {
		return nil, err
	}
	return &StandardTokenTransferIterator{contract: _StandardToken.contract, event: "Transfer", logs: logs, sub: sub}, nil
}

// WatchTransfer is a free log subscription operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: e Transfer(_from indexed address, _to indexed address, _value uint256)
func (_StandardToken *StandardTokenFilterer) WatchTransfer(opts *bind.WatchOpts, sink chan<- *StandardTokenTransfer, _from []common.Address, _to []common.Address) (event.Subscription, error) {

	var _fromRule []interface{}
	for _, _fromItem := range _from {
		_fromRule = append(_fromRule, _fromItem)
	}
	var _toRule []interface{}
	for _, _toItem := range _to {
		_toRule = append(_toRule, _toItem)
	}

	logs, sub, err := _StandardToken.contract.WatchLogs(opts, "Transfer", _fromRule, _toRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StandardTokenTransfer)
				if err := _StandardToken.contract.UnpackLog(event, "Transfer", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// TokenABI is the input ABI used to generate the binding from.
const TokenABI = "[{\"constant\":false,\"inputs\":[{\"name\":\"_spender\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"name\":\"success\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_from\",\"type\":\"address\"},{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"name\":\"success\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_owner\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"balance\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"name\":\"success\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_owner\",\"type\":\"address\"},{\"name\":\"_spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"name\":\"remaining\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"_from\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"_to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"_owner\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"_spender\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"}]"

// TokenBin is the compiled bytecode used for deploying new contracts.
const TokenBin = `0x`

// DeployToken deploys a new Ethereum contract, binding an instance of Token to it.
func DeployToken(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *Token, error) {
	parsed, err := abi.JSON(strings.NewReader(TokenABI))
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	address, tx, contract, err := bind.DeployContract(auth, parsed, common.FromHex(TokenBin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &Token{TokenCaller: TokenCaller{contract: contract}, TokenTransactor: TokenTransactor{contract: contract}, TokenFilterer: TokenFilterer{contract: contract}}, nil
}

// Token is an auto generated Go binding around an Ethereum contract.
type Token struct {
	TokenCaller     // Read-only binding to the contract
	TokenTransactor // Write-only binding to the contract
	TokenFilterer   // Log filterer for contract events
}

// TokenCaller is an auto generated read-only Go binding around an Ethereum contract.
type TokenCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// TokenTransactor is an auto generated write-only Go binding around an Ethereum contract.
type TokenTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// TokenFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type TokenFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// TokenSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type TokenSession struct {
	Contract     *Token            // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// TokenCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type TokenCallerSession struct {
	Contract *TokenCaller  // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts // Call options to use throughout this session
}

// TokenTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type TokenTransactorSession struct {
	Contract     *TokenTransactor  // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// TokenRaw is an auto generated low-level Go binding around an Ethereum contract.
type TokenRaw struct {
	Contract *Token // Generic contract binding to access the raw methods on
}

// TokenCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type TokenCallerRaw struct {
	Contract *TokenCaller // Generic read-only contract binding to access the raw methods on
}

// TokenTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type TokenTransactorRaw struct {
	Contract *TokenTransactor // Generic write-only contract binding to access the raw methods on
}

// NewToken creates a new instance of Token, bound to a specific deployed contract.
func NewToken(address common.Address, backend bind.ContractBackend) (*Token, error) {
	contract, err := bindToken(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Token{TokenCaller: TokenCaller{contract: contract}, TokenTransactor: TokenTransactor{contract: contract}, TokenFilterer: TokenFilterer{contract: contract}}, nil
}

// NewTokenCaller creates a new read-only instance of Token, bound to a specific deployed contract.
func NewTokenCaller(address common.Address, caller bind.ContractCaller) (*TokenCaller, error) {
	contract, err := bindToken(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &TokenCaller{contract: contract}, nil
}

// NewTokenTransactor creates a new write-only instance of Token, bound to a specific deployed contract.
func NewTokenTransactor(address common.Address, transactor bind.ContractTransactor) (*TokenTransactor, error) {
	contract, err := bindToken(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &TokenTransactor{contract: contract}, nil
}

// NewTokenFilterer creates a new log filterer instance of Token, bound to a specific deployed contract.
func NewTokenFilterer(address common.Address, filterer bind.ContractFilterer) (*TokenFilterer, error) {
	contract, err := bindToken(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &TokenFilterer{contract: contract}, nil
}

// bindToken binds a generic wrapper to an already deployed contract.
func bindToken(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(TokenABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Token *TokenRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _Token.Contract.TokenCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Token *TokenRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Token.Contract.TokenTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Token *TokenRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Token.Contract.TokenTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Token *TokenCallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _Token.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Token *TokenTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Token.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Token *TokenTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Token.Contract.contract.Transact(opts, method, params...)
}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(_owner address, _spender address) constant returns(remaining uint256)
func (_Token *TokenCaller) Allowance(opts *bind.CallOpts, _owner common.Address, _spender common.Address) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _Token.contract.Call(opts, out, "allowance", _owner, _spender)
	return *ret0, err
}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(_owner address, _spender address) constant returns(remaining uint256)
func (_Token *TokenSession) Allowance(_owner common.Address, _spender common.Address) (*big.Int, error) {
	return _Token.Contract.Allowance(&_Token.CallOpts, _owner, _spender)
}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(_owner address, _spender address) constant returns(remaining uint256)
func (_Token *TokenCallerSession) Allowance(_owner common.Address, _spender common.Address) (*big.Int, error) {
	return _Token.Contract.Allowance(&_Token.CallOpts, _owner, _spender)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(_owner address) constant returns(balance uint256)
func (_Token *TokenCaller) BalanceOf(opts *bind.CallOpts, _owner common.Address) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _Token.contract.Call(opts, out, "balanceOf", _owner)
	return *ret0, err
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(_owner address) constant returns(balance uint256)
func (_Token *TokenSession) BalanceOf(_owner common.Address) (*big.Int, error) {
	return _Token.Contract.BalanceOf(&_Token.CallOpts, _owner)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(_owner address) constant returns(balance uint256)
func (_Token *TokenCallerSession) BalanceOf(_owner common.Address) (*big.Int, error) {
	return _Token.Contract.BalanceOf(&_Token.CallOpts, _owner)
}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() constant returns(uint256)
func (_Token *TokenCaller) TotalSupply(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _Token.contract.Call(opts, out, "totalSupply")
	return *ret0, err
}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() constant returns(uint256)
func (_Token *TokenSession) TotalSupply() (*big.Int, error) {
	return _Token.Contract.TotalSupply(&_Token.CallOpts)
}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() constant returns(uint256)
func (_Token *TokenCallerSession) TotalSupply() (*big.Int, error) {
	return _Token.Contract.TotalSupply(&_Token.CallOpts)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(_spender address, _value uint256) returns(success bool)
func (_Token *TokenTransactor) Approve(opts *bind.TransactOpts, _spender common.Address, _value *big.Int) (*types.Transaction, error) {
	return _Token.contract.Transact(opts, "approve", _spender, _value)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(_spender address, _value uint256) returns(success bool)
func (_Token *TokenSession) Approve(_spender common.Address, _value *big.Int) (*types.Transaction, error) {
	return _Token.Contract.Approve(&_Token.TransactOpts, _spender, _value)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(_spender address, _value uint256) returns(success bool)
func (_Token *TokenTransactorSession) Approve(_spender common.Address, _value *big.Int) (*types.Transaction, error) {
	return _Token.Contract.Approve(&_Token.TransactOpts, _spender, _value)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(_to address, _value uint256) returns(success bool)
func (_Token *TokenTransactor) Transfer(opts *bind.TransactOpts, _to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _Token.contract.Transact(opts, "transfer", _to, _value)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(_to address, _value uint256) returns(success bool)
func (_Token *TokenSession) Transfer(_to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _Token.Contract.Transfer(&_Token.TransactOpts, _to, _value)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(_to address, _value uint256) returns(success bool)
func (_Token *TokenTransactorSession) Transfer(_to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _Token.Contract.Transfer(&_Token.TransactOpts, _to, _value)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(_from address, _to address, _value uint256) returns(success bool)
func (_Token *TokenTransactor) TransferFrom(opts *bind.TransactOpts, _from common.Address, _to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _Token.contract.Transact(opts, "transferFrom", _from, _to, _value)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(_from address, _to address, _value uint256) returns(success bool)
func (_Token *TokenSession) TransferFrom(_from common.Address, _to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _Token.Contract.TransferFrom(&_Token.TransactOpts, _from, _to, _value)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(_from address, _to address, _value uint256) returns(success bool)
func (_Token *TokenTransactorSession) TransferFrom(_from common.Address, _to common.Address, _value *big.Int) (*types.Transaction, error) {
	return _Token.Contract.TransferFrom(&_Token.TransactOpts, _from, _to, _value)
}

// TokenApprovalIterator is returned from FilterApproval and is used to iterate over the raw logs and unpacked data for Approval events raised by the Token contract.
type TokenApprovalIterator struct {
	Event *TokenApproval // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *TokenApprovalIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(TokenApproval)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(TokenApproval)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *TokenApprovalIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *TokenApprovalIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// TokenApproval represents a Approval event raised by the Token contract.
type TokenApproval struct {
	Owner   common.Address
	Spender common.Address
	Value   *big.Int
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterApproval is a free log retrieval operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: e Approval(_owner indexed address, _spender indexed address, _value uint256)
func (_Token *TokenFilterer) FilterApproval(opts *bind.FilterOpts, _owner []common.Address, _spender []common.Address) (*TokenApprovalIterator, error) {

	var _ownerRule []interface{}
	for _, _ownerItem := range _owner {
		_ownerRule = append(_ownerRule, _ownerItem)
	}
	var _spenderRule []interface{}
	for _, _spenderItem := range _spender {
		_spenderRule = append(_spenderRule, _spenderItem)
	}

	logs, sub, err := _Token.contract.FilterLogs(opts, "Approval", _ownerRule, _spenderRule)
	if err != nil {
		return nil, err
	}
	return &TokenApprovalIterator{contract: _Token.contract, event: "Approval", logs: logs, sub: sub}, nil
}

// WatchApproval is a free log subscription operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: e Approval(_owner indexed address, _spender indexed address, _value uint256)
func (_Token *TokenFilterer) WatchApproval(opts *bind.WatchOpts, sink chan<- *TokenApproval, _owner []common.Address, _spender []common.Address) (event.Subscription, error) {

	var _ownerRule []interface{}
	for _, _ownerItem := range _owner {
		_ownerRule = append(_ownerRule, _ownerItem)
	}
	var _spenderRule []interface{}
	for _, _spenderItem := range _spender {
		_spenderRule = append(_spenderRule, _spenderItem)
	}

	logs, sub, err := _Token.contract.WatchLogs(opts, "Approval", _ownerRule, _spenderRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(TokenApproval)
				if err := _Token.contract.UnpackLog(event, "Approval", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// TokenTransferIterator is returned from FilterTransfer and is used to iterate over the raw logs and unpacked data for Transfer events raised by the Token contract.
type TokenTransferIterator struct {
	Event *TokenTransfer // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *TokenTransferIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(TokenTransfer)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(TokenTransfer)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *TokenTransferIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *TokenTransferIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// TokenTransfer represents a Transfer event raised by the Token contract.
type TokenTransfer struct {
	From  common.Address
	To    common.Address
	Value *big.Int
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterTransfer is a free log retrieval operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: e Transfer(_from indexed address, _to indexed address, _value uint256)
func (_Token *TokenFilterer) FilterTransfer(opts *bind.FilterOpts, _from []common.Address, _to []common.Address) (*TokenTransferIterator, error) {

	var _fromRule []interface{}
	for _, _fromItem := range _from {
		_fromRule = append(_fromRule, _fromItem)
	}
	var _toRule []interface{}
	for _, _toItem := range _to {
		_toRule = append(_toRule, _toItem)
	}

	logs, sub, err := _Token.contract.FilterLogs(opts, "Transfer", _fromRule, _toRule)
	if err != nil {
		return nil, err
	}
	return &TokenTransferIterator{contract: _Token.contract, event: "Transfer", logs: logs, sub: sub}, nil
}

// WatchTransfer is a free log subscription operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: e Transfer(_from indexed address, _to indexed address, _value uint256)
func (_Token *TokenFilterer) WatchTransfer(opts *bind.WatchOpts, sink chan<- *TokenTransfer, _from []common.Address, _to []common.Address) (event.Subscription, error) {

	var _fromRule []interface{}
	for _, _fromItem := range _from {
		_fromRule = append(_fromRule, _fromItem)
	}
	var _toRule []interface{}
	for _, _toItem := range _to {
		_toRule = append(_toRule, _toItem)
	}

	logs, sub, err := _Token.contract.WatchLogs(opts, "Transfer", _fromRule, _toRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(TokenTransfer)
				if err := _Token.contract.UnpackLog(event, "Transfer", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

