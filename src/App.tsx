import {
  ChakraProvider,
  Box,
  Grid,
  Flex,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  HStack,
  useColorModeValue,
  useToast,
  ModalOverlay,
  ModalContent,
  Modal,
  ModalBody,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import ClockLoader from 'react-spinners/ClockLoader';
import { ConnectButton } from './components/ConnectButton'
import { LoadingContext } from './context/loading-context'
import Home from './pages/Home'
import theme from './utils/theme'


export const App = () => {
  const { address, isConnecting, isDisconnected } = useAccount()
  const { chain } = useNetwork()
  const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()

  const [isOverlayLoading, setIsOverlayLoading] = useState<boolean>(false)
  const [loadingText, setLoadingText] = useState<string>('')

  const { isOpen: isLoadingModalOpen, onOpen: onLoadingModalOpen, onClose: onLoadingModalClose } = useDisclosure()
  
  const iconColor = useColorModeValue('white', 'red')
  const bg = useColorModeValue('white', '#070627')
  const toast = useToast()
  
  const LoadingOverlay = () => (
    <ModalOverlay
      bg='none'
      backdropFilter='auto'
      backdropInvert='30%'
      backdropBlur='0.1rem'
    />
  )
  const [overlay] = useState(<LoadingOverlay />)
  
  useEffect(() => {
    if (isOverlayLoading) {
      onLoadingModalOpen()
    } else {
      onLoadingModalClose()
    }
  }, [isOverlayLoading, onLoadingModalClose, onLoadingModalOpen])

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
  
  return (
    <LoadingContext.Provider value={{ setIsOverlayLoading, setLoadingText }}>
      <ChakraProvider theme={theme}>
        {
          isOverlayLoading ? (
            <Modal
              isCentered
              isOpen={isLoadingModalOpen}
              onClose={onLoadingModalClose}
              closeOnOverlayClick={false}
            >
              {overlay}

              <ModalContent bgColor={bg} minW={'md'}>
                <ModalBody>
                  <VStack my={8} rounded={'sm'}>
                    <ClockLoader color="rgb(74, 211, 166)" size={40} />
                    <Box>{loadingText}</Box>
                  </VStack>
                </ModalBody>
              </ModalContent>
            </Modal>
          ) : ''
        }
        
        <Box
          fontSize="xl"
          minH={'100vh'}
        >
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
          ) : (
            <Grid>
              {/* <ColorModeSwitcher justifySelf="flex-end" mt={5} mr={5} /> */}
              
              <Flex justifyContent={'center'} mt={5}>
                { isConnecting ? <Box>Connecting...</Box> : '' }

                { isDisconnected ? <ConnectButton /> : '' }
                
                { address && <Home /> }
              </Flex>
            </Grid>
          )
        }
        </Box>
      </ChakraProvider>
    </LoadingContext.Provider>
  )
}
