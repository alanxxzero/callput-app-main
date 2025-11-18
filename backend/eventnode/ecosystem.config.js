module.exports = {
  apps: [
    {
      name: "eventnode-arbitrumSepolia",
      script: "npx",
      args: "ts-node src/index.ts",
      env: {
        NETWORK: "arbitrumSepolia",
      },
    },
    {
      name: "eventnode-arbitrumOne",
      script: "npx",
      args: "ts-node src/index.ts",
      env: {
        NETWORK: "arbitrumOne",
      },
    },
    {
      name: "eventnode-berachainMainnet",
      script: "npx",
      args: "ts-node src/index.ts",
      env: {
        NETWORK: "berachainMainnet",
      },
    },
    {
      name: "eventnode-berachainBArtio",
      script: "npx",
      args: "ts-node src/index.ts",
      env: {
        NETWORK: "berachainBArtio",
      },
    },
  ],
};