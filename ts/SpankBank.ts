/* GENERATED BY TYPECHAIN VER. 0.2.3 */
/* tslint:disable */

import { BigNumber } from "bignumber.js";
import {
  TypeChainContract,
  promisify,
  ITxParams,
  IPayableTxParams,
  DeferredTransactionWrapper,
  DeferredEventWrapper
} from "./typechain-runtime";

export class SpankBank extends TypeChainContract {
  public readonly rawWeb3Contract: any;

  public constructor(web3: any, address: string | BigNumber) {
    const abi = [
      {
        constant: true,
        inputs: [],
        name: "currentPeriod",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "bootyToken",
        outputs: [{ name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "maxPeriods",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "unwind",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [{ name: "", type: "address" }],
        name: "stakers",
        outputs: [
          { name: "spankStaked", type: "uint256" },
          { name: "startingPeriod", type: "uint256" },
          { name: "endingPeriod", type: "uint256" },
          { name: "activityKey", type: "address" },
          { name: "bootyBase", type: "address" }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "spankToken",
        outputs: [{ name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [{ name: "", type: "address" }],
        name: "activityKeys",
        outputs: [{ name: "stakerAddress", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "totalSpankStaked",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "periodLength",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "unwindPeriod",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "unwindVotes",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [{ name: "", type: "uint256" }],
        name: "periods",
        outputs: [
          { name: "bootyFees", type: "uint256" },
          { name: "totalSpankPoints", type: "uint256" },
          { name: "bootyMinted", type: "uint256" },
          { name: "mintingComplete", type: "bool" },
          { name: "startTime", type: "uint256" },
          { name: "endTime", type: "uint256" }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          { name: "_periodLength", type: "uint256" },
          { name: "_maxPeriods", type: "uint256" },
          { name: "spankAddress", type: "address" },
          { name: "initialBootySupply", type: "uint256" }
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: "staker", type: "address" },
          { indexed: true, name: "startPeriod", type: "uint256" },
          { indexed: true, name: "endPeriod", type: "uint256" },
          { indexed: false, name: "activityKey", type: "address" },
          { indexed: false, name: "bootyBase", type: "address" }
        ],
        name: "StakeEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: "sender", type: "address" },
          { indexed: true, name: "bootyAmount", type: "uint256" },
          { indexed: true, name: "currentBootyFees", type: "uint256" }
        ],
        name: "SendFeesEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: "targetBootySupply", type: "uint256" },
          { indexed: true, name: "totalBootySupply", type: "uint256" },
          { indexed: true, name: "currentPeriod", type: "uint256" }
        ],
        name: "MintBootyEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: "staker", type: "address" },
          { indexed: true, name: "updatedEndingPeriod", type: "uint256" },
          { indexed: true, name: "currentPeriod", type: "uint256" }
        ],
        name: "CheckInEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: "staker", type: "address" },
          { indexed: true, name: "period", type: "uint256" },
          { indexed: true, name: "bootyOwed", type: "uint256" },
          { indexed: false, name: "stakerSpankPoints", type: "uint256" }
        ],
        name: "ClaimBootyEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: "staker", type: "address" },
          { indexed: true, name: "totalSpankStaked", type: "uint256" },
          { indexed: true, name: "currentPeriod", type: "uint256" }
        ],
        name: "WithdrawStakeEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: "staker", type: "address" },
          { indexed: true, name: "newAddress", type: "address" },
          { indexed: true, name: "spankAmount", type: "uint256" },
          { indexed: false, name: "currentPeriod", type: "uint256" },
          { indexed: false, name: "startingPeriod", type: "uint256" },
          { indexed: false, name: "endingPeriod", type: "uint256" },
          { indexed: false, name: "activityKey", type: "address" },
          { indexed: false, name: "bootyBase", type: "address" }
        ],
        name: "SplitStakeEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: "staker", type: "address" },
          { indexed: true, name: "spankStaked", type: "uint256" },
          { indexed: true, name: "unwind", type: "bool" },
          { indexed: false, name: "currentPeriod", type: "uint256" },
          { indexed: false, name: "totalSpankStaked", type: "uint256" }
        ],
        name: "VoteToUnwindEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: "staker", type: "address" },
          { indexed: true, name: "newActivityKey", type: "address" },
          { indexed: true, name: "currentPeriod", type: "uint256" }
        ],
        name: "UpdateActivityKeyEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: "staker", type: "address" },
          { indexed: true, name: "newBootyBase", type: "address" },
          { indexed: true, name: "currentPeriod", type: "uint256" }
        ],
        name: "UpdateBootyBaseEvent",
        type: "event"
      },
      {
        constant: false,
        inputs: [
          { name: "spankAmount", type: "uint256" },
          { name: "stakePeriods", type: "uint256" },
          { name: "activityKey", type: "address" },
          { name: "bootyBase", type: "address" }
        ],
        name: "stake",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: true,
        inputs: [
          { name: "stakerAddress", type: "address" },
          { name: "period", type: "uint256" }
        ],
        name: "getSpankPoints",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [
          { name: "stakerAddress", type: "address" },
          { name: "period", type: "uint256" }
        ],
        name: "getDidClaimBooty",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: false,
        inputs: [{ name: "bootyAmount", type: "uint256" }],
        name: "sendFees",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [],
        name: "mintBooty",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [],
        name: "updatePeriod",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [{ name: "updatedEndingPeriod", type: "uint256" }],
        name: "checkIn",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [{ name: "_period", type: "uint256" }],
        name: "claimBooty",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [],
        name: "withdrawStake",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          { name: "newAddress", type: "address" },
          { name: "newActivityKey", type: "address" },
          { name: "newBootyBase", type: "address" },
          { name: "spankAmount", type: "uint256" }
        ],
        name: "splitStake",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [],
        name: "voteToUnwind",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [{ name: "newActivityKey", type: "address" }],
        name: "updateActivityKey",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [{ name: "newBootyBase", type: "address" }],
        name: "updateBootyBase",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      }
    ];
    super(web3, address, abi);
  }

  static async createAndValidate(
    web3: any,
    address: string | BigNumber
  ): Promise<SpankBank> {
    const contract = new SpankBank(web3, address);
    const code = await promisify(web3.eth.getCode, [address]);

    // in case of missing smartcontract, code can be equal to "0x0" or "0x" depending on exact web3 implementation
    // to cover all these cases we just check against the source code length — there won't be any meaningful EVM program in less then 3 chars
    if (code.length < 4) {
      throw new Error(`Contract at ${address} doesn't exist!`);
    }
    return contract;
  }

  public get currentPeriod(): Promise<BigNumber> {
    return promisify(this.rawWeb3Contract.currentPeriod, []);
  }
  public get bootyToken(): Promise<string> {
    return promisify(this.rawWeb3Contract.bootyToken, []);
  }
  public get maxPeriods(): Promise<BigNumber> {
    return promisify(this.rawWeb3Contract.maxPeriods, []);
  }
  public get unwind(): Promise<boolean> {
    return promisify(this.rawWeb3Contract.unwind, []);
  }
  public get spankToken(): Promise<string> {
    return promisify(this.rawWeb3Contract.spankToken, []);
  }
  public get totalSpankStaked(): Promise<BigNumber> {
    return promisify(this.rawWeb3Contract.totalSpankStaked, []);
  }
  public get periodLength(): Promise<BigNumber> {
    return promisify(this.rawWeb3Contract.periodLength, []);
  }
  public get unwindPeriod(): Promise<BigNumber> {
    return promisify(this.rawWeb3Contract.unwindPeriod, []);
  }
  public get unwindVotes(): Promise<BigNumber> {
    return promisify(this.rawWeb3Contract.unwindVotes, []);
  }
  public stakers(
    arg0: BigNumber | string
  ): Promise<[BigNumber, BigNumber, BigNumber, string, string]> {
    return promisify(this.rawWeb3Contract.stakers, [arg0.toString()]);
  }
  public activityKeys(arg0: BigNumber | string): Promise<string> {
    return promisify(this.rawWeb3Contract.activityKeys, [arg0.toString()]);
  }
  public periods(
    arg0: BigNumber | number
  ): Promise<[BigNumber, BigNumber, BigNumber, boolean, BigNumber, BigNumber]> {
    return promisify(this.rawWeb3Contract.periods, [arg0.toString()]);
  }
  public getSpankPoints(
    stakerAddress: BigNumber | string,
    period: BigNumber | number
  ): Promise<BigNumber> {
    return promisify(this.rawWeb3Contract.getSpankPoints, [
      stakerAddress.toString(),
      period.toString()
    ]);
  }
  public getDidClaimBooty(
    stakerAddress: BigNumber | string,
    period: BigNumber | number
  ): Promise<boolean> {
    return promisify(this.rawWeb3Contract.getDidClaimBooty, [
      stakerAddress.toString(),
      period.toString()
    ]);
  }

  public stakeTx(
    spankAmount: BigNumber | number,
    stakePeriods: BigNumber | number,
    activityKey: BigNumber | string,
    bootyBase: BigNumber | string
  ): DeferredTransactionWrapper<ITxParams> {
    return new DeferredTransactionWrapper<ITxParams>(this, "stake", [
      spankAmount.toString(),
      stakePeriods.toString(),
      activityKey.toString(),
      bootyBase.toString()
    ]);
  }
  public sendFeesTx(
    bootyAmount: BigNumber | number
  ): DeferredTransactionWrapper<ITxParams> {
    return new DeferredTransactionWrapper<ITxParams>(this, "sendFees", [
      bootyAmount.toString()
    ]);
  }
  public mintBootyTx(): DeferredTransactionWrapper<ITxParams> {
    return new DeferredTransactionWrapper<ITxParams>(this, "mintBooty", []);
  }
  public updatePeriodTx(): DeferredTransactionWrapper<ITxParams> {
    return new DeferredTransactionWrapper<ITxParams>(this, "updatePeriod", []);
  }
  public checkInTx(
    updatedEndingPeriod: BigNumber | number
  ): DeferredTransactionWrapper<ITxParams> {
    return new DeferredTransactionWrapper<ITxParams>(this, "checkIn", [
      updatedEndingPeriod.toString()
    ]);
  }
  public claimBootyTx(
    _period: BigNumber | number
  ): DeferredTransactionWrapper<ITxParams> {
    return new DeferredTransactionWrapper<ITxParams>(this, "claimBooty", [
      _period.toString()
    ]);
  }
  public withdrawStakeTx(): DeferredTransactionWrapper<ITxParams> {
    return new DeferredTransactionWrapper<ITxParams>(this, "withdrawStake", []);
  }
  public splitStakeTx(
    newAddress: BigNumber | string,
    newActivityKey: BigNumber | string,
    newBootyBase: BigNumber | string,
    spankAmount: BigNumber | number
  ): DeferredTransactionWrapper<ITxParams> {
    return new DeferredTransactionWrapper<ITxParams>(this, "splitStake", [
      newAddress.toString(),
      newActivityKey.toString(),
      newBootyBase.toString(),
      spankAmount.toString()
    ]);
  }
  public voteToUnwindTx(): DeferredTransactionWrapper<ITxParams> {
    return new DeferredTransactionWrapper<ITxParams>(this, "voteToUnwind", []);
  }
  public updateActivityKeyTx(
    newActivityKey: BigNumber | string
  ): DeferredTransactionWrapper<ITxParams> {
    return new DeferredTransactionWrapper<ITxParams>(
      this,
      "updateActivityKey",
      [newActivityKey.toString()]
    );
  }
  public updateBootyBaseTx(
    newBootyBase: BigNumber | string
  ): DeferredTransactionWrapper<ITxParams> {
    return new DeferredTransactionWrapper<ITxParams>(this, "updateBootyBase", [
      newBootyBase.toString()
    ]);
  }

  public StakeEventEvent(eventFilter: {
    staker?: BigNumber | string | Array<BigNumber | string>;
    startPeriod?: BigNumber | number | Array<BigNumber | number>;
    endPeriod?: BigNumber | number | Array<BigNumber | number>;
  }): DeferredEventWrapper<
    {
      staker: BigNumber | string;
      startPeriod: BigNumber | number;
      endPeriod: BigNumber | number;
      activityKey: BigNumber | string;
      bootyBase: BigNumber | string;
    },
    {
      staker?: BigNumber | string | Array<BigNumber | string>;
      startPeriod?: BigNumber | number | Array<BigNumber | number>;
      endPeriod?: BigNumber | number | Array<BigNumber | number>;
    }
  > {
    return new DeferredEventWrapper<
      {
        staker: BigNumber | string;
        startPeriod: BigNumber | number;
        endPeriod: BigNumber | number;
        activityKey: BigNumber | string;
        bootyBase: BigNumber | string;
      },
      {
        staker?: BigNumber | string | Array<BigNumber | string>;
        startPeriod?: BigNumber | number | Array<BigNumber | number>;
        endPeriod?: BigNumber | number | Array<BigNumber | number>;
      }
    >(this, "StakeEvent", eventFilter);
  }
  public SendFeesEventEvent(eventFilter: {
    sender?: BigNumber | string | Array<BigNumber | string>;
    bootyAmount?: BigNumber | number | Array<BigNumber | number>;
    currentBootyFees?: BigNumber | number | Array<BigNumber | number>;
  }): DeferredEventWrapper<
    {
      sender: BigNumber | string;
      bootyAmount: BigNumber | number;
      currentBootyFees: BigNumber | number;
    },
    {
      sender?: BigNumber | string | Array<BigNumber | string>;
      bootyAmount?: BigNumber | number | Array<BigNumber | number>;
      currentBootyFees?: BigNumber | number | Array<BigNumber | number>;
    }
  > {
    return new DeferredEventWrapper<
      {
        sender: BigNumber | string;
        bootyAmount: BigNumber | number;
        currentBootyFees: BigNumber | number;
      },
      {
        sender?: BigNumber | string | Array<BigNumber | string>;
        bootyAmount?: BigNumber | number | Array<BigNumber | number>;
        currentBootyFees?: BigNumber | number | Array<BigNumber | number>;
      }
    >(this, "SendFeesEvent", eventFilter);
  }
  public MintBootyEventEvent(eventFilter: {
    targetBootySupply?: BigNumber | number | Array<BigNumber | number>;
    totalBootySupply?: BigNumber | number | Array<BigNumber | number>;
    currentPeriod?: BigNumber | number | Array<BigNumber | number>;
  }): DeferredEventWrapper<
    {
      targetBootySupply: BigNumber | number;
      totalBootySupply: BigNumber | number;
      currentPeriod: BigNumber | number;
    },
    {
      targetBootySupply?: BigNumber | number | Array<BigNumber | number>;
      totalBootySupply?: BigNumber | number | Array<BigNumber | number>;
      currentPeriod?: BigNumber | number | Array<BigNumber | number>;
    }
  > {
    return new DeferredEventWrapper<
      {
        targetBootySupply: BigNumber | number;
        totalBootySupply: BigNumber | number;
        currentPeriod: BigNumber | number;
      },
      {
        targetBootySupply?: BigNumber | number | Array<BigNumber | number>;
        totalBootySupply?: BigNumber | number | Array<BigNumber | number>;
        currentPeriod?: BigNumber | number | Array<BigNumber | number>;
      }
    >(this, "MintBootyEvent", eventFilter);
  }
  public CheckInEventEvent(eventFilter: {
    staker?: BigNumber | string | Array<BigNumber | string>;
    updatedEndingPeriod?: BigNumber | number | Array<BigNumber | number>;
    currentPeriod?: BigNumber | number | Array<BigNumber | number>;
  }): DeferredEventWrapper<
    {
      staker: BigNumber | string;
      updatedEndingPeriod: BigNumber | number;
      currentPeriod: BigNumber | number;
    },
    {
      staker?: BigNumber | string | Array<BigNumber | string>;
      updatedEndingPeriod?: BigNumber | number | Array<BigNumber | number>;
      currentPeriod?: BigNumber | number | Array<BigNumber | number>;
    }
  > {
    return new DeferredEventWrapper<
      {
        staker: BigNumber | string;
        updatedEndingPeriod: BigNumber | number;
        currentPeriod: BigNumber | number;
      },
      {
        staker?: BigNumber | string | Array<BigNumber | string>;
        updatedEndingPeriod?: BigNumber | number | Array<BigNumber | number>;
        currentPeriod?: BigNumber | number | Array<BigNumber | number>;
      }
    >(this, "CheckInEvent", eventFilter);
  }
  public ClaimBootyEventEvent(eventFilter: {
    staker?: BigNumber | string | Array<BigNumber | string>;
    period?: BigNumber | number | Array<BigNumber | number>;
    bootyOwed?: BigNumber | number | Array<BigNumber | number>;
  }): DeferredEventWrapper<
    {
      staker: BigNumber | string;
      period: BigNumber | number;
      bootyOwed: BigNumber | number;
      stakerSpankPoints: BigNumber | number;
    },
    {
      staker?: BigNumber | string | Array<BigNumber | string>;
      period?: BigNumber | number | Array<BigNumber | number>;
      bootyOwed?: BigNumber | number | Array<BigNumber | number>;
    }
  > {
    return new DeferredEventWrapper<
      {
        staker: BigNumber | string;
        period: BigNumber | number;
        bootyOwed: BigNumber | number;
        stakerSpankPoints: BigNumber | number;
      },
      {
        staker?: BigNumber | string | Array<BigNumber | string>;
        period?: BigNumber | number | Array<BigNumber | number>;
        bootyOwed?: BigNumber | number | Array<BigNumber | number>;
      }
    >(this, "ClaimBootyEvent", eventFilter);
  }
  public WithdrawStakeEventEvent(eventFilter: {
    staker?: BigNumber | string | Array<BigNumber | string>;
    totalSpankStaked?: BigNumber | number | Array<BigNumber | number>;
    currentPeriod?: BigNumber | number | Array<BigNumber | number>;
  }): DeferredEventWrapper<
    {
      staker: BigNumber | string;
      totalSpankStaked: BigNumber | number;
      currentPeriod: BigNumber | number;
    },
    {
      staker?: BigNumber | string | Array<BigNumber | string>;
      totalSpankStaked?: BigNumber | number | Array<BigNumber | number>;
      currentPeriod?: BigNumber | number | Array<BigNumber | number>;
    }
  > {
    return new DeferredEventWrapper<
      {
        staker: BigNumber | string;
        totalSpankStaked: BigNumber | number;
        currentPeriod: BigNumber | number;
      },
      {
        staker?: BigNumber | string | Array<BigNumber | string>;
        totalSpankStaked?: BigNumber | number | Array<BigNumber | number>;
        currentPeriod?: BigNumber | number | Array<BigNumber | number>;
      }
    >(this, "WithdrawStakeEvent", eventFilter);
  }
  public SplitStakeEventEvent(eventFilter: {
    staker?: BigNumber | string | Array<BigNumber | string>;
    newAddress?: BigNumber | string | Array<BigNumber | string>;
    spankAmount?: BigNumber | number | Array<BigNumber | number>;
  }): DeferredEventWrapper<
    {
      staker: BigNumber | string;
      newAddress: BigNumber | string;
      spankAmount: BigNumber | number;
      currentPeriod: BigNumber | number;
      startingPeriod: BigNumber | number;
      endingPeriod: BigNumber | number;
      activityKey: BigNumber | string;
      bootyBase: BigNumber | string;
    },
    {
      staker?: BigNumber | string | Array<BigNumber | string>;
      newAddress?: BigNumber | string | Array<BigNumber | string>;
      spankAmount?: BigNumber | number | Array<BigNumber | number>;
    }
  > {
    return new DeferredEventWrapper<
      {
        staker: BigNumber | string;
        newAddress: BigNumber | string;
        spankAmount: BigNumber | number;
        currentPeriod: BigNumber | number;
        startingPeriod: BigNumber | number;
        endingPeriod: BigNumber | number;
        activityKey: BigNumber | string;
        bootyBase: BigNumber | string;
      },
      {
        staker?: BigNumber | string | Array<BigNumber | string>;
        newAddress?: BigNumber | string | Array<BigNumber | string>;
        spankAmount?: BigNumber | number | Array<BigNumber | number>;
      }
    >(this, "SplitStakeEvent", eventFilter);
  }
  public VoteToUnwindEventEvent(eventFilter: {
    staker?: BigNumber | string | Array<BigNumber | string>;
    spankStaked?: BigNumber | number | Array<BigNumber | number>;
    unwind?: boolean | Array<boolean>;
  }): DeferredEventWrapper<
    {
      staker: BigNumber | string;
      spankStaked: BigNumber | number;
      unwind: boolean;
      currentPeriod: BigNumber | number;
      totalSpankStaked: BigNumber | number;
    },
    {
      staker?: BigNumber | string | Array<BigNumber | string>;
      spankStaked?: BigNumber | number | Array<BigNumber | number>;
      unwind?: boolean | Array<boolean>;
    }
  > {
    return new DeferredEventWrapper<
      {
        staker: BigNumber | string;
        spankStaked: BigNumber | number;
        unwind: boolean;
        currentPeriod: BigNumber | number;
        totalSpankStaked: BigNumber | number;
      },
      {
        staker?: BigNumber | string | Array<BigNumber | string>;
        spankStaked?: BigNumber | number | Array<BigNumber | number>;
        unwind?: boolean | Array<boolean>;
      }
    >(this, "VoteToUnwindEvent", eventFilter);
  }
  public UpdateActivityKeyEventEvent(eventFilter: {
    staker?: BigNumber | string | Array<BigNumber | string>;
    newActivityKey?: BigNumber | string | Array<BigNumber | string>;
    currentPeriod?: BigNumber | number | Array<BigNumber | number>;
  }): DeferredEventWrapper<
    {
      staker: BigNumber | string;
      newActivityKey: BigNumber | string;
      currentPeriod: BigNumber | number;
    },
    {
      staker?: BigNumber | string | Array<BigNumber | string>;
      newActivityKey?: BigNumber | string | Array<BigNumber | string>;
      currentPeriod?: BigNumber | number | Array<BigNumber | number>;
    }
  > {
    return new DeferredEventWrapper<
      {
        staker: BigNumber | string;
        newActivityKey: BigNumber | string;
        currentPeriod: BigNumber | number;
      },
      {
        staker?: BigNumber | string | Array<BigNumber | string>;
        newActivityKey?: BigNumber | string | Array<BigNumber | string>;
        currentPeriod?: BigNumber | number | Array<BigNumber | number>;
      }
    >(this, "UpdateActivityKeyEvent", eventFilter);
  }
  public UpdateBootyBaseEventEvent(eventFilter: {
    staker?: BigNumber | string | Array<BigNumber | string>;
    newBootyBase?: BigNumber | string | Array<BigNumber | string>;
    currentPeriod?: BigNumber | number | Array<BigNumber | number>;
  }): DeferredEventWrapper<
    {
      staker: BigNumber | string;
      newBootyBase: BigNumber | string;
      currentPeriod: BigNumber | number;
    },
    {
      staker?: BigNumber | string | Array<BigNumber | string>;
      newBootyBase?: BigNumber | string | Array<BigNumber | string>;
      currentPeriod?: BigNumber | number | Array<BigNumber | number>;
    }
  > {
    return new DeferredEventWrapper<
      {
        staker: BigNumber | string;
        newBootyBase: BigNumber | string;
        currentPeriod: BigNumber | number;
      },
      {
        staker?: BigNumber | string | Array<BigNumber | string>;
        newBootyBase?: BigNumber | string | Array<BigNumber | string>;
        currentPeriod?: BigNumber | number | Array<BigNumber | number>;
      }
    >(this, "UpdateBootyBaseEvent", eventFilter);
  }
}
