import { FC, useCallback, useState, useEffect, ChangeEvent, useMemo } from 'react'
import {
  Badge,
  Box,
  Image,
  useColorModeValue,
  Flex,
  Button,
  HStack,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Text,
  InputGroup,
  InputLeftAddon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Tooltip
} from '@chakra-ui/react'
import { useAccount, useContractRead, useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { useDebounce } from 'usehooks-ts'
import { BigNumber, utils } from 'ethers'
import { AiOutlineSplitCells, AiOutlineMergeCells, AiOutlineDownload, AiOutlineUpload } from 'react-icons/ai'
import { extractErrorMessage } from '../../utils/helper'
import { ReactComponent as ETHLogo } from '../../assets/images/eth-logo.svg'
import { contracts } from '../../utils/contracts'
import { useLoading } from '../../context/loading-context'
import WithTxInProgress from '../WithTxInProgress'
import WithTxConfirmation from '../WithTxConfirmation'
import Placeholder from '../../assets/images/placeholder.jpeg'
import Note from '../../types/note'
import { mergeAbi, splitByAddressAbi, splitByTokenIdAbi } from '../../utils/abis'
const CryptonotesAbi = require('../../abis/Cryptonotes.json')

interface NoteBoxProps {
  note: Note
  ethInUsd: string | number
  reexecuteQuery: (params: any) => void
}

const DEBOUNCE_PERIOD = 500

const NoteBox: FC<NoteBoxProps> = ({ note, ethInUsd, reexecuteQuery }) => {
  const { address } = useAccount()
  const { chain } = useNetwork()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [targetTokenId, setTargetTokenId] = useState<string>()
  const debouncedTargetTokenId = useDebounce(targetTokenId, DEBOUNCE_PERIOD)
  const [recipient, setRecipient] = useState<string>()
  const debouncedRecipient = useDebounce(recipient, DEBOUNCE_PERIOD)
  const [amount, setAmount] = useState<number | undefined>()
  const debouncedAmount = useDebounce(amount, DEBOUNCE_PERIOD)
  const [splitToAddress, setSplitToAddress] = useState<boolean>(false)
  const [action, setAction] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const { setIsOverlayLoading, setLoadingText } = useLoading()

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

  const { data: tokenURI } = useContractRead({
    address: contracts[`${chain?.id as number}`],
    abi: CryptonotesAbi,
    functionName: 'tokenURI',
    args: [note.tokenId],
  })

  const resetValues = useCallback(() => {
    setAction('')
    setAmount(undefined)
    setIsSubmitting(false)
    setRecipient('')
    setSplitToAddress(false)
  }, [setAction, setAmount, setIsSubmitting, setRecipient, setSplitToAddress])

  const onModalClose = useCallback(() => {
    onClose()
    resetValues()
    setIsOverlayLoading(false)
  }, [onClose, resetValues, setIsOverlayLoading])

  /* ========== SPLIT ========== */
  const { config: splitConfig } = usePrepareContractWrite({
    address: contracts[`${chain?.id as number}`],
    abi: splitByTokenIdAbi,
    functionName: 'split',
    args: [
      BigNumber.from(note.tokenId || '0'),
      utils.parseEther(debouncedAmount?.toString() || '0')
    ],
    enabled: action === 'split' && !!note.tokenId && !!debouncedAmount,
  })

  const {
    data: splitData,
    write: split,
    isLoading: isSpliting
  } = useContractWrite({
     ...splitConfig,
     onError: (err: any) => {
       toast({
         title: `⚠️ Split Note Warning`,
         description: `${extractErrorMessage(err)}`,
         status: 'warning',
       })
       setIsOverlayLoading(false)
       setIsSubmitting(false)
     },
  })
 
  const { isLoading: isSplitTxLoading } = useWaitForTransaction({
    hash: splitData?.hash,
    confirmations: 2,
    onSettled: () => {
      setIsOverlayLoading(false)
      setIsSubmitting(false)
    },
    onSuccess: () => {
      toast({
        title: `🎉 Split Note Success`,
        description: `Your transaction get mined successfully`,
        status: 'success',
      })
      onModalClose()
      reexecuteQuery({ requestPolicy: 'network-only' })
    },
    onError: (err: any) => {
      toast({
        title: `😱 Split Note Error`,
        description: `${extractErrorMessage(err)}`,
        status: 'error',
      })
    }
  })

  const { config: splitByAddressConfig } = usePrepareContractWrite({
    address: contracts[`${chain?.id as number}`],
    abi: splitByAddressAbi,
    functionName: 'split',
    args: [
      BigNumber.from(note.tokenId ?? '0'),
      debouncedRecipient as `0x${string}`,
      utils.parseEther(debouncedAmount?.toString() || '0')
    ],
    enabled: action === 'split' && !!note.tokenId && !!debouncedRecipient && !!debouncedAmount,
  })

  const {
    data: splitByAddressData,
    write: splitByAddress,
    isLoading: isSplitingByAddress
  } = useContractWrite({
    ...splitByAddressConfig,
    onError: (err: any) => {
      toast({
        title: `⚠️ Split Note Warning`,
        description: `${extractErrorMessage(err)}`,
        status: 'warning',
      })
      setIsOverlayLoading(false)
      setIsSubmitting(false)
    },
  })
 
  const { isLoading: isSplitByAddressTxLoading } = useWaitForTransaction({
    hash: splitByAddressData?.hash,
    confirmations: 2,
    onSettled: () => {
      setIsOverlayLoading(false)
      setIsSubmitting(false)
    },
    onSuccess: () => {
      toast({
        title: `🎉 Split Note Success`,
        description: `Your transaction get mined successfully`,
        status: 'success',
      })
      onModalClose()
      reexecuteQuery({ requestPolicy: 'network-only' })
    },
    onError: (err: any) => {
      toast({
        title: `😱 Split Note Error`,
        description: `${extractErrorMessage(err)}`,
        status: 'error',
      })
    }
  })

  /* ========== MERGE ========== */
  const { config: mergeConfig } = usePrepareContractWrite({
    address: contracts[`${chain?.id as number}`],
    abi: mergeAbi,
    functionName: 'merge',
    args: [
      BigNumber.from(note.tokenId || '0'),
      BigNumber.from(debouncedTargetTokenId || '0')
    ],
    enabled: action === 'merge' && !!debouncedTargetTokenId && !!note.tokenId,
  })

  const {
    data: mergeData,
    write: merge,
    isLoading: isMerging
  } = useContractWrite({
    ...mergeConfig,
    onError: (err: any) => {
      toast({
        title: `⚠️ Merge Note Warning`,
        description: `${extractErrorMessage(err)}`,
        status: 'warning',
      })
      setIsOverlayLoading(false)
      setIsSubmitting(false)
    },
  })
 
  const { isLoading: isMergeTxLoading } = useWaitForTransaction({
    hash: mergeData?.hash,
    confirmations: 2,
    onSettled: () => {
      setIsOverlayLoading(false)
      setIsSubmitting(false)
    },
    onSuccess: () => {
      toast({
        title: `🎉 Merge Note Success`,
        description: `Your transaction get mined successfully`,
        status: 'success',
      })
      onModalClose()
      reexecuteQuery({ requestPolicy: 'network-only' })
    },
    onError: (err: any) => {
      toast({
        title: `😱 Merge Note Error`,
        description: `${extractErrorMessage(err)}`,
        status: 'error',
      })
    }
  })

  /* ========== TOPUP ========== */
  const { config: topUpConfig } = usePrepareContractWrite({
    address: contracts[`${chain?.id as number}`],
    abi: [...CryptonotesAbi],
    functionName: 'topUp',
    args: [
      address,
      note.tokenId,
      utils.parseEther(debouncedAmount?.toString() || '0')
    ],
    overrides: {
      from: address,
      value: utils.parseEther(debouncedAmount?.toString() || '0'),
    },
    enabled: action === 'topup' && !!address && !!debouncedAmount && !!note.tokenId,
  })

  const {
    data: topUpData,
    write: topUp,
    isLoading: isTopup
  } = useContractWrite({ 
    ...topUpConfig,
    onError: (err: any) => {
      toast({
        title: `⚠️ Topup Note Warning`,
        description: `${extractErrorMessage(err)}`,
        status: 'warning',
      })
      setIsOverlayLoading(false)
      setIsSubmitting(false)
    },
  })
 
  const {
    isLoading: isTopUpLoading,
  } = useWaitForTransaction({
    hash: topUpData?.hash,
    confirmations: 2,
    onSettled: () => {
      setIsOverlayLoading(false)
      setIsSubmitting(false)
    },
    onSuccess: () => {
      toast({
        title: `🎉 Topup Note Success`,
        description: `Your transaction get mined successfully`,
        status: 'success',
      })
      onModalClose()
      reexecuteQuery({ requestPolicy: 'network-only' })
    },
    onError: (err: any) => {
      toast({
        title: `😱 Topup Note Error`,
        description: `${extractErrorMessage(err)}`,
        status: 'error',
      })
    }
  })

  /* ========== WITHDRAW ========== */
  const { config: withdrawConfig } = usePrepareContractWrite({
    address: contracts[`${chain?.id || 5}`],
    abi: [...CryptonotesAbi],
    functionName: 'withdraw',
    args: [note.tokenId],
    enabled: !!note.tokenId,
  })

  const { data: withdrawData, write: withdraw } = useContractWrite({
    ...withdrawConfig,
    request: withdrawConfig.request,
    onError: (err: any) => {
      toast({
        title: `⚠️ Withdraw Note Warning`,
        description: `${extractErrorMessage(err)}`,
        status: 'warning',
      })
      setIsOverlayLoading(false)
      setIsSubmitting(false)
    },
  })
 
  const { isLoading: isWithdrawLoading } = useWaitForTransaction({
    hash: withdrawData?.hash,
    confirmations: 2,
    onSettled: () => onWithdrawSettled(),
    onSuccess: () => {
      toast({
        title: `🎉 Withdraw Note Success`,
        description: `Your transaction get mined successfully`,
        status: 'success',
      })
      onModalClose()
      reexecuteQuery({ requestPolicy: 'network-only' })
    },
    onError: (err: any) => {
      toast({
        title: `😱 Withdraw Note Error`,
        description: `${extractErrorMessage(err)}`,
        status: 'error',
      })
    }
  })

  const onWithdrawSettled = () => {
    resetValues()
    setIsOverlayLoading(false)
    setIsSubmitting(false)
  }

  /* ========== TX RESPONSE HANDLERS ========== */
  useEffect(() => {
    setLoadingText(<WithTxInProgress txHash={splitData?.hash || splitByAddressData?.hash || mergeData?.hash || topUpData?.hash || withdrawData?.hash} chainId={chain?.id} />)
  }, [ setLoadingText, chain?.id, splitData?.hash, splitByAddressData?.hash, mergeData?.hash, topUpData?.hash, withdrawData?.hash ])

  const onActionClick = useCallback((action: string) => {
    setAction(() => action)
    if (action !== 'withdraw') {
      onOpen()
    } else {
      setIsSubmitting(true)
      setIsOverlayLoading(true)
      setLoadingText(<WithTxConfirmation />)
      withdraw?.()
    }
  }, [withdraw, onOpen, setIsOverlayLoading, setLoadingText])
  
  const onSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setIsOverlayLoading(true)
    setLoadingText(<WithTxConfirmation />)

    if (action === 'split') {
      if (splitToAddress) {
        splitByAddress?.()
      } else {
        split?.()
      }
    } else if (action === 'merge') {
      merge?.()
    } else if (action === 'topup') {
      topUp?.()
    }
  }, [action, splitToAddress, split, splitByAddress, merge, topUp, setIsOverlayLoading, setLoadingText])

  const getImage = useCallback(() => {
    const uri = (tokenURI as string) || note.tokenURI
    if (uri) {
      try {
        const json = Buffer.from(uri.substring(29), 'base64').toString()
        const result = JSON.parse(json)
        return result.image
      } catch(err) {
        return null
      }
    }
  }, [tokenURI, note.tokenURI])

  const isDisable = useMemo(() => {
    if (action === 'merge') {
      return !merge
    } else if (action === 'split' && splitToAddress) {
      return !splitByAddress
    } else if (action === 'split' && !splitToAddress) {
      return !split
    } else if (action === 'topup') {
      return !topUp
    }
  }, [action, splitToAddress, merge, split, splitByAddress, topUp])

  return (
    <>
      <Box maxW='sm' borderWidth='1px' borderRadius='lg' overflow='hidden'>
        <Flex p={2} pl={2} bgColor={useColorModeValue('teal.800', 'teal.200')}>
          <Image ml={`${getImage() ? 4 : 'none'}`} w={500} h={200} src={getImage()} fallbackSrc={Placeholder} />
        </Flex>

        <Box p='6' bgColor={useColorModeValue('gray.200', 'gray.800')}>
          <Box display='flex' alignItems='baseline'>
            <Badge borderRadius='full' px='2' colorScheme='teal'>
              {note.symbol}
            </Badge>
            {/* <Box
              color='gray.500'
              fontWeight='semibold'
              letterSpacing='wide'
              fontSize='xs'
              noOfLines={1}
              textTransform='uppercase'
              ml='2'
            >
            &bull; {note.notes} notes
            </Box> */}
          </Box>

          <Box
            mt='1'
            fontWeight='semibold'
            as='h4'
            lineHeight='tight'
            noOfLines={1}
            title={`${note.name} #${note.tokenId}`}
          >
            {`${note.name} #${note.tokenId}`}
          </Box>

          <Box>
            {`${utils.formatEther(note.value)} ETH`}
            <Box as='span' color='gray.600' fontSize='md'>
              &nbsp; {`$${(Number(ethInUsd) * Number(utils.formatEther(note.value))).toFixed(2)}`}
            </Box>
          </Box>

          <HStack spacing={3} justify={'space-between'} mt={5}>
            <Tooltip label="Split this note" hasArrow bg={'gray.300'} color='black'>
              <Button
                colorScheme={'cyan'}
                disabled={isSubmitting || isSpliting || isSplitingByAddress || isSplitTxLoading || isSplitByAddressTxLoading}
                onClick={() => onActionClick('split')}
              >
                <AiOutlineSplitCells size={25} />
              </Button>
            </Tooltip>

            <Tooltip label="Merge notes" hasArrow bg={'gray.300'} color='black'>
              <Button
                colorScheme={'cyan'}
                onClick={() => onActionClick('merge')}
                disabled={isMergeTxLoading || isMerging || isSubmitting}
              ><AiOutlineMergeCells size={25} /></Button>
            </Tooltip>
            <Tooltip label="Top up more funds to this note" hasArrow bg={'gray.300'} color='black'>
              <Button
                colorScheme={'cyan'}
                disabled={isTopUpLoading || isTopup || isSubmitting}
                onClick={() => onActionClick('topup')}
              ><AiOutlineUpload size={25} /></Button>
            </Tooltip>
            <Tooltip label="Withdraw funds from this note" hasArrow bg={'gray.300'} color='black'>
              <Button
                colorScheme={'cyan'}
                disabled={!withdraw || isSubmitting || isWithdrawLoading}
                onClick={() => onActionClick('withdraw')}
                isLoading={isWithdrawLoading}
                loadingText={''}
              ><AiOutlineDownload size={25} /></Button>
            </Tooltip>
          </HStack>
        </Box>
      </Box>

      <Modal
        isOpen={isOpen}
        onClose={onModalClose}
        closeOnOverlayClick={false}
      >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text casing={'capitalize'}>{action}</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {/* {
            action === 'split' && (
              <FormControl display='flex' alignItems='center' alignContent={'center'} mb={2}>
                <FormLabel mb={0}>
                  Split to Address?
                </FormLabel>
                <Switch id='split-by-tkn-id' isChecked={splitToAddress} onChange={(e: ChangeEvent<HTMLInputElement>) => setSplitToAddress(!splitToAddress)} />
              </FormControl>
            )
          } */}

          {
            (action === 'split' && splitToAddress) && (
              <FormControl>
                <FormLabel>Recipient</FormLabel>
                <Input
                  placeholder="The wallet address to receive the note"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setRecipient(e.target.value)}
                />
              </FormControl>
            )
          }

          {
            action === 'merge' && (
              <FormControl>
                <FormLabel>Token ID</FormLabel>
                <Input
                  readOnly={isSubmitting}
                  placeholder={`${action === 'merge' ? 'The tokenId to be merged to' : action === 'withdraw' ? '' : 'Token ID'}`}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setTargetTokenId(e.target.value)}
                />
              </FormControl>
            )
          }

          {
            (action === 'split' || action === 'topup') && (
              <FormControl mt={4}>
                <FormLabel>
                  <Text casing={'capitalize'}>{action} Amount</Text>
                </FormLabel>
                <InputGroup w={'100%'}>
                  <InputLeftAddon py={2}>
                    <ETHLogo height={25} />
                  </InputLeftAddon>
                  <NumberInput
                    id='amount'
                    placeholder='Please enter deposit amount'
                    defaultValue={amount}
                    min={0}
                    step={0.01}
                    w={'22rem'}
                    onChange={(value: string) => setAmount(Number(value))}
                  >
                    <NumberInputField
                      value={amount}
                      borderLeftRadius={0}
                      readOnly={isSubmitting}
                      w={'100%'}
                    />
                    {
                      !isSubmitting && (
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      )
                    }
                  </NumberInput>
                </InputGroup>
              </FormControl>
            )
          }
        </ModalBody>

        <ModalFooter>
          <Button
            mr={3}
            onClick={onModalClose}
            disabled={
              isSplitTxLoading || isSpliting || isSplitingByAddress || isSplitByAddressTxLoading
                || isSubmitting || isMergeTxLoading || isMerging || isTopUpLoading || isTopup
            }
          >Cancel</Button>
          <Button
            colorScheme='cyan'
            onClick={onSubmit}
            disabled={isSubmitting || isDisable}
            isLoading={isSubmitting}
            loadingText={'Submitting'}
          >
            <Text casing={'capitalize'}>{action}</Text>
          </Button>
        </ModalFooter>
      </ModalContent>
      </Modal>
    </>
  )
}

export default NoteBox
