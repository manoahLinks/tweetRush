# Testnet Configuration for TweetRush

Your TweetRush app is now properly configured for Stacks Testnet with your deployed smart contract.

## 🧪 Testnet Configuration

### Network Settings
- **Network**: Stacks Testnet
- **Core API**: `https://stacks-node-api.testnet.stacks.co`
- **Network ID**: `2147483648`
- **Address Prefix**: `ST` (for testnet addresses)

### Your Smart Contract
- **Contract Address**: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM`
- **Contract Name**: `tweetrush`
- **Full Contract ID**: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.tweetrush`

## 🔧 Configuration Files

### `config/stacks.ts`
```typescript
export const DEFAULT_NETWORK = NetworkType.TESTNET;
export const TESTNET_CONFIG = {
    coreApiUrl: 'https://stacks-node-api.testnet.stacks.co',
    networkId: 2147483648,
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'tweetrush',
};
```

### `utils/testnet.ts`
- Testnet service utilities
- Faucet and explorer URLs
- Contract interaction helpers

## 🎯 Features Implemented

### 1. **Testnet Wallet Connection**
- Generates proper `ST` prefixed addresses
- Shows testnet indicators in UI
- Mock wallet connection (ready for real wallet integration)

### 2. **UI Testnet Indicators**
- Onboarding screen shows testnet mode
- Profile screen displays testnet badge
- STX balance shows testnet context

### 3. **Smart Contract Ready**
- Contract address configured
- Network properly set to testnet
- Ready for contract function calls

## 🚀 Getting Test STX

### Testnet Faucet
1. Visit: https://explorer.stacks.co/?chain=testnet
2. Connect your wallet
3. Request test STX tokens
4. Use these tokens to interact with your contract

### Testnet Explorer
- **URL**: https://explorer.stacks.co/?chain=testnet
- **Your Contract**: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.tweetrush`

## 🔄 Development Workflow

### 1. **Test Contract Interaction**
```typescript
import { stacksService } from '@/utils/stacks';

// Call your contract function
const result = await stacksService.callContractFunction(
    'tweetrush',
    'your-function-name',
    ['param1', 'param2']
);
```

### 2. **Monitor Transactions**
- Use testnet explorer to track transactions
- Check contract calls and state changes
- Verify function execution

### 3. **Debug Mode**
```typescript
import { testTestnetConfig } from '@/utils/testnet-test';

// Run testnet configuration test
testTestnetConfig();
```

## 📱 User Experience

### Onboarding
- Users see testnet mode indicator
- Clear messaging about test environment
- Instructions for getting test STX

### Profile Screen
- Shows testnet badge
- Displays test STX balance
- Contract interaction ready

## 🛠️ Next Steps

### 1. **Real Wallet Integration**
Replace mock wallet with actual Stacks wallet providers:
- Hiro Wallet
- Xverse Wallet
- Stacks Wallet

### 2. **Contract Function Calls**
Implement actual contract interactions:
```typescript
// Example contract call
const tx = await stacksService.callContractFunction(
    'tweetrush',
    'play-game',
    [gameData, userAddress]
);
```

### 3. **Transaction Monitoring**
- Track contract interactions
- Show transaction status
- Handle errors gracefully

## 🐛 Troubleshooting

### Common Issues:
1. **Network Connection**: Ensure testnet API is accessible
2. **Contract Address**: Verify your contract is deployed correctly
3. **STX Balance**: Get test STX from faucet
4. **Address Format**: Ensure using ST prefixed addresses

### Debug Commands:
```bash
# Test network connection
curl https://stacks-node-api.testnet.stacks.co/v2/info

# Check contract
curl https://stacks-node-api.testnet.stacks.co/v2/contracts/interface/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM/tweetrush
```

## 📚 Resources

- [Stacks Testnet Explorer](https://explorer.stacks.co/?chain=testnet)
- [Stacks Testnet Faucet](https://explorer.stacks.co/?chain=testnet)
- [Stacks.js Documentation](https://docs.hiro.so/reference/stacks.js/)
- [Smart Contract Development](https://docs.stacks.co/docs/smart-contracts/)

Your TweetRush app is now ready for testnet development and testing with your deployed smart contract! 🎉
