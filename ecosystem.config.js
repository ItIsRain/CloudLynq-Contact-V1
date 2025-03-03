module.exports = {
  apps: [
    {
      name: "lynq-contacts",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "0.0.0.0",
        HOSTNAME: "0.0.0.0"
      },
      instances: 1,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "0.0.0.0",
        HOSTNAME: "0.0.0.0"
      }
    }
  ]
} 