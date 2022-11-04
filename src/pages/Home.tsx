import { Button, HStack, useDisclosure, VStack } from '@chakra-ui/react'
import { HomeHeader, MyCryptonotes } from '../components/Home'

const Home = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  return (
    <>
      <VStack spacing={8}>
        <HomeHeader />
        
        <HStack>
          <Button
            colorScheme={'cyan'}
            minW={200}
            onClick={() => onOpen()}
          >Mint a note</Button>
        </HStack>

        <MyCryptonotes isOpen={isOpen} onClose={onClose} />
      </VStack>
    </>
  )
}

export default Home
