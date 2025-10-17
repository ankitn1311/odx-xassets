# Tokens Dashboard

A password-protected dashboard for monitoring Sonic balances across multiple wallets.

## Features

- **Password Protection**: Access restricted with password `654321`
- **Persistent Authentication**: Once authenticated, no need to re-enter password (stored in localStorage)
- **Real-time Balance Monitoring**: Shows Sonic balances for 6 predefined wallets
- **Auto-refresh**: Balances update every 30 seconds
- **Manual Refresh**: Refresh all functionality with loading states
- **Logout Functionality**: Clear authentication state when needed
- **Responsive Design**: Works on desktop and mobile devices

## Monitored Wallets

The dashboard tracks the following wallet addresses:

1. `0x4804C4a5634226fCf61075D6d93841500c7A119d`
2. `0x74F81Bc722788dd5E8523B6A1D5B93e983F2EbEF`
3. `0x8f453f98B9Ea483883Ebd4282c35Db4197EbcA66`
4. `0x491Dc87523afcB2076A886B1b8Aa14De2DE3D3bC`
5. `0xEDb1034FEe328A3eC6A637c76472c25d1fbA80B7`
6. `0xa9c374D24f6c131E551E17b501cFA6a0B9c81596`

## Access

- **URL**: `/tokens-dashboard`
- **Password**: `654321`
- **Access Link**: Available on the main page under "Admin Dashboard"

## Technical Details

- Built with React and Next.js
- Uses TanStack Query for data fetching and caching
- Implements password protection with client-side authentication
- Uses Zustand for state management with localStorage persistence
- Uses the existing `getSonicBalanceWithProvider` function for balance queries
- Responsive grid layout with Tailwind CSS
- Error handling for failed balance queries

## Components

- `PasswordProtection`: Handles authentication with persistent state
- `TokensDashboard`: Main dashboard component with logout functionality
- `WalletBalanceCard`: Individual wallet display
- `useSonicBalanceByAddress`: Custom hook for balance queries
- `useAuthStore`: Zustand store for authentication state management
