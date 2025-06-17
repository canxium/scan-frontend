import React from 'react';

import type { Transaction, TransactionType } from 'types/api/transaction';

import Tag from 'ui/shared/chakra/Tag';

export interface Props {
  tx: Transaction;
  types: Array<TransactionType>;
  isLoading?: boolean;
}

const TYPES_ORDER: Array<TransactionType> = [
  'blob_transaction',
  'rootstock_remasc',
  'rootstock_bridge',
  'token_creation',
  'contract_creation',
  'token_transfer',
  'contract_call',
  'coin_transfer',
];

const TxType = ({ tx, types, isLoading }: Props) => {
  let label;
  let colorScheme;

  if (tx.type == 126) {
    label = 'Cross-Chain Mining';
    colorScheme = 'green';
  } else if (tx.type == 3) {
    label = 'Retained Mining';
    colorScheme = 'red';
  } else {
    const typeToShow = types.sort((t1, t2) => TYPES_ORDER.indexOf(t1) - TYPES_ORDER.indexOf(t2))[0];
    switch (typeToShow) {
      case 'contract_call':
        label = 'Contract call';
        colorScheme = 'blue';
        break;
      case 'blob_transaction':
        label = 'Retained Mining';
        colorScheme = 'red';
        break;
      case 'contract_creation':
        label = 'Contract creation';
        colorScheme = 'blue';
        break;
      case 'token_transfer':
        label = 'Token transfer';
        colorScheme = 'orange';
        break;
      case 'token_creation':
        label = 'Token creation';
        colorScheme = 'orange';
        break;
      case 'coin_transfer':
        label = 'Coin transfer';
        colorScheme = 'orange';
        break;
      case 'rootstock_remasc':
        label = 'REMASC';
        colorScheme = 'blue';
        break;
      case 'rootstock_bridge':
        label = 'Bridge';
        colorScheme = 'blue';
        break;
      default:
        label = 'Transaction';
        colorScheme = 'purple';
    }
  }

  return (
    <Tag colorScheme={ colorScheme } isLoading={ isLoading }>
      { label }
    </Tag>
  );
};

export default TxType;
