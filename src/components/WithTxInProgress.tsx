import { FC } from 'react'
import { Box, Text, Link, Code } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { chain, etherscanBlockExplorers } from 'wagmi'
import { shortenIfTransactionHash } from '../utils/helper'

interface Props {
  txHash?: string
  chainId?: number
}

const WithTxInProgress: FC<Props> = ({ txHash, chainId }) => {
  const getExplorerTransactionLink = () => {
    if (!chainId) return ''

    if (chainId === chain.polygonMumbai.id) {
      return `${etherscanBlockExplorers.polygonMumbai.url}/tx/${txHash}`
    } else {
      return `${etherscanBlockExplorers.goerli.url}/tx/${txHash}`
    }
  }

  return (
    <Box textAlign={'center'}>
      <Text fontSize={'x-large'}>Transaction in Progress</Text>
      <Text pt={2}>Please wait while the transaction is processing</Text>
      {
        txHash ? (
          <Box pt={10}>
            <Text>Your transaction hash:</Text>
            <Link
              isExternal={true}
              href={`${getExplorerTransactionLink()}`}
            >
              <Code px={2} bgColor={'gray.200'} color={'black'} rounded={'sm'}>
                { shortenIfTransactionHash(txHash) }<ExternalLinkIcon pl={1} />
              </Code>
            </Link>
          </Box>
        ) : ''
      }
    </Box>
  );
}

export default WithTxInProgress
