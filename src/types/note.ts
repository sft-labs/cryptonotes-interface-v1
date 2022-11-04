interface Note {
  id: string
  tokenId: string
  slot: number
  name: string
  description: string
  value: string
  owner: string
  underlyingAsset: string
  tokenURI: string
  image?: string
  owns?: number
  symbol: string
}

export default Note
