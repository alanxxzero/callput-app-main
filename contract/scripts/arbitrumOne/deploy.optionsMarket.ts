export async function deployOptionsMarket(ethers: any, { upgrades, CONTRACT_ADDRESS }: any) {
  const [DEPLOYER] = await ethers.getSigners()

  const OptionsMarket = await ethers.getContractFactory("OptionsMarket")
  const optionsMarket = await upgrades.deployProxy(OptionsMarket, [CONTRACT_ADDRESS.OPTIONS_AUTHORITY])

  await optionsMarket.connect(DEPLOYER).setMainStableAsset(CONTRACT_ADDRESS.USDC);
  
  CONTRACT_ADDRESS.OPTIONS_MARKET = await optionsMarket.getAddress()

  console.log(CONTRACT_ADDRESS, 'CONTRACT_ADDRESS')

  return {
    optionsMarket,
  }
}