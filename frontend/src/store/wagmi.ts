import { Chain, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { bitgetWallet, coinbaseWallet, okxWallet, rabbyWallet, rainbowWallet, walletConnectWallet, metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { http, Transport } from "viem";
import { createConfig } from "wagmi";
import { arbitrum, arbitrumSepolia } from 'wagmi/chains'

const berachainMainnet = {
  id: 80094,
  name: 'Berachain Mainnet',
  iconUrl: 'https://moby-frontend-prod.s3.ap-southeast-1.amazonaws.com/assets/icon-logo-bera-circle.svg',
  nativeCurrency: {
    name: 'Berachain',
    symbol: 'BERA',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.berachain.com"]
    }
  },
  blockExplorers: {
    default: {
      'name': 'BeraTrail',
      'url': 'https://berascan.com'
    }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 109269
    }
  },
} as const satisfies Chain

const berachainCArtio = {
  id: 80000,
  name: 'Berachain cArtio',
  iconUrl: 'https://moby-frontend-prod.s3.ap-southeast-1.amazonaws.com/assets/icon-logo-bera-circle.svg',
  nativeCurrency: {
    name: 'Berachain',
    symbol: 'BERA',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://cottonzell-eth-cartio.berachain.com/"]
    }
  },
  blockExplorers: {
    default: {
      'name': 'ScanX',
      'url': 'https://80000.testnet.routescan.io'
    }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 121028
    }
  },
} as const satisfies Chain

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet, okxWallet, rabbyWallet, coinbaseWallet, bitgetWallet],
    },
  ],
  {
    appName: 'Moby',
    projectId: 'a10b8f6a7c2339ea7e308213d4910173',
  }
);

const mode = import.meta.env.MODE;

let chains;
let transports: Record<number, Transport>;

if (mode === 'prod') {
  chains = [arbitrum, berachainMainnet] as const;
  transports = {
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
    [berachainMainnet.id]: http('https://rpc.berachain.com'),
  }
} else if (mode === 'dev') {
  chains = [arbitrumSepolia, berachainMainnet] as const;
  transports = {
    [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc'),
    [berachainMainnet.id]: http('https://rpc.berachain.com')
  }
} else if (mode === 'bera') {
  chains = [berachainCArtio] as const;
  transports = {
    [berachainCArtio.id]: http(' https://cottonzell-eth-cartio.berachain.com')
  }
} else {
  chains = [arbitrumSepolia, berachainMainnet] as const;
  transports = {
    [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc'),
    [berachainMainnet.id]: http('https://rpc.berachain.com')
  }
}

export const config = createConfig({
  connectors,
  chains: chains as readonly [Chain, ...Chain[]],
  transports: transports
})
