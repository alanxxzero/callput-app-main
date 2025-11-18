// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "./interfaces/IOptionsMarket.sol";
import "./tokens/ERC20.sol";

import "./Utils.sol";
import "./AuthorityUtil.sol";

import "./proxy/OwnableUpgradeable.sol";

contract OptionsMarket is IOptionsMarket, OwnableUpgradeable, AuthorityUtil {
  uint256 public registeredOptionsCount;
  uint256 public activeOptionsCount;

  address public override mainStableAsset;

  uint16 public nextUnderlyingAssetIndex; // starts from 1

  // Once registered, underlying asset cannot be removed (only can be disabled)
  // index <> underlyingAsset <> optionsToken strongly connected (not able to update)
  mapping (uint16 => address) public override indexToUnderlyingAsset; // index => underlyingAsset
  mapping (address => uint16) public override underlyingAssetToIndex; // underlyingAsset => index
  mapping (address => address) public override underlyingAssetToOptionsToken; // underlyingAsset => optionsToken
  mapping (address => address) public override optionsTokenToUnderlyingAsset; // optionsToken => underlyingAsset
  mapping (address => bool) public override isUnderlyingAssetActive; // check if underlying asset is active

  mapping (bytes32 => Option) public options;
  
  event SetMainStableAsset(address indexed mainStableAsset);
  event AddUnderlyingAsset(uint16 indexed underlyingAssetIndex, address indexed underlyingAsset, address optionsToken);
  event UpdateOptionsToken(address indexed underlyingAsset, address optionsToken);
  event SetIsUnderlyingAsset(address indexed underlyingAsset, bool isUnderlyingAssetActive);

  event OptionStatusChanged(bytes32 indexed id, address indexed underlyingAsset, uint40 indexed expiry, uint48 strikePrice, bool isActive);
  
  function initialize(IOptionsAuthority _authority) public initializer {
    __Ownable_init();
    __AuthorityUtil_init__(_authority);

    nextUnderlyingAssetIndex = 1;
  }

  function setMainStableAsset(address _mainStableAsset) external onlyAdmin {
    require(_mainStableAsset != address(0), "OptionsMarket: Invalid main stable asset");
    mainStableAsset = _mainStableAsset;
    emit SetMainStableAsset(_mainStableAsset);
  }

  // 1 -> BTC, 2 -> ETH
  function addUnderlyingAsset(address _underlyingAsset, address _optionsToken) external override onlyAdmin {
    require(_underlyingAsset != address(0), "OptionsMarket: Invalid underlying asset");
    require(underlyingAssetToIndex[_underlyingAsset] == 0, "OptionsMarket: Underlying asset already exists");

    indexToUnderlyingAsset[nextUnderlyingAssetIndex] = _underlyingAsset;
    underlyingAssetToIndex[_underlyingAsset] = nextUnderlyingAssetIndex;

    _setOptionsToken(_underlyingAsset, _optionsToken);

    emit AddUnderlyingAsset(nextUnderlyingAssetIndex, _underlyingAsset, _optionsToken);
    
    isUnderlyingAssetActive[_underlyingAsset] = true;
    nextUnderlyingAssetIndex++;
  }

  // When activate/deactivate specific options market, call this function
  function setIsUnderlyingAsset(uint16 _underlyingAssetIndex, bool _isUnderlyingAssetActive) external onlyAdmin {
    address underlyingAsset = _validateUnderlyingAsset(_underlyingAssetIndex);
    isUnderlyingAssetActive[underlyingAsset] = _isUnderlyingAssetActive;

    emit SetIsUnderlyingAsset(underlyingAsset, _isUnderlyingAssetActive);
  }

  function getOptionId(
    uint16 _underlyingAssetIndex,
    uint40 _expiry,
    uint48 _strikePrice
  ) public pure override returns (bytes32) {
    return bytes32(abi.encodePacked(_underlyingAssetIndex, _expiry, _strikePrice));
  }

  function getOptionTokenId(
    uint16 _underlyingAssetIndex,
    uint40 _expiry,
    uint8 _length,
    bool[4] memory _isBuys,
    bytes32[4] memory _optionIds,
    bool[4] memory _isCalls,
    uint8 _vaultIndex
  ) external view override returns (uint256, bytes32[4] memory) {
    uint48[4] memory strikePrices = [uint48(0), 0, 0, 0];

    for (uint256 i = 0; i < _length;) {
      (,,, uint48 strikePrice) = getOptionDetail(_optionIds[i]);
      strikePrices[i] = strikePrice;
      unchecked { i++; }
    }

    (, bytes32[4] memory sortedOptionIds,,) = Utils.sortOptionsWithIds(
      _length,
      _isBuys,
      _optionIds,
      strikePrices,
      _isCalls
    );
  
    uint256 optionTokenId = Utils.formatOptionTokenId(
        _underlyingAssetIndex,
        _expiry,
        _length,
        _isBuys,
        strikePrices,
        _isCalls,
        _vaultIndex
    );

    return (optionTokenId, sortedOptionIds);
  }

  function getMainStableAsset() external view override returns (address, uint8) {
    uint8 decimals = ERC20(mainStableAsset).decimals();
    return (mainStableAsset, decimals);
  }

  function getUnderlyingAssetByIndex(uint16 _underlyingAssetIndex) external view override returns (address, uint8) {
    address underlyingAsset = indexToUnderlyingAsset[_underlyingAssetIndex];
    uint8 decimals = ERC20(underlyingAsset).decimals();
    return (underlyingAsset, decimals);
  }

  function getOptionsTokenByIndex (uint16 _underlyingAssetIndex) external view override returns (address) {
    address underlyingAsset = indexToUnderlyingAsset[_underlyingAssetIndex];
    return underlyingAssetToOptionsToken[underlyingAsset];
  }

  function getOptionDetail(bytes32 _id) public view override returns (uint16, address, uint40, uint48) {
    Option memory option = options[_id];
    return (option.underlyingAssetIndex, indexToUnderlyingAsset[option.underlyingAssetIndex], option.expiry, option.strikePrice);
  }

  function getOptionsBatch(bytes32[] memory _ids) external view override returns (Option[] memory) {
    Option[] memory _options = new Option[](_ids.length);

    for (uint256 i = 0; i < _ids.length;) {
      _options[i] = options[_ids[i]];
      unchecked { i++; }
    }

    return _options;
  }

  function isOptionAvailable(bytes32 _id) public view override returns (bool) {
    return options[_id].isActive && isUnderlyingAssetActive[options[_id].underlyingAsset];
  }

  function validateOptionIds(
    uint16 _underlyingAssetIndex,
    uint8 _length,
    bytes32[4] memory _optionIds
  ) external view override returns (uint40) {
    require(_length > 0 && _length <= 4, "OptionsMarket: Invalid length");

    uint40 expiry;

    for (uint256 i = 0; i < _length;) {
      require(_optionIds[i] != bytes32(0), "OptionsMarket: Invalid option id");
      require(isOptionAvailable(_optionIds[i]), "OptionsMarket: Option is not available");

      (
        uint16 currentUnderlyingAssetIndex,,
        uint40 currentExpiry,
        uint48 currentStrikePrice
      ) = getOptionDetail(_optionIds[i]);
      require(currentUnderlyingAssetIndex == _underlyingAssetIndex, "OptionsMarket: Invalid underlying asset index");

      if (i == 0) {
        require(currentExpiry > block.timestamp, "OptionsMarket: Invalid expiry");
        expiry = currentExpiry;
      } else {
        require(currentExpiry == expiry, "OptionsMarket: Invalid expiry");
      }

      require(currentStrikePrice > 0, "OptionsMarket: Invalid strike price");

      unchecked { i++;}
    }

    return expiry;
  }

  function addOptions(address _underlyingAsset, uint40 _expiry, uint48[] memory _strikePrices) public onlyKeeper {
    require(isUnderlyingAssetActive[_underlyingAsset], "OptionsMarket: Underlying asset is not active");

    uint16 underlyingAssetIndex = underlyingAssetToIndex[_underlyingAsset];

    for (uint256 i = 0; i < _strikePrices.length;) {
      Option memory _option = Option({
        underlyingAssetIndex: underlyingAssetIndex,
        underlyingAsset: _underlyingAsset,
        expiry: _expiry,
        strikePrice: _strikePrices[i],
        isActive: true
      });

      _addOption(_option);

      unchecked { i++; }
    }
  }
  
  function removeOptions(bytes32[] memory _ids) public onlyKeeper {
    for (uint256 i = 0; i < _ids.length;) {
      _removeOption(_ids[i]);
      unchecked { i++; }
    }
  }

  function _validateUnderlyingAsset(uint16 _underlyingAssetIndex) internal view returns (address) {
    address _underlyingAsset = indexToUnderlyingAsset[_underlyingAssetIndex];
    // duplicated address is not allowed
    require(underlyingAssetToIndex[_underlyingAsset] != 0, "OptionsMarket: Underlying asset does not exist");
    return _underlyingAsset;
  }

  function _setOptionsToken(address _underlyingAsset, address _optionsToken) internal {
    require(optionsTokenToUnderlyingAsset[_optionsToken] == address(0), "OptionsMarket: Options token already exists");

    underlyingAssetToOptionsToken[_underlyingAsset] = _optionsToken;
    optionsTokenToUnderlyingAsset[_optionsToken] = _underlyingAsset;

    emit UpdateOptionsToken(_underlyingAsset, _optionsToken);  
  }

  function _addOption(Option memory _option) internal {
    require(_option.expiry > block.timestamp, "OptionsMarket: Invalid expiry time");
    require(_option.strikePrice > 0, "OptionsMarket: Invalid strike price");

    bytes32 id = getOptionId(_option.underlyingAssetIndex, _option.expiry, _option.strikePrice);

    Option storage existingOption = options[id];

    // If already activated option, ignore it
    if (existingOption.expiry != 0 && existingOption.isActive) return;

    existingOption.underlyingAssetIndex = _option.underlyingAssetIndex;
    existingOption.underlyingAsset = _option.underlyingAsset;
    existingOption.expiry = _option.expiry;
    existingOption.strikePrice = _option.strikePrice;
    existingOption.isActive = _option.isActive;

    registeredOptionsCount++;
    activeOptionsCount++;

    emit OptionStatusChanged(id, _option.underlyingAsset, _option.expiry, _option.strikePrice, true);
  }
  
  function _removeOption(bytes32 _id) internal {
    Option storage _option = options[_id];

    if (_option.expiry == 0 || !_option.isActive) return;

    _option.isActive = false;

    activeOptionsCount--;

    emit OptionStatusChanged(_id, _option.underlyingAsset, _option.expiry, _option.strikePrice, false);
  }
}