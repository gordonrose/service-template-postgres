const processStartTimeSeconds = Math.floor(Date.now() / 1000);

const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) {
    return '0';
  }

  return value.toFixed(3);
};

export const renderMetrics = (): string => {
  const lines = [
    '# HELP process_uptime_seconds Node.js process uptime in seconds.',
    '# TYPE process_uptime_seconds gauge',
    `process_uptime_seconds ${formatNumber(process.uptime())}`,
    '# HELP process_start_time_seconds Unix time when the process started.',
    '# TYPE process_start_time_seconds gauge',
    `process_start_time_seconds ${processStartTimeSeconds}`,
  ];

  return `${lines.join('\n')}\n`;
};
