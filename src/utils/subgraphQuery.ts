import { Client, cacheExchange, createClient, fetchExchange, dedupExchange } from 'urql'
import { refocusExchange } from '@urql/exchange-refocus'

export const queryNotesByAddress = `
  query ($owner: String!) {
    notes (where: {owner: $owner}) {
      id
      tokenId
      slot
      name
      description
      value
      owns
      symbol
      tokenURI
    }
  }
`

const SUBGRAPH_HOSTED_URL = process.env.REACT_APP_THE_GRAPH_HOSTED_URL || ''

export const makeGraphClient = (): Client => {
  return createClient({
    url: getSubgraphUrl(),
    requestPolicy: 'cache-and-network',
    exchanges: [
      dedupExchange,
      refocusExchange(),
      cacheExchange,
      fetchExchange
    ]
  })
}

export const getSubgraphUrl = (): string => {
  return `${SUBGRAPH_HOSTED_URL}/notes-graph`
}
