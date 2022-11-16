import { FC } from 'react'
import { Box, SimpleGrid, Skeleton, SkeletonText } from '@chakra-ui/react'

interface CardLoadingSkeletonProps {
  counts?: number[]
}
export const CardLoadingSkeleton: FC<CardLoadingSkeletonProps> = ({ counts= [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }) => {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 2, xl: 4 }} spacing={3} py={3} px={5}>
      {
        counts.map((v) => {
          return (
            <Box
              key={v}
              borderWidth='1px'
              w={'sm'}
              borderRadius='lg'
              p={5}
            >
              <Skeleton lineHeight={15} borderRadius="lg">&nbsp;</Skeleton>
              <SkeletonText mt='5' noOfLines={2} spacing='5' />
            </Box>
          )
        })
      }
    </SimpleGrid>
  );
}
