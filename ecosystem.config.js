module.exports = {
  apps: [
    {
      name: 'spendxp',
      script: 'node_modules/next/dist/bin/next',
      args: 'dev --port 9002 --turbopack',
      cwd: 'D:\\SpendXP Main\\SpendXP',
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
