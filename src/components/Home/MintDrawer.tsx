import React, { ChangeEvent, FC, useCallback, useState } from 'react'
import {
  Box,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Stack,
  FormLabel,
  Input,
  Textarea,
  DrawerFooter,
  Button,
  NumberInput,
  NumberInputField,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputStepper,
  InputGroup,
  InputLeftAddon,
  useToast,
  useColorModeValue
} from '@chakra-ui/react'
import { constants, utils } from 'ethers'
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, useAccount, useNetwork } from 'wagmi'
import { ReactComponent as ETHLogo } from '../../assets/images/eth-logo.svg'
import { extractErrorMessage } from '../../utils/helper'
import { contracts } from '../../utils/contracts'
import { useDebounce } from 'usehooks-ts'
import WithTxConfirmation from '../WithTxConfirmation'
import { useLoading } from '../../context/loading-context'
import WithTxInProgress from '../WithTxInProgress'
import { mintAbi } from '../../utils/abis'

interface MintDrawerProps {
  onClose: () => void
  isOpen: boolean
  reexecuteQuery: (params: any) => void
}

const DEBOUNCE_PERIOD = 500

const MintDrawer: FC<MintDrawerProps> = ({ onClose, isOpen, reexecuteQuery }) => {
  const focusField = React.useRef() as React.RefObject<HTMLInputElement>

  const { address } = useAccount()
  const { chain } = useNetwork()
  
  const toastWarningBgColor = useColorModeValue('white', 'yellow.900')
  const toast = useToast({
    position: 'bottom-right',
    variant: 'left-accent',
    isClosable: true,
    duration: 9000,
    containerStyle: {
      background: toastWarningBgColor,
      borderRadius: '0.5rem',
    }
  })
  
  const { setIsOverlayLoading, setLoadingText } = useLoading()
  
  const [noteName, setNoteName] = useState<string>('')
  const debouncedNoteName = useDebounce(noteName, DEBOUNCE_PERIOD)
  const [amount, setAmount] = useState<number>()
  const debouncedAmount = useDebounce(amount, DEBOUNCE_PERIOD)
  const [description, setDescription] = useState<string>('')
  const debouncedDescription = useDebounce(description, DEBOUNCE_PERIOD)

  const isMintable = (): boolean => {
    return !!address && !!debouncedNoteName && !!debouncedDescription && !!debouncedAmount
  }
 
  const resetValues = useCallback(() => {
    setNoteName('')
    setAmount(undefined)
    setDescription('')
    setIsOverlayLoading(false)
  }, [setIsOverlayLoading])

  const { config } = usePrepareContractWrite({
    address: contracts[`${chain?.id as number}`],
    abi: mintAbi,
    functionName: 'mint',
    args: [
      address!,
      {
        name: debouncedNoteName,
        description: debouncedDescription,
        image: '',
        underlying: constants.AddressZero, // zero address for ETH on Ethereum networks
      },
      utils.parseEther(debouncedAmount?.toString() || '0'),
    ],
    overrides: {
      from: address!,
      value: utils.parseEther(debouncedAmount?.toString() || '0'),
    },
    enabled: isMintable(),
  })

  const { data, write, isLoading: isWriting } = useContractWrite({
    ...config,
    onSettled: (d, err) => {
      if (d?.hash) {
        setLoadingText(<WithTxInProgress txHash={d?.hash} chainId={chain?.id} />)
      } else {
        toast({
          title: `⚠️ Mint Note Warning`,
          description: `${extractErrorMessage(err)}`,
          status: 'warning',
        })
      }
    }
  })

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    confirmations: 2,
    onSuccess: () => {
      toast({
        title: '🎉 Mint Note',
        description: `Successfully minted your note!`,
        status: 'success',
      })
      resetValues()
      onClose()
      reexecuteQuery({ requestPolicy: 'network-only' })
    },
    onError: (err: any) => {
      toast({
        title: `😱 Mint Note Error`,
        description: `${extractErrorMessage(err)}`,
        status: 'error',
      })
      setIsOverlayLoading(false)
    }
  })

  const onMinting = useCallback(() => {
    setIsOverlayLoading(true)
    setLoadingText(<WithTxConfirmation />)
    write?.()
  }, [write, setIsOverlayLoading, setLoadingText])

  return (
    <>
      <Drawer
        onClose={onClose}
        isOpen={isOpen}
        size={'xl'}
        placement='right'
        initialFocusRef={focusField}
        closeOnOverlayClick={false}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Mint a new cryptonote</DrawerHeader>

          <DrawerBody>
            <Stack spacing='24px'>
              <Box>
                <FormLabel htmlFor='noteName'>Note Name</FormLabel>
                <Input
                  ref={focusField}
                  id='noteName'
                  placeholder='Please enter note name'
                  readOnly={isWriting}
                  value={noteName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNoteName(e.target.value)}
                />
              </Box>

              <Box>
                <FormLabel htmlFor='amount'>Deposit Amount</FormLabel>
                <InputGroup>
                  <InputLeftAddon py={2}>
                    <ETHLogo height={25} />
                  </InputLeftAddon>
                  <NumberInput
                    id='amount'
                    placeholder='Please enter deposit amount'
                    defaultValue={amount}
                    min={0}
                    step={0.01}
                    w={'50rem'}
                    onChange={(value: string) => setAmount(Number(value))}
                  >
                    <NumberInputField
                      value={amount}
                      borderLeftRadius={0}
                      readOnly={isWriting}
                    />
                    {
                      !isWriting && (
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      )
                    }
                  </NumberInput>
                </InputGroup>
              </Box>

              {/* <Box>
                <FormLabel htmlFor='underlying'>Underlying Asset</FormLabel>
                <Select id='underlying'>
                  <option value='ETH'>ETH</option>
                  <option value='USDT'>USDT</option>
                </Select>
              </Box> */}

              <Box>
                <FormLabel htmlFor='desc'>Description</FormLabel>
                <Textarea
                  id='desc'
                  value={description}
                  readOnly={isWriting}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                />
              </Box>
            </Stack>
          </DrawerBody>

          <DrawerFooter borderTopWidth='1px'>
            <Button variant='outline' mr={3} onClick={onClose} disabled={isLoading || isWriting}>
              Cancel
            </Button>
            <Button
              colorScheme='cyan'
              onClick={() => onMinting()}
              disabled={!isMintable() || !write || isLoading || isWriting}
              isLoading={isLoading || isWriting}
              loadingText={'Minting...'}
            >Mint</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default MintDrawer
