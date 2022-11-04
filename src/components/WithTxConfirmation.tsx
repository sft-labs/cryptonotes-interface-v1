import { FC } from 'react'
import { Box, Text } from '@chakra-ui/react'

interface Props {
  numOfTxs?: number
  children?: any
}

const WithTxConfirmation: FC<Props> = ({ children, numOfTxs }) => {
  return (
    <Box textAlign={'center'}>
      <Text fontSize={'x-large'}>Waiting For Confirmation</Text>
      <Text pt={2}>
         {`Please check your wallet and confirm the ${numOfTxs && numOfTxs > 1 ? numOfTxs + ' transactions' : 'transaction'}`}.
      </Text>
      { children }
    </Box>
  );
}

export default WithTxConfirmation
