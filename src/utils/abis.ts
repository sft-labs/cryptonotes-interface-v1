
export const splitByTokenIdAbi: readonly any[] = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "fromTokenId_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "splitUnits_",
        "type": "uint256"
      }
    ],
    "name": "split",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

export const splitByAddressAbi: readonly any[] = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "fromTokenId_",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "to_",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "splitUnits_",
        "type": "uint256"
      }
    ],
    "name": "split",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

export const mergeAbi: readonly any[] = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "targetTokenId_",
        "type": "uint256"
      }
    ],
    "name": "merge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

export const aggregatorV3InterfaceABI = [{ "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "description", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint80", "name": "_roundId", "type": "uint80" }], "name": "getRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "latestRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }]

export const mintAbi: readonly any[] = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "onBehalfOf_",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "image",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "underlying",
            "type": "address"
          }
        ],
        "internalType": "struct ICryptonotes.SlotDetail",
        "name": "slotDetail_",
        "type": "tuple"
      },
      {
        "internalType": "uint256",
        "name": "value_",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  }
]
