import { Grid } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import React from 'react';

import config from 'configs/app';
import useApiQuery from 'lib/api/useApiQuery';
import { WEI } from 'lib/consts';
import { HOMEPAGE_STATS } from 'stubs/stats';
import GasInfoTooltip from 'ui/shared/gas/GasInfoTooltip';
import GasPrice from 'ui/shared/gas/GasPrice';
import IconSvg from 'ui/shared/IconSvg';
import type { Props as StatsWidgetProps } from 'ui/shared/stats/StatsWidget';
import StatsWidget from 'ui/shared/stats/StatsWidget';
import next from 'next';

const hasAvgBlockTime = config.UI.homepage.showAvgBlockTime;
const rollupFeature = config.features.rollup;

const validator24hReward = async function(blockNum: number | undefined) {
  const raw = JSON.stringify({
    "jsonrpc": "2.0",
    "method": "eth_call",
    "params": [
      {
        "to": "0x6c6331CA2BC039996E833479b7c13Cc62Ab5c6BA",
        "data": "0x5e1c1516"
      },
      blockNum ? '0x' + blockNum.toString(16) : "latest"
    ],
    "id": 1
  });

  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw
  };

  const response = await fetch("https://archive-rpc.canxium.org", requestOptions);
  const { result } = await response.json()
  return result
}

const KaspaCrossMiningBaseRewards = [
  183829, 91915, 45958, 25868, 23963, 23254, 22566, 21898, 21249, 20620,
  20010, 19418, 18843, 18285, 17744, 17219, 16709, 16214, 15734, 15269,
  14817, 14378, 13953, 13540, 13139, 12750, 12372, 12006, 11651, 11306,
  10971, 10647, 10331, 10026, 9729, 9441, 9161, 8890, 8627, 8372,
  8124, 7883, 7650, 7424, 7204, 6991, 6784, 6583, 6388, 6199,
  6016, 5838, 5665, 5497, 5334, 5176, 5023, 4875, 4730, 4590,
  4454, 4323, 4195, 4070, 3950, 3833, 3720, 3610, 3503, 3399,
  3298, 3201, 3106, 3014, 2925, 2838, 2754, 2673, 2594, 2517,
  2442, 2370, 2300, 2232, 2166, 2102, 2040, 1979, 1921, 1864,
  1809, 1755, 1703, 1653, 1604, 1556, 1510, 1466, 1422, 1380,
  1339, 1300, 1261, 1224, 1188, 1153, 1119, 1085, 1053, 1022,
  992, 963, 934, 906, 880, 854, 828, 804, 780, 757,
  735, 713, 692, 671, 651, 632, 613, 595, 578, 561,
  544, 528, 512, 497, 482, 468, 454, 441, 428, 415,
  403, 400
];

const KaspaPhaseThreeMonth = KaspaCrossMiningBaseRewards.length - 1;

function timePassedSinceFork(forkTime, currentTime) {
  if (currentTime < forkTime) return { dayNum: 0, month: 0 };

  const dayNum = Math.floor((currentTime - forkTime) / (24 * 60 * 60 * 1000));
  const month = Math.floor((currentTime - forkTime) / (30 * 24 * 60 * 60 * 1000));
  
  return { dayNum, month };
}

function getNextBaseReward(forkTime) {
  const now = Date.now();
  const { month } = timePassedSinceFork(forkTime, now);
  const rewardWei = month < KaspaPhaseThreeMonth ? KaspaCrossMiningBaseRewards[month] : KaspaCrossMiningBaseRewards[KaspaPhaseThreeMonth];
  
  // Convert from Wei per 1,000,000 difficulty to CAU per 1 EH difficulty
  const rewardCAU = (rewardWei / 1e6) + " CAU"; // Scaling up to 1 EH
  return rewardCAU;
}


const validatorStakeCau = async function() {
  const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  };

  const response = await fetch("https://epoch.canxium.org/index/data", requestOptions);
  const result = await response.json()
  return result.eligible
}

const lastestBlockNum = async function() {
  const raw = JSON.stringify({
    "jsonrpc": "2.0",
    "method": "eth_getBlockByNumber",
    "params": [
      "latest",
      false
    ],
    "id": 1
  });

  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw
  };

  const response = await fetch("https://rpc.canxium.org", requestOptions)
  const body = await response.json()
  const { result } = body
  const number = parseInt(result.number, 16)
  return number
}

function timeUntilNextReduction() {
  const forkTime = 1740787200 * 1000; // Convert to milliseconds
  const reductionInterval = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
  const now = Date.now();
  
  // Calculate how many reductions have passed since fork time
  const elapsed = now - forkTime;
  const periodsPassed = Math.floor(elapsed / reductionInterval);
  
  // Calculate next reduction time
  const nextReductionTime = forkTime + (periodsPassed + 1) * reductionInterval;
  const timeLeft = nextReductionTime - now;
  
  // Convert to days and hours
  const daysLeft = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
  const hoursLeft = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  
  return daysLeft > 0 ? `${daysLeft} Days` : `${hoursLeft} Hours`;
}

const Stats = () => { 
  console.log(timeUntilNextReduction());
  console.log(getNextBaseReward(1740787200 * 1000));
  const [ hasGasTracker, setHasGasTracker ] = React.useState(config.features.gasTracker.isEnabled);
  const [ cau30dEmission, set30dEmission ] = React.useState('');
  const [ validator24hAPY, setvalidator24hAPY ] = React.useState('');
  // const [ isQueried, setIsQueried ] = React.useState(false);
  const heliumFork = 1740787200;
  const { data, isPlaceholderData, isError, dataUpdatedAt } = useApiQuery('stats', {
    queryOptions: {
      refetchOnMount: false,
      placeholderData: HOMEPAGE_STATS,
    },
  });

  React.useEffect((() => {
    let load = async () => {
      const latestBlockNum = await lastestBlockNum();
      let currentValidatorReward = BigInt(0);

      try {
        const validator24h = BigInt(await validator24hReward(latestBlockNum - 14400));
        let stakedCAU = BigInt(await validatorStakeCau());
        stakedCAU = stakedCAU / BigInt(1e9);
        let rewardIn24h = currentValidatorReward - validator24h;
        rewardIn24h = rewardIn24h / BigInt(1e18);

        let APY = BigInt(100 * 365) * rewardIn24h / stakedCAU;
        setvalidator24hAPY(APY.toString())
      } catch (error) {
        console.log('Failed to get 24h emission')
      }
    }
    load()
  }), [])

  React.useEffect(() => {
    if (!isPlaceholderData && !data?.gas_prices?.average) {
      setHasGasTracker(false);
    }
  // should run only after initial fetch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ isPlaceholderData ]);

  const zkEvmLatestBatchQuery = useApiQuery('homepage_zkevm_latest_batch', {
    queryOptions: {
      placeholderData: 12345,
      enabled: rollupFeature.isEnabled && rollupFeature.type === 'zkEvm',
    },
  });

  const zkSyncLatestBatchQuery = useApiQuery('homepage_zksync_latest_batch', {
    queryOptions: {
      placeholderData: 12345,
      enabled: rollupFeature.isEnabled && rollupFeature.type === 'zkSync',
    },
  });

  const arbitrumLatestBatchQuery = useApiQuery('homepage_arbitrum_latest_batch', {
    queryOptions: {
      placeholderData: 12345,
      enabled: rollupFeature.isEnabled && rollupFeature.type === 'arbitrum',
    },
  });

  if (isError || zkEvmLatestBatchQuery.isError || zkSyncLatestBatchQuery.isError || arbitrumLatestBatchQuery.isError) {
    return null;
  }

  const isLoading = isPlaceholderData ||
    (rollupFeature.isEnabled && rollupFeature.type === 'zkEvm' && zkEvmLatestBatchQuery.isPlaceholderData) ||
    (rollupFeature.isEnabled && rollupFeature.type === 'zkSync' && zkSyncLatestBatchQuery.isPlaceholderData) ||
    (rollupFeature.isEnabled && rollupFeature.type === 'arbitrum' && arbitrumLatestBatchQuery.isPlaceholderData);

  const content = (() => {
    if (!data) {
      return null;
    }
    const gasInfoTooltip = hasGasTracker && data.gas_prices && data.gas_prices.average ? (
      <GasInfoTooltip data={ data } dataUpdatedAt={ dataUpdatedAt }>
        <IconSvg
          isLoading={ isLoading }
          name="info"
          boxSize={ 5 }
          flexShrink={ 0 }
          cursor="pointer"
          color="icon_info"
          _hover={{ color: 'link_hovered' }}
        />
      </GasInfoTooltip>
    ) : null;

    const hasBatches = rollupFeature.isEnabled && (rollupFeature.type === 'zkEvm' || rollupFeature.type === 'zkSync' || rollupFeature.type === 'arbitrum');
    const latestBatch =
      (hasBatches && rollupFeature.type === 'zkEvm' ? zkEvmLatestBatchQuery.data : null) ||
      (hasBatches && rollupFeature.type === 'zkSync' ? zkSyncLatestBatchQuery.data : null) ||
      (hasBatches && rollupFeature.type === 'arbitrum' ? arbitrumLatestBatchQuery.data : null) || 0;

    const items: Array<StatsWidgetProps> = [
      hasBatches && {
        icon: 'txn_batches_slim' as const,
        label: 'Latest batch',
        value: latestBatch.toLocaleString(),
        href: { pathname: '/batches' as const },
        isLoading,
      },
      !hasBatches && {
        icon: 'block_slim' as const,
        label: 'Total blocks',
        value: Number(data.total_blocks).toLocaleString(),
        href: { pathname: '/blocks' as const },
        isLoading,
      },
      hasAvgBlockTime && {
        icon: 'clock-light' as const,
        label: 'Average block time',
        value: `${ (data.average_block_time / 1000).toFixed(1) }s`,
        isLoading,
      },
      {
        icon: 'transactions_slim' as const,
        label: 'Total transactions',
        value: Number(data.total_transactions).toLocaleString(),
        href: { pathname: '/txs' as const },
        isLoading,
      },
      rollupFeature.isEnabled && data.last_output_root_size && {
        icon: 'txn_batches_slim' as const,
        label: 'Latest L1 state batch',
        value: data.last_output_root_size,
        href: { pathname: '/batches' as const },
        isLoading,
      },
      {
        icon: 'wallet' as const,
        label: 'Wallet addresses',
        value: Number(data.total_addresses).toLocaleString(),
        isLoading,
      },
      {
        icon: 'token' as const,
        label: 'Next Reduction',
        value: timeUntilNextReduction(),
        isLoading,
      },
      {
        icon: 'token' as const,
        label: 'Next Reward / EH',
        value: getNextBaseReward(1740787200 * 1000) + " CAU",
        isLoading,
      },
      {
        icon: 'token' as const,
        label: 'Validator Live APY',
        value: validator24hAPY + " %",
        isLoading,
      },
      hasGasTracker && data.gas_prices && {
        icon: 'gas' as const,
        label: 'Gas tracker',
        value: data.gas_prices.average ? <GasPrice data={ data.gas_prices.average }/> : 'N/A',
        hint: gasInfoTooltip,
        isLoading,
      },
      data.rootstock_locked_btc && {
        icon: 'coins/bitcoin' as const,
        label: 'BTC Locked in 2WP',
        value: `${ BigNumber(data.rootstock_locked_btc).div(WEI).dp(0).toFormat() } RBTC`,
        isLoading,
      },
      data.celo && {
        icon: 'hourglass' as const,
        label: 'Current epoch',
        value: `#${ data.celo.epoch_number }`,
        isLoading,
      },
    ].filter(Boolean);

    return (
      <>
        { items.map((item, index) => (
          <StatsWidget
            key={ item.icon }
            { ...item }
            isLoading={ isLoading }
            _last={ items.length % 2 === 1 && index === items.length - 1 ? { gridColumn: 'span 2' } : undefined }/>
        ),
        ) }
      </>
    );
  })();

  return (
    <Grid
      gridTemplateColumns="1fr 1fr"
      gridGap={{ base: 1, lg: 2 }}
      flexBasis="50%"
      flexGrow={ 1 }
    >
      { content }
    </Grid>

  );
};

export default Stats;
