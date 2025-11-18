import { SAFE_WALLET } from "../constants"

export async function deployFeeDistributor(ethers: any, { upgrades, CONTRACT_ADDRESS }: any) {
  const FeeDistributor = await ethers.getContractFactory("FeeDistributor")

  const feeDistributor = await upgrades.deployProxy(FeeDistributor, [
    SAFE_WALLET.TREASURY,
    SAFE_WALLET.GOVERNANCE,
    CONTRACT_ADDRESS.CONTROLLER,
    CONTRACT_ADDRESS.S_REWARD_DISTRIBUTOR,
    CONTRACT_ADDRESS.M_REWARD_DISTRIBUTOR,
    CONTRACT_ADDRESS.L_REWARD_DISTRIBUTOR,
    CONTRACT_ADDRESS.WETH,
    CONTRACT_ADDRESS.OPTIONS_AUTHORITY,
  ])

  CONTRACT_ADDRESS.FEE_DISTRIBUTOR = await feeDistributor.getAddress()

  console.log(CONTRACT_ADDRESS, 'CONTRACT_ADDRESS')

  return {
    feeDistributor
  }
}