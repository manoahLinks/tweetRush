# Stacks Blockchain Integration

TweetRush now includes full Stacks blockchain integration for wallet connection, STX transactions, and blockchain interactions.

## 🚀 Features Implemented

### 1. **Wallet Connection**
- Stacks wallet integration using `@stacks/connect`
- Support for both mainnet and testnet
- Mock wallet connection for development (easily replaceable with real wallet providers)

### 2. **Network Configuration**
- Configurable Stacks network (mainnet/testnet)
- Network-specific address formats (SP for mainnet, ST for testnet)
- Easy switching between networks

### 3. **STX Balance Display**
- Real-time STX balance component
- Formatted display with proper decimal places
- Loading states and error handling

### 4. **Transaction Capabilities**
- STX token transfers
- Transaction broadcasting
- Post-condition support
- Transaction history

## 📁 Files Added/Modified

### New Files:
- `config/stacks.ts` - Stacks network configuration
- `utils/stacks.ts` - Stacks blockchain utilities
- `components/ui/STXBalance.tsx` - STX balance display component
- `public/manifest.json` - App manifest for Stacks connect

### Modified Files:
- `utils/wallet.ts` - Updated with Stacks.js integration
- `screens/OnboardingScreen.tsx` - Shows Stacks wallet connection
- `screens/ProfileScreen.tsx` - Displays STX balance
- `components/ui/index.ts` - Exports STXBalance component

## 🔧 Configuration

### Network Settings
```typescript
// config/stacks.ts
export const DEFAULT_NETWORK = NetworkType.TESTNET; // Change to MAINNET for production
```

### App Details
```typescript
// config/stacks.ts
export const APP_CONFIG = {
    name: 'TweetRush',
    icon: 'https://your-app-icon-url.com/icon.png', // Replace with your app icon
};
```

## 🎯 Usage Examples

### Wallet Connection
```typescript
import { walletService } from '@/utils/wallet';

// Connect wallet
const walletInfo = await walletService.connectWallet();
console.log('Connected address:', walletInfo.address);
```

### STX Transactions
```typescript
import { stacksService } from '@/utils/stacks';

// Send STX
const result = await stacksService.sendSTX(
    recipientAddress,
    amountInMicroSTX,
    senderPrivateKey
);
```

### Display STX Balance
```tsx
import STXBalance from '@/components/ui/STXBalance';

<STXBalance size="lg" showIcon={true} />
```

## 🔄 Development vs Production

### Development (Current)
- Uses mock wallet connection
- Simulated STX balances
- Testnet configuration
- No real blockchain transactions

### Production Setup
1. Replace mock wallet service with real wallet providers (Hiro Wallet, etc.)
2. Switch to mainnet configuration
3. Implement real STX balance fetching
4. Add proper error handling for network issues

## 📚 Stacks.js Documentation

The integration uses the official Stacks.js library:
- [Stacks.js Documentation](https://docs.hiro.so/reference/stacks.js/)
- [Connect Wallet Guide](https://docs.hiro.so/reference/stacks.js/connect-wallet)
- [Transaction Building](https://docs.hiro.so/reference/stacks.js/build-transactions)

## 🚀 Next Steps

1. **Real Wallet Integration**: Replace mock service with actual wallet providers
2. **Smart Contracts**: Add contract interaction capabilities
3. **NFT Support**: Integrate Stacks NFT standards
4. **DeFi Features**: Add liquidity and staking capabilities
5. **Analytics**: Track blockchain interactions and user behavior

## 🛠️ Troubleshooting

### Common Issues:
1. **Import Errors**: Ensure all Stacks.js packages are installed
2. **Network Issues**: Check network configuration in `config/stacks.ts`
3. **Wallet Connection**: Verify manifest.json is accessible
4. **Balance Display**: Check if user wallet address is available

### Debug Mode:
Enable console logging in wallet service to debug connection issues:
```typescript
console.log('Wallet connection payload:', payload);
```
