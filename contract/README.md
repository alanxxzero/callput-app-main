# Contract Version Management

| Chain | Version | Last Update | Status |
|------|------|----------------|------|
| Arbitrum One | 1.0.0 | 2024-12-01 | ✅ Latest |
| Arbitrum Sepolia | 1.0.0 | 2024-12-01 | ⏳ Pending Upgrade |
| Berachain bArtio | 1.0.0 | 2025-01-07 | ⏳ Pending Upgrade |
| Berachain cArtio | 1.1.0 | 2024-12-20 | ✅ Latest |

## Upgrade History

### 1.1.0 (2025-01-08)
- Chain: Arbitrum One, Berachain cArtio
- Changes: Modify settlePositions function in SettleManager.sol and olp rp apr related function in OlpManager.sol and VaultUtils.sol
- Targets: SettleManager.sol, OlpManager.sol, VaultUtils.sol

### 1.1.0 (2025-01-07)
- Chain: Berachain bArtio
- Changes: Increase MAX_UPDATE_DURATION from 30 minutes to 90 minutes, and set update duration from 180 to 3900
- Targets: PositionValueFeed.sol, SpotPriceFeed.sol

### 1.1.0 (2024-12-20)
- Chain: Berachain cArtio
- Changes: Add authorized transfer of fOLP and deploy WOLP contract
- Targets: OlpManager.sol, RewardTracker.sol, WOLP.sol