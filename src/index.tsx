import { ColorModeScript } from '@chakra-ui/react'
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { WagmiConfig, createClient, chain, configureChains } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { ConnectKitProvider, getDefaultClient } from 'connectkit'
import { publicProvider } from 'wagmi/providers/public'
import { Provider as GraphProvider } from 'urql'
import { App } from './App'
import reportWebVitals from './reportWebVitals'
import * as serviceWorker from './serviceWorker'
import { makeGraphClient } from './utils/subgraphQuery'

const container = document.getElementById('root')
if (!container) throw new Error('Failed to find the root element');
const root = ReactDOM.createRoot(container)

const testnets = [chain.goerli] // , chain.polygonMumbai
// const mainnets = [chain.mainnet, chain.polygon]
const supportedChains = testnets // process.env.NODE_ENV === 'production' ? mainnets : testnets

const { chains, provider } = configureChains(
  supportedChains,
  [
    // alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_ID || '' }),
    publicProvider(),
  ]
)

const client = createClient(
  getDefaultClient({
    appName: 'ETH Commemorative Cryptonotes',
    alchemyId: process.env.REACT_APP_ALCHEMY_ID || '',
    chains,
    provider,
  }),
)

root.render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <ConnectKitProvider>
        <GraphProvider value={makeGraphClient()}>
          <ColorModeScript />
          <App />
        </GraphProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  </React.StrictMode>,
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.unregister()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

