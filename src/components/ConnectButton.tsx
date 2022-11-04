import { Button } from '@chakra-ui/react'
import { ConnectKitButton } from 'connectkit'

export const ConnectButton = () => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, address, ensName }) => {
        return (
          <Button maxW={'md'} colorScheme={'cyan'} onClick={show} isLoading={isConnecting}>
            {isConnected ? ensName ?? address : 'Connect Wallet'}
          </Button>
        )
      }}
    </ConnectKitButton.Custom>
  )
}
