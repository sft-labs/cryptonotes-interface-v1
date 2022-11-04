import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, HStack, useColorModeValue, useToast } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useNetwork, useSwitchNetwork } from 'wagmi'

export function NetworkSwitcher() {
  const { chain } = useNetwork()
  const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()

  const iconColor = useColorModeValue('white', 'red')
  const toast = useToast()
  
  useEffect(() => {
    if (error) {
      toast({
        title: 'Wallet Connection Error',
        position: 'bottom-right',
        variant: 'left-accent',
        description: `${error.message}`,
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    }
  }, [error, toast])

  if (!chain) return null

  return (
    <Box>
      {
        chain?.unsupported ? (
          <>
            <Alert status='error' variant={'solid'}>
              <AlertIcon color={iconColor} />
              <AlertTitle>Connected to unsupported network!</AlertTitle>
              <AlertDescription>Please switch to supported networks by clicking below buttons.</AlertDescription>
            </Alert>

            {
              switchNetwork && (
                <HStack spacing={6} pt={5} justify={'center'}>
                  {chains.map((x) =>
                    x.id === chain?.id ? null : (
                      <Button
                        key={x.id}
                        w={200}
                        colorScheme={'orange'}
                        onClick={() => switchNetwork(x.id)}
                        disabled={isLoading}
                        isLoading={isLoading && pendingChainId === x.id}
                        loadingText={`${x.name} (switching)`}
                      >
                        {x.name}
                      </Button>
                    ),
                  )}
                </HStack>
              )
            }
          </>
        ) : ''
      }
      
    </Box>
  )
}
