module.exports = {
  apps: [{
    name: 'medusa-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/home/raychou/projects/frontend',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8000
    },
    log_file: '/home/raychou/logs/frontend-combined.log',
    out_file: '/home/raychou/logs/frontend-out.log',
    error_file: '/home/raychou/logs/frontend-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
}
