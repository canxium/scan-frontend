import { Box, Text } from '@chakra-ui/react';
import React from 'react';

import * as DetailsInfoItem from 'ui/shared/DetailsInfoItem';
import TextSeparator from 'ui/shared/TextSeparator';
import BigNumber from 'bignumber.js';

type Props = {
  algorithm: string | undefined;
  difficulty: string | undefined;
  digest: string | undefined;
  nonce: string | undefined;
}

const TxMiningDetails = ({ algorithm, difficulty, digest, nonce }: Props) => {
  const valueBn = new BigNumber(difficulty || "0x0");
  const valueCurr = valueBn.dividedBy(1000000000000);
  return (
    <>
      <DetailsInfoItem.Label
        hint="Other data related to this transaction"
      >
        Mining Details:
      </DetailsInfoItem.Label>
      <DetailsInfoItem.Value>
        {
          [
            <Box key="miningAlgorithm">
              <Text as="span" fontWeight="500">Algorithm: </Text>
              <Text fontWeight="600" as="span">Ethash</Text>
            </Box>,
            <Box key="miningDifficulty">
              <Text as="span" fontWeight="500">Difficulty: </Text>
              <Text fontWeight="600" as="span">{ valueCurr.toString() } TH</Text>
            </Box>,
            <Box key="powNonce">
              <Text as="span" fontWeight="500">Nonce: </Text>
              <Text fontWeight="600" as="span">{ nonce }</Text>
            </Box>,
          ]
            .filter(Boolean)
            .map((item, index) => (
              <>
                { index !== 0 && <TextSeparator/> }
                { item }
              </>
            ))
        }
      </DetailsInfoItem.Value>
    </>
  );
};

export default TxMiningDetails;
