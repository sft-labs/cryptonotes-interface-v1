import { Code, Text, Tooltip } from "@chakra-ui/react"
import { useAccount, useDisconnect, useEnsName } from "wagmi"
import { shortWalletAddress } from "../../utils/helper"

const HomeHeader = () => {
  const { disconnect } = useDisconnect()
  const { address } = useAccount()
  const { data: ensName } = useEnsName({ address })
  
  return (
    <>
      <Tooltip hasArrow label='Click to disconnect'>
        <Text cursor={'pointer'} onClick={() => disconnect()}>
          Connected to <Code>{ensName ?? shortWalletAddress(address)}</Code>
        </Text>
      </Tooltip>
    </>
  )
}

export default HomeHeader
