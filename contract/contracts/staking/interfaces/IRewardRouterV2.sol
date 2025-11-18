// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IRewardRouterV2 {
    function feeOlpTracker() external view returns (address);
		function olpManager() external view returns (address);
		function mintAndStakeOlp(address _token, uint256 _amount, uint256 _minUsdg, uint256 _minOlp) external returns (uint256);
		function handleRewards(
        bool _shouldClaimReward, // will be always true
        bool _shouldConvertRewardToNAT
    ) external;
}
