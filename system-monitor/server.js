const http = require('http');
const { exec } = require('child_process');
const os = require('os');

const PORT = 9999;

function getSystemInfo() {
  return new Promise((resolve) => {
    const commands = {
      disk: "df -h / | tail -1 | awk '{print $2,$3,$4,$5}'",
      memory: "free -m | grep Mem | awk '{print $2,$3,$4}'",
      cpu: "top -bn1 | grep 'Cpu(s)' | awk '{print $2}'",
      uptime: "uptime -p",
      processes: "ps aux --sort=-%mem | head -11 | tail -10"
    };

    const results = {};
    let completed = 0;
    const total = Object.keys(commands).length;

    for (const [key, cmd] of Object.entries(commands)) {
      exec(cmd, (err, stdout) => {
        results[key] = err ? 'N/A' : stdout.trim();
        completed++;
        if (completed === total) {
          resolve(results);
        }
      });
    }
  });
}

function formatBytes(mb) {
  if (mb >= 1024) return (mb / 1024).toFixed(1) + ' GB';
  return mb + ' MB';
}

async function generateHTML() {
  const info = await getSystemInfo();

  // Parse disk info
  const diskParts = info.disk.split(' ');
  const diskTotal = diskParts[0] || 'N/A';
  const diskUsed = diskParts[1] || 'N/A';
  const diskFree = diskParts[2] || 'N/A';
  const diskPercent = diskParts[3] || 'N/A';

  // Parse memory info
  const memParts = info.memory.split(' ');
  const memTotal = parseInt(memParts[0]) || 0;
  const memUsed = parseInt(memParts[1]) || 0;
  const memFree = parseInt(memParts[2]) || 0;
  const memPercent = memTotal > 0 ? ((memUsed / memTotal) * 100).toFixed(1) : 0;

  // CPU info
  const cpuUsage = parseFloat(info.cpu) || 0;

  // Parse processes
  const processLines = info.processes.split('\n').map(line => {
    const parts = line.trim().split(/\s+/);
    return {
      user: parts[0],
      pid: parts[1],
      cpu: parts[2],
      mem: parts[3],
      command: parts.slice(10).join(' ').substring(0, 50)
    };
  });

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="5">
  <title>UTTEC Server Monitor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 {
      text-align: center;
      margin-bottom: 30px;
      font-size: 2rem;
      color: #4ade80;
    }
    .server-info {
      text-align: center;
      margin-bottom: 20px;
      color: #94a3b8;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background: rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 24px;
      backdrop-filter: blur(10px);
    }
    .card h2 {
      font-size: 1rem;
      color: #94a3b8;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .stat {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .stat.green { color: #4ade80; }
    .stat.yellow { color: #facc15; }
    .stat.red { color: #f87171; }
    .progress-bar {
      height: 8px;
      background: rgba(255,255,255,0.2);
      border-radius: 4px;
      overflow: hidden;
      margin-top: 12px;
    }
    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s;
    }
    .progress-fill.green { background: #4ade80; }
    .progress-fill.yellow { background: #facc15; }
    .progress-fill.red { background: #f87171; }
    .sub-text { color: #94a3b8; font-size: 0.9rem; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    th { color: #94a3b8; font-weight: 500; }
    .refresh-note {
      text-align: center;
      color: #64748b;
      margin-top: 20px;
      font-size: 0.9rem;
    }
    .btn-home {
      display: inline-block;
      background: #4ade80;
      color: #1a1a2e;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 20px;
    }
    .btn-home:hover { background: #22c55e; }
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-actions">
      <a href="/" class="btn-home">← UTTEC Home</a>
      <span class="server-info">Server: 178.128.90.37 | ${new Date().toLocaleString('ko-KR')}</span>
    </div>

    <h1>🖥️ Server Resource Monitor</h1>

    <div class="grid">
      <div class="card">
        <h2>💻 CPU Usage</h2>
        <div class="stat ${cpuUsage < 50 ? 'green' : cpuUsage < 80 ? 'yellow' : 'red'}">${cpuUsage.toFixed(1)}%</div>
        <div class="progress-bar">
          <div class="progress-fill ${cpuUsage < 50 ? 'green' : cpuUsage < 80 ? 'yellow' : 'red'}" style="width: ${cpuUsage}%"></div>
        </div>
        <p class="sub-text" style="margin-top: 12px">Cores: ${os.cpus().length}</p>
      </div>

      <div class="card">
        <h2>🧠 Memory</h2>
        <div class="stat ${memPercent < 50 ? 'green' : memPercent < 80 ? 'yellow' : 'red'}">${memPercent}%</div>
        <div class="progress-bar">
          <div class="progress-fill ${memPercent < 50 ? 'green' : memPercent < 80 ? 'yellow' : 'red'}" style="width: ${memPercent}%"></div>
        </div>
        <p class="sub-text" style="margin-top: 12px">${formatBytes(memUsed)} / ${formatBytes(memTotal)}</p>
      </div>

      <div class="card">
        <h2>💾 Disk</h2>
        <div class="stat ${parseInt(diskPercent) < 50 ? 'green' : parseInt(diskPercent) < 80 ? 'yellow' : 'red'}">${diskPercent}</div>
        <div class="progress-bar">
          <div class="progress-fill ${parseInt(diskPercent) < 50 ? 'green' : parseInt(diskPercent) < 80 ? 'yellow' : 'red'}" style="width: ${diskPercent}"></div>
        </div>
        <p class="sub-text" style="margin-top: 12px">${diskUsed} / ${diskTotal} (Free: ${diskFree})</p>
      </div>

      <div class="card">
        <h2>⏱️ Uptime</h2>
        <div class="stat green" style="font-size: 1.5rem">${info.uptime.replace('up ', '')}</div>
        <p class="sub-text" style="margin-top: 12px">Hostname: ${os.hostname()}</p>
      </div>
    </div>

    <div class="card">
      <h2>📊 Top Processes (by Memory)</h2>
      <table>
        <thead>
          <tr>
            <th>USER</th>
            <th>PID</th>
            <th>CPU%</th>
            <th>MEM%</th>
            <th>COMMAND</th>
          </tr>
        </thead>
        <tbody>
          ${processLines.map(p => `
          <tr>
            <td>${p.user}</td>
            <td>${p.pid}</td>
            <td>${p.cpu}%</td>
            <td>${p.mem}%</td>
            <td>${p.command}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <p class="refresh-note">🔄 Auto-refresh every 5 seconds</p>
  </div>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/' || req.url === '/monitor') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(await generateHTML());
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`System Monitor running at http://localhost:${PORT}`);
});
