import fs from 'fs'
import path from 'path'

const contracts = [
  "Controller",
  "ERC20",
  "FastPriceFeed",
  "Faucet",
  "FeeDistributor",
  "OLP",
  "OlpManager",
  "OptionsAuthority",
  "OptionsMarket",
  "OptionsToken",
  "PositionManager",
  "PositionValueFeed",
  "Referral",
  "RewardDistributor",
  "RewardRouterV2",
  "RewardTracker",
  "SettlePriceFeed",
  "SpotPriceFeed",
  "USDG",
  "Vault",
  "VaultPriceFeed",
  "VaultUtils",
  "ViewAggregator"
]

const artifactsDir = path.join(__dirname, '..', 'artifacts', 'contracts');

async function findContractArtifact(contractName: string): Promise<string | null> {
  // Recursive function to find a file path, now with a return type annotation
  function findFilePath(dirPath: string): string | null {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        const result = findFilePath(fullPath);
        if (result) return result;
      } else if (file.name === `${contractName}.json`) {
        return fullPath;
      }
    }
    return null;
  }

  return findFilePath(artifactsDir);
}

async function main() {
  const abisDir = path.join(__dirname, "..", "..", "shared", 'abis');
  if (!fs.existsSync(abisDir)){
    fs.mkdirSync(abisDir, { recursive: true });
  }

  for (const contract of contracts) {
    try {
      const artifactPath = await findContractArtifact(contract);
      if (!artifactPath) {
        console.error(`Artifact for ${contract} not found.`);
        continue;
      }

      console.log(`${contract} artifact path:`, artifactPath);

      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      const abi = artifact.abi;
      const abiPath = path.join(abisDir, `${contract}.json`);
      fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2), 'utf8');
      console.log(`ABI saved to ${abiPath}`);
    } catch (error) {
        console.error(`Error processing ${contract}:`, error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});