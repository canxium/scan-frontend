import React from 'react';

import TestnetWarning from 'ui/shared/alerts/TestnetWarning';
import DataFetchAlert from 'ui/shared/DataFetchAlert';

import TxInfo from './details/TxInfo';
import type { TxQuery } from './useTxQuery';
import { MiningTxQuery } from 'ui/tx/useMiningTxQuery';

interface Props {
  txQuery: TxQuery;
  miningTxQuery: MiningTxQuery;
}

const TxDetails = ({ txQuery, miningTxQuery }: Props) => {
  if (txQuery.isError) {
    return <DataFetchAlert/>;
  }

  return (
    <>
      <TestnetWarning mb={ 6 } isLoading={ txQuery.isPlaceholderData }/>
      <TxInfo data={ txQuery.data } miningData={ miningTxQuery.data } isLoading={ txQuery.isPlaceholderData } socketStatus={ txQuery.socketStatus }/>
    </>
  );
};

export default React.memo(TxDetails);
