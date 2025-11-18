
// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "../tokens/interfaces/IERC20.sol";
import "../tokens/libraries/SafeERC20.sol";
import "../interfaces/IVault.sol";
import "../interfaces/IController.sol";
import "../AuthorityUtil.sol";
import "../staking/interfaces/IRewardDistributor.sol";

import "../proxy/OwnableUpgradeable.sol";

contract FeeDistributor is OwnableUpgradeable, AuthorityUtil {
    using SafeERC20 for IERC20;

    // tokens
    address public rewardToken; // Moby reward token: WETH
    address public weth;
    
    // other contracts
    address public controller;
    address public sRewardDistributor;
    address public mRewardDistributor;
    address public lRewardDistributor;

    // addresses
    address public treasury;
    address public gt;

    // rates
    uint256 public treasuryRate;
    uint256 public gtRate;
    uint256 public olpRewardRate;

    uint256 public distributionPeriod;
    uint256 public lastFeeDistribution; // timestamp
    uint256 public lastOlpRewardsDistribution; // timesstamp

    // pending olp rewards (solp, molp, lolp)
    mapping(address => uint256) public pendingOLPRewards;

    event FeeDistribution(address indexed receiver, uint256 amount);
    event SetWeth(address indexed weth);
    event SetTreasury(address indexed treasury);
    event SetGT(address indexed gt);
    event SetRate(uint256 indexed treasuryRate, uint256 indexed gtRate, uint256 indexed olpRewardRate);
    event SetDistributionPeriod(uint256 indexed period);
    event SetRewardDistributor(address indexed sRewardDistributor, address indexed mRewardDistributor, address indexed lRewardDistributor);

    function initialize(
        address _treasury,
        address _gt,
        address _controller,
        address _sRewardDistributor,
        address _mRewardDistributor,
        address _lRewardDistributor,
        address _weth,
        IOptionsAuthority _authority
    ) external initializer {
        __Ownable_init();
        __AuthorityUtil_init__(_authority);

        require(
          _treasury != address(0) &&
          _gt != address(0) &&
          _controller != address(0) &&
          _sRewardDistributor != address(0) &&
          _mRewardDistributor != address(0) &&
          _lRewardDistributor != address(0) &&
          _weth != address(0),
          "FeeDistributor: invalid address (zero address)"
        );

        treasury = _treasury;
        gt = _gt;

        controller = _controller;
        sRewardDistributor = _sRewardDistributor;
        mRewardDistributor = _mRewardDistributor;
        lRewardDistributor = _lRewardDistributor;

        weth = _weth;
        
        treasuryRate = 20; // 20% to treasury
        olpRewardRate = 50; // 50% to reward distributor
        gtRate = 30; // 30% to GT(set as EOA temporarily)

        distributionPeriod = 7 days;
    }

    function distributeFee(address[] memory _tokens) external onlyKeeper {
        address[3] memory vaults = IController(controller).getVaults();

        uint256 sVaultOutcome;
        // uint256 mVaultOutcome;
        // uint256 lVaultOutcome;

        uint256 rewardTotalBefore = IERC20(weth).balanceOf(address(this));

        for (uint256 i = 0; i < _tokens.length;) {
          address[] memory _path = new address[](2);
          _path[0] = _tokens[i];
          _path[1] = weth;

          uint256 feeFromSVault = IVault(vaults[0]).withdrawFees(_tokens[i], address(this));
          // uint256 feeFromMVault = IVault(vaults[1]).withdrawFees(_tokens[i], address(this));
          // uint256 feeFromLVault = IVault(vaults[2]).withdrawFees(_tokens[i], address(this));

          // convert feeTokenAmountTotal to WETH
          if (_tokens[i] == weth) {
            sVaultOutcome += feeFromSVault;
            // mVaultOutcome += feeFromMVault;
            // lVaultOutcome += feeFromLVault;
          } else {
            _approve(_tokens[i], controller);

            sVaultOutcome += _swap(vaults[0], _path, feeFromSVault);
            // mVaultOutcome += _swap(vaults[1], _path, feeFromMVault);
            // lVaultOutcome += _swap(vaults[2], _path, feeFromLVault);
          }

          unchecked { i++; }
        }

        uint256 rewardTotal = IERC20(weth).balanceOf(address(this)) - rewardTotalBefore;

        // Treasury
        uint256 treasuryAmount = rewardTotal * treasuryRate / 100;
        IERC20(weth).safeTransfer(treasury, treasuryAmount);

        // GT(EOA)
        uint256 gtAmount = rewardTotal * gtRate / 100;
        IERC20(weth).safeTransfer(gt, gtAmount);
        
        emit FeeDistribution(treasury, treasuryAmount);
        emit FeeDistribution(gt, gtAmount);

        // OLP Reward Pool (3 cases, sDistirbutor, m, l)
        uint256 olpReward = rewardTotal - gtAmount - treasuryAmount;

        // uint256 vaultOutcomeTotal = sVaultOutcome + mVaultOutcome + lVaultOutcome;
        uint256 vaultOutcomeTotal = sVaultOutcome;

        // prevent division by zero
        if (vaultOutcomeTotal > 0) {
          uint256 solpReward = olpReward * sVaultOutcome / vaultOutcomeTotal;
          // uint256 molpReward = olpReward * mVaultOutcome / vaultOutcomeTotal;
          // uint256 lolpReward = olpReward - (solpReward + molpReward); // include remaining

          pendingOLPRewards[sRewardDistributor] += solpReward;
          // pendingOLPRewards[mRewardDistributor] += molpReward;
          // pendingOLPRewards[lRewardDistributor] += lolpReward;

          emit FeeDistribution(sRewardDistributor, solpReward);
          // emit FeeDistribution(mRewardDistributor, molpReward);
          // emit FeeDistribution(lRewardDistributor, lolpReward);
        }

        lastFeeDistribution = block.timestamp;
    }

    function distributeOLPRewards() external onlyKeeper {
        require(block.timestamp - lastOlpRewardsDistribution >= distributionPeriod, "FeeDistributor: not ready");
        
        uint256 sAmount = (pendingOLPRewards[sRewardDistributor] / distributionPeriod) * distributionPeriod;
        // uint256 mAmount = (pendingOLPRewards[mRewardDistributor] / distributionPeriod) * distributionPeriod;
        // uint256 lAmount = (pendingOLPRewards[lRewardDistributor] / distributionPeriod) * distributionPeriod;

        if (sAmount > 0) {
            IERC20(weth).safeTransfer(sRewardDistributor, sAmount);
            IRewardDistributor(sRewardDistributor).setTokensPerInterval(sAmount / distributionPeriod);
        }

        // if (mAmount > 0) {
        //     IERC20(weth).safeTransfer(mRewardDistributor, mAmount);
        //     IRewardDistributor(mRewardDistributor).setTokensPerInterval(mAmount / distributionPeriod);
        // }

        // if (lAmount > 0) {
        //     IERC20(weth).safeTransfer(lRewardDistributor, lAmount);
        //     IRewardDistributor(lRewardDistributor).setTokensPerInterval(lAmount / distributionPeriod);
        // }

        // Updating the pending rewards after distribution
        pendingOLPRewards[sRewardDistributor] -= sAmount;
        // pendingOLPRewards[mRewardDistributor] -= mAmount;
        // pendingOLPRewards[lRewardDistributor] -= lAmount;

        lastOlpRewardsDistribution = block.timestamp;
    }

    function setWeth(address _weth) public onlyAdmin {
        require(_weth != address(0), "FeeDistributor: invalid address (zero address)");
        weth = _weth;
        emit SetWeth(_weth);
    }

    function setTreasury(address _treasury) public onlyAdmin {
        require(_treasury != address(0), "FeeDistributor: invalid address (zero address)");
        treasury = _treasury;
        emit SetTreasury(_treasury);
    }
    
    function setGT(address _gt) public onlyAdmin {
        require(_gt != address(0), "FeeDistributor: invalid address (zero address)");
        gt = _gt;
        emit SetGT(_gt);
    }

    function setRate(uint256 _treasuryRate, uint256 _gtRate, uint256 _olpRewardRate) public onlyAdmin {
        require(_treasuryRate + _olpRewardRate + _gtRate == 100, "FeeDistributor: invalid rate");
        treasuryRate = _treasuryRate;
        gtRate = _gtRate;
        olpRewardRate = _olpRewardRate;

        emit SetRate(_treasuryRate, _gtRate, _olpRewardRate);
    }

    function setDistributionPeriod(uint256 _distributionPeriod, bool _force) public onlyAdmin {
        if (!_force) {
          require(_distributionPeriod >= 1 days, "FeeDistributor: invalid period");
        }
        distributionPeriod = _distributionPeriod;

        emit SetDistributionPeriod(_distributionPeriod);
    }

    function setRewardDistributor(address _sRewardDistributor, address _mRewardDistributor, address _lRewardDistributor) public onlyAdmin {
      require(
        _sRewardDistributor != address(0) &&
        _mRewardDistributor != address(0) &&
        _lRewardDistributor != address(0),
        "FeeDistributor: invalid address (zero address)"
      );
      
      sRewardDistributor = _sRewardDistributor;
      mRewardDistributor = _mRewardDistributor;
      lRewardDistributor = _lRewardDistributor;
      
      emit SetRewardDistributor(_sRewardDistributor, _mRewardDistributor, _lRewardDistributor);
    }

    function _approve(address token, address spender) private {
      // check allowance
      uint256 allowance = IERC20(token).allowance(address(this), spender);

      if (allowance == 0) {
        IERC20(token).approve(spender, type(uint256).max);
      }
    }

    function _swap(address _vault, address[] memory _path, uint256 _fee) private returns (uint256) {
      if (_fee > 0) {
        return IController(controller).swap(_vault, _path, _fee, 0, address(this));
      }

      return 0;
    }
}