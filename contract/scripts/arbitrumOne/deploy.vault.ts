import { lThresholdDays, mThresholdDays, sThresholdDays } from "./constants";


export async function deployVault(ethers: any, { upgrades, CONTRACT_ADDRESS }: any) {
  const Vault = await ethers.getContractFactory("Vault");

  const sVault = await upgrades.deployProxy(Vault, [
    sThresholdDays,
    CONTRACT_ADDRESS.OPTIONS_AUTHORITY
  ]) 
  const mVault = await upgrades.deployProxy(Vault, [
    mThresholdDays,
    CONTRACT_ADDRESS.OPTIONS_AUTHORITY
  ]) 
  const lVault = await upgrades.deployProxy(Vault, [
    lThresholdDays,
    CONTRACT_ADDRESS.OPTIONS_AUTHORITY
  ]) 

  CONTRACT_ADDRESS.S_VAULT = await sVault.getAddress()
  CONTRACT_ADDRESS.M_VAULT = await mVault.getAddress()
  CONTRACT_ADDRESS.L_VAULT = await lVault.getAddress()

  console.log(CONTRACT_ADDRESS, 'CONTRACT_ADDRESS')

  return {
    sVault,
    mVault,
    lVault
  }
}