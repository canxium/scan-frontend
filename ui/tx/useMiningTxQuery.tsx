import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import type { ResourceError } from 'lib/api/resources';
import chain from 'configs/app/chain';

const getMiningTransaction = async function(hash: string) {
  const raw = JSON.stringify({
    "jsonrpc": "2.0",
    "method": "eth_getTransactionByHash",
    "params": [hash],
    "id": 1
  });

  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw
  };

  const response = await fetch(chain.rpcUrl || chain.archiveRpcUrl || "", requestOptions);
  /* tslint:disable-next-line */
  const { result } = await response.json()
  return result
}

export type MiningTxData = {
  isMerge: boolean;
  mergeChain: string;
  mergeBlockHash: string;
  mergeMiner: string;
  algorithm: string;
  difficulty: string;
  mixDigest: string;
  powNonce: string;
};
 

export type MiningTxQuery = UseQueryResult<MiningTxData, ResourceError<{ status: number }>> & {
  isDegradedData: boolean;
};

interface Params {
  hash: string;
}

export default function useMiningTxQuery({ hash }: Params): MiningTxQuery {
  const rpcQuery = useQuery<MiningTxData, unknown, MiningTxData | null>({
    queryKey: [ 'RPC', 'transaction', { hash } ],
    queryFn: async() => {
      let tx = await getMiningTransaction(hash);
      let raw: MiningTxData = {
        isMerge: tx.type == "0x7e",
        mergeChain: "",
        mergeBlockHash: "",
        mergeMiner: "",
        algorithm: tx.algorithm,
        difficulty: tx.difficulty,
        mixDigest: tx.mixDigest,
        powNonce: tx.powNonce,
      };

      if (raw.isMerge) {
        raw.mergeChain = tx.auxPoW.chain == "0x1" ? "Kaspa" : "Unknown"
        raw.mergeBlockHash = tx.auxPoW.hash
        raw.mergeMiner = tx.auxPoW.miner
      }

      return raw;
    },
    select: (transaction) => {
      if (!transaction) {
        return null;
      }

      return transaction;
    },
    enabled: true,
    retry: false,
    refetchOnMount: false,
  });

  const isRpcQuery = Boolean(rpcQuery.data);
  const query = rpcQuery as UseQueryResult<MiningTxData, ResourceError<{ status: number }>>;

  return {
    ...query,
    isDegradedData: isRpcQuery,
  };
}
