module.exports = {
  apps: [
    {
      name: "3dlabs",
      script: "app.js",
      args: "start",
      error_file: "./err.log",
      watch: ".",
      ignore_watch: ["node_modules"],
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
