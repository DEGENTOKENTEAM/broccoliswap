import { Chain, NULL_ADDRESS, chainsInfo } from "@/types";
import BigNumber from "bignumber.js";
import Web3 from "web3";

const contractAbi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "targetTokenAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "idexRouterAddres",
        type: "address",
      },
    ],
    name: "honeyCheck",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "buyResult",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tokenBalance2",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "sellResult",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "buyCost",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "sellCost",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "expectedAmount",
            type: "uint256",
          },
        ],
        internalType: "struct honeyCheckerV5.HoneyResponse",
        name: "response",
        type: "tuple",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "router",
    outputs: [
      {
        internalType: "contract IDEXRouter",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const TEST_AMOUNT = 10 ** 17 * 5; // 0.5 something
const GAS_LIMIT = "4500000"; // 4.5 million Gas should be enough

const cache: Record<string, {
    buyTax: number,
    sellTax: number,
    buyGasCost?: number,
    sellGasCost?: number,
    isHoneypot: number,
    error?: unknown
}> = {}

export const getTokenTaxes = async (
  chain: Chain,
  token: string
) => {
  if (!chainsInfo[chain].honeyPotCheckerContract
    || !chainsInfo[chain].honeyPotCheckerRouter
    || !chainsInfo[chain].honeyPotCheckerAddress) {
    return {
      buyTax: -1,
      sellTax: -1,
      buyGasCost: 0,
      sellGasCost: 0,
      isHoneypot: 0,
    }
  }

    if (cache[`${chain}-${token}`]) {
        return cache[`${chain}-${token}`];
    }

    if (token === NULL_ADDRESS) {
        return {
            buyTax: 0,
            sellTax: 0,
            buyGasCost: 0,
            sellGasCost: 0,
            isHoneypot: 0,
        }
    }

  let buyTax = 0;
  let sellTax = 0;
  let buyGasCost = 0;
  let sellGasCost = 0;
  let isHoneypot = 0;

  const rpcAddress = chainsInfo[chain].rpc;
  const honeyCheckerAddress = chainsInfo[chain].honeyPotCheckerContract;
  const router = chainsInfo[chain].honeyPotCheckerRouter;
  const from = chainsInfo[chain].honeyPotCheckerAddress;

  const web3 = new Web3(rpcAddress);
  const gasPrice = await web3.eth.getGasPrice();

  const honeyCheck = new web3.eth.Contract(contractAbi as any);

  const data = honeyCheck.methods.honeyCheck(token, router).encodeABI();

  let honeyTxResult: any;

  try {
    honeyTxResult = await web3.eth.call({
      // this could be provider.addresses[0] if it exists
      from,
      // target address, this could be a smart contract address
      to: honeyCheckerAddress,
      // optional if you want to specify the gas limit
      gas: GAS_LIMIT,
      gasPrice: Math.floor(Number(gasPrice) * 1.2).toString(),
      // optional if you are invoking say a payable function
      value: TEST_AMOUNT,
      // nonce
      nonce: undefined,
      // this encodes the ABI of the method and the arguements
      data,
    });
  } catch (error) {
    cache[`${chain}-${token}`] = {
      buyTax: -1,
      sellTax: -1,
      isHoneypot: 1,
      error: error,
    };
    return cache[`${chain}-${token}`];
  }

  const decoded = web3.eth.abi.decodeParameter(
    "tuple(uint256,uint256,uint256,uint256,uint256,uint256)",
    honeyTxResult
  );

  buyGasCost = decoded[3];
  sellGasCost = decoded[4];

  const res = {
    buyResult: decoded[0],
    leftOver: decoded[1],
    sellResult: decoded[2],
    expectedAmount: decoded[5],
  };

  buyTax =
    (1 -
      new BigNumber(res.buyResult)
        .dividedBy(new BigNumber(res.expectedAmount))
        .toNumber()) *
    100;
  sellTax =
    (1 -
      new BigNumber(res.sellResult)
        .dividedBy(new BigNumber(TEST_AMOUNT))
        .toNumber()) *
      100 -
    buyTax;

  cache[`${chain}-${token}`] =  {
    buyTax: Math.max(parseFloat(buyTax.toFixed(2)), 0),
    sellTax: Math.max(parseFloat(sellTax.toFixed(2)), 0),
    buyGasCost,
    sellGasCost,
    isHoneypot,
  };

  return cache[`${chain}-${token}`];
};
