import React from 'react';

import type { Transaction, TransactionType } from 'types/api/transaction';

import Tag from 'ui/shared/chakra/Tag';

import { camelCaseToSentence } from './noves/utils';
import TxType from './TxType';

export interface Props {
  tx: Transaction;
  types: Array<TransactionType>;
  isLoading?: boolean;
  translatationType: string | undefined;
}

const TxTranslationType = ({ tx, types, isLoading, translatationType }: Props) => {

  const filteredTypes = [ 'unclassified' ];

  if (!translatationType || filteredTypes.includes(translatationType)) {
    return <TxType tx={ tx } types={ types } isLoading={ isLoading }/>;
  }

  return (
    <Tag colorScheme="purple" isLoading={ isLoading }>
      { camelCaseToSentence(translatationType) }
    </Tag>
  );

};

export default TxTranslationType;
