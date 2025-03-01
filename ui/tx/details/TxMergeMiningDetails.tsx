import { Box, Text, Link } from '@chakra-ui/react';
import React from 'react';

import * as DetailsInfoItem from 'ui/shared/DetailsInfoItem';
import TextSeparator from 'ui/shared/TextSeparator';
import BigNumber from 'bignumber.js';
import chain from 'configs/app/chain';

type Props = {
  chainName: string | undefined;
  miner: string | undefined;
  blockHash: string | undefined;
  algorithm: string | undefined;
  difficulty: string | undefined;
  nonce: string | undefined;
}

const TxMergeMiningDetails = ({ chainName, miner, blockHash, algorithm, difficulty, nonce }: Props) => {
  const valueBn = new BigNumber(difficulty || "0x0");
  const valueCurr = valueBn.dividedBy(1000000000000000);
  return (
    <>
      <DetailsInfoItem.Label
        hint="Other data related to this transaction"
      >
        Cross Mining:
      </DetailsInfoItem.Label>
      <DetailsInfoItem.Value>
        {
          [
            <Box key="miningChain">
              <Text as="span" fontWeight="500">Chain: </Text>
              <Text fontWeight="600" as="span">{chainName}</Text>
            </Box>,
            <Box key="miningDifficulty">
              <Text as="span" fontWeight="500">Difficulty: </Text>
              <Text fontWeight="600" as="span">{ valueCurr.toString() } PH</Text>
            </Box>,
            <Box key="powNonce">
              <Text as="span" fontWeight="500">Nonce: </Text>
              <Text fontWeight="600" as="span">{ nonce }</Text>
            </Box>,
            <Box key="powNonce">
              <Text as="span" fontWeight="500">Block Hash: </Text>
              <Link href={ blockHash ? chain.kaspaScan + "/blocks/" + blockHash : "" }>{ blockHash }</Link>
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

export default TxMergeMiningDetails;
