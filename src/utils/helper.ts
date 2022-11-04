export const shortWalletAddress = (address?: string, length = 4) => {
  return address ? `${address.slice(0, length + 2)}...${address.slice(-length)}` : ''
}

export const shortenIfTransactionHash = (hash?: string, length = 4) => {
  return hash ? `${hash.slice(0, length + 2)}...${hash.slice(-length)}` : hash
}

export const extractErrorMessage = (error: any) => {
  if (error?.reason) {
    return error?.reason
  } else if (error?.error?.message) {
    return error?.error?.message
  } else if (error?.message) {
    return error?.message
  } else if (error?.name) {
    return error?.name
  }
  return error
}
