import { Box, SimpleGrid, usePrevious } from '@chakra-ui/react'
import { utils } from 'ethers'
import { FC, useEffect, useMemo } from 'react'
import { useQuery } from 'urql'
import { useAccount, useContractRead, useNetwork } from 'wagmi'
import Note from '../../types/note'
import { aggregatorV3InterfaceABI } from '../../utils/abis'
import { getSubgraphUrl, queryNotesByAddress } from '../../utils/subgraphQuery'
import { CardLoadingSkeleton } from '../CardLoadingSkeleton'
import MintDrawer from './MintDrawer'
import NoteBox from './NoteBox'
import { contracts } from '../../utils/contracts'

interface MyCryptonotesProps {
  isOpen: boolean
  onClose: () => void
}

const MyCryptonotes: FC<MyCryptonotesProps> = ({ isOpen, onClose }) => {
  const { address } = useAccount()
  const { chain } = useNetwork()

  const { data: priceData } = useContractRead({
    address: contracts[`${chain?.id as number}`].oracle,
    abi: aggregatorV3InterfaceABI,
    functionName: 'latestRoundData',
  })
  
  const [result, reexecuteQuery] = useQuery({
    query: queryNotesByAddress,
    variables: {
      owner: address,
    },
    context: useMemo(() => ({
      url: getSubgraphUrl(),
      requestPolicy: 'cache-and-network',
    }), []),
  })
  const { data, fetching } = result

  const prevChainId = usePrevious(chain?.id)
  useEffect(() => {
    if (prevChainId && chain?.id && prevChainId !== chain?.id) {
      window.location.reload()
    } else if (!prevChainId && chain?.id) {
      reexecuteQuery({ requestPolicy: 'network-only' })
    }
  }, [prevChainId, chain?.id, reexecuteQuery])
  
  return (
    <>
      {
        fetching ? <CardLoadingSkeleton/> : (!data?.notes || data?.notes.length === 0) ? (
          <Box mt={8}>No data found</Box>
        ) : (
          <SimpleGrid justifyContent={'center'} columns={{ base: 1, sm: 2, lg: 2, xl: 4 }} spacing={3} py={3} px={5}>
            {
              (data?.notes ?? [] as Note[]).map((note: Note) => (
                <NoteBox key={note.id} ethInUsd={utils.formatUnits((priceData as any)?.answer || '0', 8)} note={note} reexecuteQuery={reexecuteQuery} />
              ))
            }
          </SimpleGrid>
        )
      }

      {
        isOpen ? <MintDrawer onClose={onClose} isOpen={isOpen} reexecuteQuery={reexecuteQuery} /> : ''
      }
    </>
  )
}

export default MyCryptonotes
