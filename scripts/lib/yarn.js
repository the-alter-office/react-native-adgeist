const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '../..');

const YARN_CLASSIC = 'yarn@1.22.22';

const COREPACK_ENV = {
  COREPACK_ENABLE_AUTO_PIN: '0',
  COREPACK_ENABLE_DOWNLOAD_PROMPT: '0',
};

function run(command, args, cwd) {
  console.log(`\n$ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, CI: 'true', ...COREPACK_ENV },
  });
  if (result.error) {
    throw new Error(`${command} could not start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`${command} ${args[0] ?? ''} exited with code ${result.status}`);
  }
}

function assertYarnClassic(cwd) {
  const where = path.relative(root, cwd) || '.';
  const result = spawnSync('yarn', ['--version'], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...COREPACK_ENV },
  });
  if (result.error || result.status !== 0) {
    throw new Error(
      `yarn --version failed in ${where}: ${(result.stderr || result.error?.message || '').trim()}`
    );
  }
  const version = result.stdout.trim().split('\n').pop();
  if (!version.startsWith('1.')) {
    throw new Error(
      `Yarn classic 1.x is required in ${where}, found ${version}. Check the "packageManager" field and any .yarnrc.yml there and in the repo root.`
    );
  }
}

module.exports = { YARN_CLASSIC, COREPACK_ENV, run, assertYarnClassic };
