import { createContext, useContext } from 'react'

export const LoadingContext = createContext({
  // isOverlayLoading: false,
  // loadingText: '',
  setIsOverlayLoading: (isLoading: boolean) => {},
  setLoadingText: (text: any) => {},
})

export const useLoading = () => useContext(LoadingContext)
