export interface EventUpdateTrade {
  Id: string;
  Owner: string;
  Size_: any; // Adjust type based on expected structure
  OutAsset: any; // Adjust type based on expected structure
  Status: string;
  StartHeight: number;
  EndHeight: number;
  OutSize: any; // Adjust type based on expected structure
  OutHashes: string[];
}

export function parseEventUpdateTrade(rpcResponse: any): EventUpdateTrade | null {
  try {
    const events = rpcResponse?.result?.events;
    if (!events) return null;

    return {
      Id: JSON.parse(events['odx.odx.EventUpdateTrade.id']?.[0] ?? '""'),
      Owner: JSON.parse(events['odx.odx.EventUpdateTrade.owner']?.[0] ?? '""'),
      Size_: JSON.parse(events['odx.odx.EventUpdateTrade.size']?.[0] ?? '{}'),
      OutAsset: JSON.parse(events['odx.odx.EventUpdateTrade.out_asset']?.[0] ?? '{}'),
      Status: JSON.parse(events['odx.odx.EventUpdateTrade.status']?.[0] ?? '""'),
      StartHeight: parseInt(
        JSON.parse(events['odx.odx.EventUpdateTrade.start_height']?.[0] ?? '0'),
        10
      ),
      EndHeight: parseInt(
        JSON.parse(events['odx.odx.EventUpdateTrade.end_height']?.[0] ?? '0'),
        10
      ),
      OutSize: JSON.parse(events['odx.odx.EventUpdateTrade.out_size']?.[0] ?? 'null'),
      OutHashes: JSON.parse(events['odx.odx.EventUpdateTrade.out_hashes']?.[0] ?? '[]'),
    };
  } catch (error) {
    console.error('Error parsing EventUpdateTrade:', error);
    return null;
  }
}
