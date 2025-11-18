import { HONEY, USDC, WBERA, WBTC, WETH } from "./constants"

export async function deployAssetTokens(ethers: any, { CONTRACT_ADDRESS }: any) {
  const wbtc = await ethers.getContractAt("ERC20", WBTC)
  const weth = await ethers.getContractAt("WETH", WETH)
  const usdc = await ethers.getContractAt("ERC20", USDC)
  const wbera = await ethers.getContractAt("WETH", WBERA)
  const honey = await ethers.getContractAt("ERC20", HONEY)

  CONTRACT_ADDRESS.WBTC = await wbtc.getAddress()
  CONTRACT_ADDRESS.WETH = await weth.getAddress()
  CONTRACT_ADDRESS.USDC = await usdc.getAddress()
  CONTRACT_ADDRESS.WBERA = await wbera.getAddress()
  CONTRACT_ADDRESS.HONEY = await honey.getAddress()

  console.log(CONTRACT_ADDRESS, 'CONTRACT_ADDRESS')

  return {
    wbtc,
    weth,
    usdc,
    wbera,
    honey
  }
}