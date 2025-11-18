import keccak256 from 'keccak256'

// PositionManager
export const CreateClosePositionTopic = "0x" + keccak256("CreateClosePosition(address,uint16,uint40,uint256,uint256,address[],uint256,uint256,uint256,uint256,uint40)").toString('hex')
export const CancelClosePositionTopic = "0x" + keccak256("CancelClosePosition(address,uint16,uint40,uint256,uint256,address[],uint40)").toString('hex')

// Controller
export const OpenBuyPositionTopic= "0x" + keccak256("OpenBuyPosition(address,uint256,uint16,uint40,uint256,uint256,address,uint256,uint256,uint256)").toString('hex')
export const OpenSellPositionTopic= "0x" + keccak256("OpenSellPosition(address,uint256,uint16,uint40,uint256,uint256,address,uint256,address,uint256,uint256,uint256)").toString('hex')
export const CloseBuyPositionTopic= "0x" + keccak256("CloseBuyPosition(address,uint256,uint16,uint40,uint256,uint256,address,uint256,uint256,uint256)").toString('hex')
export const CloseSellPositionTopic= "0x" + keccak256("CloseSellPosition(address,uint256,uint16,uint40,uint256,uint256,address,uint256,address,uint256,uint256,uint256)").toString('hex')
export const SettleBuyPositionTopic= "0x" + keccak256("SettleBuyPosition(address,uint16,uint40,uint256,uint256,address,uint256,uint256)").toString('hex')
export const SettleSellPositionTopic= "0x" + keccak256("SettleSellPosition(address,uint16,uint40,uint256,uint256,address,uint256,address,uint256,uint256)").toString('hex')
export const ClearPositionTopic = "0x" + keccak256("ClearPosition(address,address,uint256,uint256,uint256)").toString('hex')

// Vault
export const FeeRebateTopic = "0x" + keccak256("FeeRebate(address,address,address,uint256,uint256,uint256,uint256,address,uint256,uint256,bool,bool)").toString('hex')
export const CollectFeesTopic = "0x" + keccak256("CollectFees(address,uint256,uint256)").toString('hex');
export const CollectPositionFeesTopic = "0x" + keccak256("CollectPositionFees(address,address,uint256,uint256,bool)").toString('hex');
export const BuyUsdgTopic = "0x" + keccak256("BuyUSDG(address,address,uint256,uint256,uint256)").toString('hex');
export const SellUsdgTopic = "0x" + keccak256("SellUSDG(address,address,uint256,uint256,uint256)").toString('hex');
export const AddLiquidityTopic = "0x" + keccak256("AddLiquidity(address,address,uint256,uint256,uint256,uint256,uint256)").toString('hex');
export const RemoveLiquidityTopic = "0x" + keccak256("RemoveLiquidity(address,address,uint256,uint256,uint256,uint256,uint256)").toString('hex');

// VaultUtils
export const NotifyPendingAmountTopic = "0x" + keccak256("NotifyPendingAmount(uint8,address,uint256,uint256)").toString('hex');

// SettlePriceFeed
export const FeedSettlePriceTopic = "0x" + keccak256("FeedSettlePrice(address,uint256,uint256,address)").toString('hex')

// Referral
export const ParentChangedTopic = "0x" + keccak256("ParentChanged(address,address,address)").toString('hex')

// OptionsToken
export const TransferSingleTopic = "0x" + keccak256("TransferSingle(address,address,address,uint256,uint256)").toString('hex')

// VaultQueueEvents
export const ActionEnqueuedTopic = "0x" + keccak256("ActionEnqueued(address,address,uint256,uint8,address,uint256,address)").toString('hex')
export const ActionProcessedTopic = "0x" + keccak256("ActionProcessed(address,address,uint256,uint8,address,uint256,address)").toString('hex')
export const ActionCancelledTopic = "0x" + keccak256("ActionCancelled(address,address,uint256,uint8,address,uint256,address)").toString('hex')
export const ActionPushedbackTopic = "0x" + keccak256("ActionPushedback(address,address,uint256,uint8,address,uint256,address)").toString('hex')