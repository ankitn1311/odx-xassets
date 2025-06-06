import { useRecentTrades } from './queries/useRecentTrades';
// import { useQueryClient } from '@tanstack/react-query';
// import { ethers } from 'ethers';
// import { useWalletClient } from 'wagmi';
// import { DEX_ADDRESS } from '@/lib/constants';
// import { useEffect } from 'react';
// import { useSearchParams } from 'next/navigation';

export const useCurrentTradeUpdateWS = (type: 'token' | 'user') => {
  // const { data: walletClient } = useWalletClient();
  // const queryClient = useQueryClient();
  const { data: trades, isLoading: tradesLoading } = useRecentTrades(type);
  // const params = useSearchParams();
  // const token = params.get('token');

  // useEffect(() => {
  //   const ws = new WebSocket('wss://sonic.callstaticrpc.com');

  //   const handleSwap = (
  //     user: string,
  //     tokenIn: string,
  //     tokenOut: string,
  //     amountIn: string,
  //     amountOut: string,
  //     transactionHash: string,
  //     blockNumber: number,
  //     timestamp: number
  //   ) => {
  //     const newTrade = {
  //       transactionHash,
  //       blockNumber,
  //       timestamp: timestamp * 1000,
  //       user,
  //       tokenIn,
  //       tokenOut,
  //       amountIn: ethers.utils.formatUnits(amountIn, 18),
  //       amountOut: ethers.utils.formatUnits(amountOut, 18),
  //     };

  //     if (type === 'user') {
  //       if (newTrade.user === walletClient?.account?.address) {
  //         queryClient.setQueryData(['recent-trades', type, token], (oldData: any[] = []) => {
  //           return [newTrade, ...oldData];
  //         });
  //       }
  //     } else {
  //       // Update the React Query cache
  //       queryClient.setQueryData(['recent-trades', type, token], (oldData: any[] = []) => {
  //         return [newTrade, ...oldData];
  //       });
  //     }
  //   };

  //   ws.onmessage = event => {
  //     const data = JSON.parse(event.data);
  //     if (data.method === 'eth_subscription' && data.params?.result?.event === 'Swap') {
  //       const { user, tokenIn, tokenOut, amountIn, amountOut } = data.params.result.returnValues;
  //       const { transactionHash, blockNumber, timestamp } = data.params.result;

  //       handleSwap(
  //         user,
  //         tokenIn,
  //         tokenOut,
  //         amountIn,
  //         amountOut,
  //         transactionHash,
  //         parseInt(blockNumber, 16),
  //         parseInt(timestamp, 16)
  //       );
  //     }
  //   };

  //   ws.onopen = () => {
  //     ws.send(
  //       JSON.stringify({
  //         jsonrpc: '2.0',
  //         id: 1,
  //         method: 'eth_subscribe',
  //         params: [
  //           'logs',
  //           {
  //             address: DEX_ADDRESS,
  //             topics: [ethers.utils.id('Swap(address,address,address,uint256,uint256)')],
  //           },
  //         ],
  //       })
  //     );
  //   };

  //   return () => {
  //     ws.close();
  //   };
  // }, [walletClient, queryClient, token, type]);

  return {
    trades,
    tradesLoading,
  };
};
