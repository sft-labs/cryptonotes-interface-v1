import { chain } from 'wagmi';

type Contract = {
  notes: `0x${string}`
  oracle: `0x${string}`
}
type Contracts = {
  [key: number]: Contract
}
export const contracts: Contracts = {
  [chain.sepolia.id]: {
    notes: '0x603AA792fF227Ed8143B0196Bd7c4233F46861ec',
    oracle: '0x694AA1769357215DE4FAC081bf1f309aDC325306'
  },
}
