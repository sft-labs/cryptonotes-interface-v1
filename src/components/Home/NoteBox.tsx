import { FC, useCallback, useState, useEffect, ChangeEvent } from 'react'
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
  Switch,
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
  const [splitByTknId, setSplitByTknId] = useState<boolean>(true)
  const [action, setAction] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const { setIsOverlayLoading, setLoadingText } = useLoading()

  const toast = useToast()
  const toastBgColor = useColorModeValue('white', 'red')
  const toastWarningBgColor = useColorModeValue('white', 'yellow.900')

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
    setSplitByTknId(true)
  }, [setAction, setAmount, setIsSubmitting, setRecipient, setSplitByTknId])

  const onModalClose = useCallback(() => {
    onClose()
    resetValues()
    setIsOverlayLoading(false)
  }, [onClose, resetValues, setIsOverlayLoading])

  /* ========== SPLIT ========== */
  const {
    config: splitConfig,
    error: splitPrepareError,
    isError: isSplitPrepareError,
  } = usePrepareContractWrite({
    address: contracts[`${chain?.id as number}`],
    abi: [
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "fromTokenId_",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "newTokenId_",
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
    ],
    functionName: 'split',
    args: [
      BigNumber.from(note.tokenId ?? '0'),
      BigNumber.from(debouncedTargetTokenId ?? '0'),
      utils.parseEther(debouncedAmount?.toString() || '0')
    ],
    enabled: action === 'split' && !!note.tokenId && !!debouncedTargetTokenId && !!debouncedAmount,
  })

  const {
    data: splitData,
    error: splitError,
    isError: isSplitError,
    write: split,
    isLoading: isSpliting
  } = useContractWrite({ ...splitConfig })
 
  const {
    isLoading: isSplitLoading,
    isSuccess: isSplitSuccess,
    isError: isSplitTxError,
    error: splitTxError
  } = useWaitForTransaction({
    hash: splitData?.hash,
    confirmations: 2,
    onSettled: () => setIsOverlayLoading(false)
  })

  const {
    config: splitByAddressConfig,
    error: splitByAddressPrepareError,
    isError: isSplitByAddressPrepareError,
  } = usePrepareContractWrite({
    address: contracts[`${chain?.id as number}`],
    abi: [
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
    ],
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
    error: splitByAddressError,
    isError: isSplitByAddressError,
    write: splitByAddress,
    isLoading: isSplitingByAddressLoading
  } = useContractWrite({ ...splitByAddressConfig })
 
  const {
    isLoading: isSplitByAddressTxLoading,
    isSuccess: isSplitByAddressTxSuccess,
    isError: isSplitByAddressTxError,
    error: splitByAddressTxError
  } = useWaitForTransaction({
    hash: splitByAddressData?.hash,
    confirmations: 2,
    onSettled: () => setIsOverlayLoading(false)
  })

  /* ========== MERGE ========== */
  const {
    config: mergeConfig,
    error: mergePrepareError,
    isError: isMergePrepareError,
  } = usePrepareContractWrite({
    address: contracts[`${chain?.id as number}`],
    abi: [
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
    ],
    functionName: 'merge',
    args: [
      BigNumber.from(note.tokenId ?? '0'),
      BigNumber.from(debouncedTargetTokenId ?? '0')
    ],
    enabled: action === 'merge' && !!debouncedTargetTokenId && !!note.tokenId,
  })

  const {
    data: mergeData,
    error: mergeError,
    isError: isMergeError,
    write: merge,
    isLoading: isMerging
  } = useContractWrite({ ...mergeConfig })
 
  const {
    isLoading: isMergeLoading,
    isSuccess: isMergeSuccess,
    isError: isMergeTxError,
    error: mergeTxError
  } = useWaitForTransaction({
    hash: mergeData?.hash,
    confirmations: 2,
    onSettled: () => setIsOverlayLoading(false)
  })

  /* ========== TOPUP ========== */
  const {
    config: topUpConfig,
    error: topUpPrepareError,
    isError: isTopUpPrepareError,
  } = usePrepareContractWrite({
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
    error: topUpError,
    isError: isTopUpError,
    write: topUp,
    isLoading: isTopup
  } = useContractWrite({ ...topUpConfig })
 
  const {
    isLoading: isTopUpLoading,
    isSuccess: isTopUpSuccess,
    isError: isTopUpTxError,
    error: topUpTxError
  } = useWaitForTransaction({
    hash: topUpData?.hash,
    confirmations: 2,
    onSettled: () => setIsOverlayLoading(false),
  })

  /* ========== WITHDRAW ========== */
  const {
    config: withdrawConfig,
    error: withdrawPrepareError,
    isError: isWithdrawPrepareError,
  } = usePrepareContractWrite({
    address: contracts[`${chain?.id as number}`],
    abi: [...CryptonotesAbi],
    functionName: 'withdraw',
    args: [note.tokenId],
    enabled: action === 'withdraw' && !!note.tokenId,
  })

  const {
    data: withdrawData,
    error: withdrawError,
    isError: isWithdrawError,
    write: withdraw,
    isLoading: isWithdrawal
  } = useContractWrite({
    ...withdrawConfig,
    request: withdrawConfig.request,
  })
 
  const {
    isLoading: isWithdrawLoading,
    isSuccess: isWithdrawSuccess,
    isError: isWithdrawTxError,
    error: withdrawTxError
  } = useWaitForTransaction({
    hash: withdrawData?.hash,
    confirmations: 2,
    onSettled: () => onWithdrawSettled(),
  })

  const onWithdrawSettled = () => {
    resetValues()
    setIsOverlayLoading(false)
  }

  /* ========== TX RESPONSE HANDLERS ========== */
  useEffect(() => {
    setLoadingText(<WithTxInProgress txHash={splitData?.hash || splitByAddressData?.hash || mergeData?.hash || topUpData?.hash || withdrawData?.hash} chainId={chain?.id} />)
  }, [
    setLoadingText, isSplitLoading, isSplitByAddressTxLoading, isMergeLoading, isTopUpLoading, isWithdrawLoading,
    chain?.id, splitData?.hash, splitByAddressData?.hash, mergeData?.hash, topUpData?.hash, withdrawData?.hash
  ])

  const getTitle = useCallback((isSplit: boolean, isMerge: boolean, isTopup: boolean, isWithdraw: boolean) => {
    return isSplit ? 'Split' : isMerge ? 'Merge' : isTopup ? 'Topup' : isWithdraw ? 'Withdraw' : ''
  }, [])

  useEffect(() => {
    if (isSplitPrepareError || isSplitByAddressPrepareError || isMergePrepareError || isTopUpPrepareError || isWithdrawPrepareError) {
      toast({
        title: `⚠️ ${getTitle(isSplitPrepareError || isSplitByAddressPrepareError, isMergePrepareError, isTopUpPrepareError, isWithdrawPrepareError)} Note Warning`,
        position: 'bottom-right',
        variant: 'left-accent',
        description: `${extractErrorMessage((splitPrepareError || splitByAddressPrepareError || mergePrepareError || topUpPrepareError || withdrawPrepareError))}`,
        status: 'warning',
        duration: 9000,
        isClosable: true,
        containerStyle: {
          background: toastWarningBgColor,
          borderRadius: '0.5rem',
        }
      })
    }
  }, [
    splitPrepareError, isSplitPrepareError, splitByAddressPrepareError, isSplitByAddressPrepareError,
    mergePrepareError, isMergePrepareError, topUpPrepareError, isTopUpPrepareError,
    withdrawPrepareError, isWithdrawPrepareError, getTitle, setIsOverlayLoading,
    toast, toastWarningBgColor, action, targetTokenId, amount
  ])

  useEffect(() => {
    if (isSplitSuccess || isMergeSuccess || isSplitByAddressTxSuccess || isTopUpSuccess || isWithdrawSuccess) {
      toast({
        title: `🎉 ${getTitle(isSplitSuccess || isSplitByAddressTxSuccess, isMergeSuccess, isTopUpSuccess, isWithdrawSuccess)} Note Success`,
        position: 'bottom-right',
        variant: 'left-accent',
        description: `Your transaction get mined successfully`,
        status: 'success',
        duration: 9000,
        isClosable: true,
      })
      onModalClose()
      reexecuteQuery({ requestPolicy: 'network-only' })
    }
  }, [isSplitSuccess, isSplitByAddressTxSuccess, isMergeSuccess, isTopUpSuccess, isWithdrawSuccess, toast, getTitle, onModalClose, reexecuteQuery])

  useEffect(() => {
    if (isSplitError || isSplitTxError || isSplitByAddressError || isSplitByAddressTxError || isMergeError || isMergeTxError
       || isTopUpError || isTopUpTxError || isWithdrawError || isWithdrawTxError) {
      toast({
        title: `😱 ${getTitle(isSplitError || isSplitTxError || isSplitByAddressError || isSplitByAddressTxError, isMergeError || isMergeTxError, isTopUpError || isTopUpTxError, isWithdrawError || isWithdrawTxError)} Note Error`,
        position: 'bottom-right',
        variant: 'left-accent',
        description: `${extractErrorMessage(splitError || splitTxError || splitByAddressError || splitByAddressTxError || mergeError || mergeTxError || topUpError || topUpTxError || withdrawError || withdrawTxError)}`,
        status: 'error',
        duration: 9000,
        isClosable: true,
        containerStyle: {
          background: toastBgColor,
          borderRadius: '0.5rem',
        }
      })
      setIsOverlayLoading(false)
      setIsSubmitting(false)
    }
  }, [
    splitError,
    isSplitError,
    splitTxError,
    isSplitTxError,
    splitByAddressError,
    isSplitByAddressError,
    splitByAddressTxError,
    isSplitByAddressTxError,
    mergeError,
    isMergeError,
    mergeTxError,
    isMergeTxError,
    topUpError,
    isTopUpError,
    topUpTxError,
    isTopUpTxError,
    withdrawError,
    isWithdrawError,
    withdrawTxError,
    isWithdrawTxError,
    toast,
    toastBgColor,
    getTitle,
    setIsOverlayLoading,
  ])

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
      if (!splitByTknId) {
        splitByAddress?.()
      } else {
        split?.()
      }
    } else if (action === 'merge') {
      merge?.()
    } else if (action === 'topup') {
      topUp?.()
    }
  }, [action, splitByTknId, split, splitByAddress, merge, topUp, setIsOverlayLoading, setLoadingText])

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
                disabled={isSubmitting || isSpliting || isSplitLoading}
                onClick={() => onActionClick('split')}
              >
                <AiOutlineSplitCells size={25} />
              </Button>
            </Tooltip>

            <Tooltip label="Merge notes" hasArrow bg={'gray.300'} color='black'>
              <Button
                colorScheme={'cyan'}
                onClick={() => onActionClick('merge')}
                disabled={isMergeLoading || isMerging || isSubmitting}
              ><AiOutlineMergeCells size={25} /></Button>
            </Tooltip>
            <Tooltip label="Top up more funds to this note" hasArrow bg={'gray.300'} color='black'>
              <Button
                colorScheme={'cyan'}
                disabled={isTopUpLoading || isTopup || isSubmitting}
                onClick={() => onActionClick('topup')}
              ><AiOutlineDownload size={25} /></Button>
            </Tooltip>
            <Tooltip label="Withdraw funds from this note" hasArrow bg={'gray.300'} color='black'>
              <Button
                colorScheme={'cyan'}
                disabled={isSubmitting || isWithdrawLoading || isWithdrawal}
                onClick={() => onActionClick('withdraw')}
                isLoading={isWithdrawLoading || isWithdrawal}
                loadingText={''}
              ><AiOutlineUpload size={25} /></Button>
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
          {
            action === 'split' && (
              <FormControl display='flex' alignItems='center' alignContent={'center'} mb={2}>
                <FormLabel mb={0}>
                  Split By TokenId?
                </FormLabel>
                <Switch id='split-by-tkn-id' isChecked={splitByTknId} onChange={(e: ChangeEvent<HTMLInputElement>) => setSplitByTknId(!splitByTknId)} />
              </FormControl>
            )
          }

          {
            (action === 'split' && !splitByTknId) && (
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
            (action === 'merge' || action === 'withdraw' || (action === 'split' && splitByTknId)) ? (
              <FormControl>
                <FormLabel>Token ID</FormLabel>
                <Input
                  readOnly={isSubmitting}
                  placeholder={`${action === 'merge' ? 'The tokenId to be merged to' : action === 'withdraw' ? '' : 'Token ID'}`}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setTargetTokenId(e.target.value)}
                />
              </FormControl>
            ) : ''
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
              isSubmitting || isSplitLoading || isSpliting || isMergeLoading || isMerging
              || isTopUpLoading || isTopup || isWithdrawLoading || isWithdrawal
            }
          >Cancel</Button>
          <Button
            colorScheme='cyan'
            onClick={onSubmit}
            disabled={
              isSubmitting || isSplitLoading || isSpliting || isSplitingByAddressLoading || isSplitByAddressTxLoading || isMergeLoading || isMerging
              || isTopUpLoading || isTopup || isWithdrawLoading || isWithdrawal
            }
            isLoading={
              isSubmitting || isSplitLoading || isSpliting || isSplitingByAddressLoading || isSplitByAddressTxLoading || isMergeLoading || isMerging
              || isTopUpLoading || isTopup || isWithdrawLoading || isWithdrawal
            }
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
