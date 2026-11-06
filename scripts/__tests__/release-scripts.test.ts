import { spawnSync } from 'child_process';
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { delimiter, join } from 'path';

const scriptsDir = join(__dirname, '..');
const repoRoot = join(scriptsDir, '..');

const FAKE_NPM = `#!/bin/sh
echo "$@" >> "$FAKE_NPM_LOG"
printf '%s' "$FAKE_NPM_STDOUT"
printf '%s' "$FAKE_NPM_STDERR" >&2
exit "\${FAKE_NPM_STATUS:-0}"
`;

interface Fixture {
  root: string;
  npmLog: string;
  config: () => string;
  packageJson: () => { name: string; version: string; [key: string]: unknown };
  run: (
    script: string,
    args?: string[],
    npm?: { stdout?: string; stderr?: string; status?: number }
  ) => { status: number | null; stdout: string; stderr: string };
}

const fixtures: string[] = [];

const createFixture = ({
  version = '1.2.3',
  config = "export const PACKAGE_SUFFIX = '';\n\nexport const BACKEND_DOMAIN = '';\n",
  packageVersion = '1.2.3',
} = {}): Fixture => {
  const root = mkdtempSync(join(tmpdir(), 'adgeist-release-'));
  fixtures.push(root);

  mkdirSync(join(root, 'scripts'));
  mkdirSync(join(root, 'src'));
  mkdirSync(join(root, 'bin'));
  for (const script of ['configure-build.js', 'sync-version.js']) {
    copyFileSync(join(scriptsDir, script), join(root, 'scripts', script));
  }
  writeFileSync(
    join(root, 'src/constants.ts'),
    `export const PACKAGE_VERSION_TAG = 'RN';\nexport const PACKAGE_VERSION = '${version}';\n`
  );
  writeFileSync(join(root, 'src/config.ts'), config);
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify(
      { name: '@scope/pkg', version: packageVersion, adgeistKit: { a: 1 } },
      null,
      2
    ) + '\n'
  );
  const npm = join(root, 'bin', 'npm');
  writeFileSync(npm, FAKE_NPM);
  chmodSync(npm, 0o755);

  const npmLog = join(root, 'npm.log');

  return {
    root,
    npmLog,
    config: () => readFileSync(join(root, 'src/config.ts'), 'utf8'),
    packageJson: () =>
      JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')),
    run: (script, args = [], npmResult = {}) => {
      const result = spawnSync(
        process.execPath,
        [join(root, 'scripts', script), ...args],
        {
          encoding: 'utf8',
          env: {
            ...process.env,
            PATH: `${join(root, 'bin')}${delimiter}${process.env.PATH}`,
            FAKE_NPM_LOG: npmLog,
            FAKE_NPM_STDOUT: npmResult.stdout ?? '',
            FAKE_NPM_STDERR: npmResult.stderr ?? '',
            FAKE_NPM_STATUS: String(npmResult.status ?? 0),
          },
        }
      );
      return {
        status: result.status,
        stdout: result.stdout,
        stderr: result.stderr,
      };
    },
  };
};

const configValue = (config: string, name: string) =>
  config.match(new RegExp(`export const ${name} = '([^']*)'`))?.[1];

afterAll(() => {
  for (const root of fixtures) {
    rmSync(root, { recursive: true, force: true });
  }
});

const describeUnix = process.platform === 'win32' ? describe.skip : describe;

describe('repository version', () => {
  it('PACKAGE_VERSION is a plain x.y.z', () => {
    const constants = readFileSync(join(repoRoot, 'src/constants.ts'), 'utf8');

    expect(configValue(constants, 'PACKAGE_VERSION')).toMatch(
      /^\d+\.\d+\.\d+$/
    );
  });
});

describeUnix('configure-build', () => {
  it.each([
    ['beta', '-beta', /^https:\/\/beta\./],
    ['qa', '-qa', /^https:\/\/qa\./],
    ['prod', '', /^https:\/\//],
  ])('%s sets the suffix and backend domain', (env, suffix, domain) => {
    const fixture = createFixture();

    const result = fixture.run('configure-build.js', [env]);

    expect(result.status).toBe(0);
    expect(configValue(fixture.config(), 'PACKAGE_SUFFIX')).toBe(suffix);
    expect(configValue(fixture.config(), 'BACKEND_DOMAIN')).toMatch(domain);
    expect(existsSync(fixture.npmLog)).toBe(false);
  });

  it('replaces previously configured values', () => {
    const fixture = createFixture({
      config:
        "export const PACKAGE_SUFFIX = '-beta.3';\n\nexport const BACKEND_DOMAIN = 'https://old.test';\n",
    });

    fixture.run('configure-build.js', ['qa']);

    expect(configValue(fixture.config(), 'PACKAGE_SUFFIX')).toBe('-qa');
    expect(configValue(fixture.config(), 'BACKEND_DOMAIN')).toMatch(
      /^https:\/\/qa\./
    );
  });

  it.each([[[]], [['staging']]])(
    'rejects %p and leaves config untouched',
    (args) => {
      const fixture = createFixture();
      const before = fixture.config();

      const result = fixture.run('configure-build.js', args);

      expect(result.status).toBe(1);
      expect(result.stderr).toContain('Unknown environment');
      expect(fixture.config()).toBe(before);
    }
  );

  it('rejects a PACKAGE_VERSION with a suffix', () => {
    const fixture = createFixture({ version: '1.2.3-beta' });

    const result = fixture.run('configure-build.js', ['beta']);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('plain x.y.z');
  });

  it('beta --publish picks the next unpublished beta number', () => {
    const fixture = createFixture();

    const result = fixture.run('configure-build.js', ['beta', '--publish'], {
      stdout: JSON.stringify([
        '1.2.2-beta.9',
        '1.2.3-beta.1',
        '1.2.3-beta.3',
        '1.2.3-beta.x',
        '1.2.3-qa',
        '1.2.3',
      ]),
    });

    expect(result.status).toBe(0);
    expect(configValue(fixture.config(), 'PACKAGE_SUFFIX')).toBe('-beta.4');
    expect(readFileSync(fixture.npmLog, 'utf8').trim()).toBe(
      'view @scope/pkg versions --json'
    );
  });

  it('beta --publish handles a single published version string', () => {
    const fixture = createFixture();

    fixture.run('configure-build.js', ['beta', '--publish'], {
      stdout: JSON.stringify('1.2.3-beta.2'),
    });

    expect(configValue(fixture.config(), 'PACKAGE_SUFFIX')).toBe('-beta.3');
  });

  it('beta --publish starts at 1 for an unpublished package', () => {
    const fixture = createFixture();

    const result = fixture.run('configure-build.js', ['beta', '--publish'], {
      stderr: 'npm error code E404',
      status: 1,
    });

    expect(result.status).toBe(0);
    expect(configValue(fixture.config(), 'PACKAGE_SUFFIX')).toBe('-beta.1');
  });

  it('beta --publish fails when npm is unreachable', () => {
    const fixture = createFixture();
    const before = fixture.config();

    const result = fixture.run('configure-build.js', ['beta', '--publish'], {
      stderr: 'npm error code ETIMEDOUT',
      status: 1,
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Could not read published versions');
    expect(fixture.config()).toBe(before);
  });

  it.each(['qa', 'prod'])('%s --publish does not query npm', (env) => {
    const fixture = createFixture();

    const result = fixture.run('configure-build.js', [env, '--publish']);

    expect(result.status).toBe(0);
    expect(existsSync(fixture.npmLog)).toBe(false);
  });
});

describeUnix('sync-version', () => {
  it('writes PACKAGE_VERSION plus suffix into package.json', () => {
    const fixture = createFixture({
      config:
        "export const PACKAGE_SUFFIX = '-beta.4';\n\nexport const BACKEND_DOMAIN = 'https://x.test';\n",
    });

    const result = fixture.run('sync-version.js');

    expect(result.status).toBe(0);
    expect(fixture.packageJson()).toEqual({
      name: '@scope/pkg',
      version: '1.2.3-beta.4',
      adgeistKit: { a: 1 },
    });
  });

  it('leaves package.json untouched when already in sync', () => {
    const fixture = createFixture();
    const path = join(fixture.root, 'package.json');
    writeFileSync(path, '{"name":"@scope/pkg","version":"1.2.3"}');

    const result = fixture.run('sync-version.js');

    expect(result.status).toBe(0);
    expect(readFileSync(path, 'utf8')).toBe(
      '{"name":"@scope/pkg","version":"1.2.3"}'
    );
  });

  it('fails without PACKAGE_SUFFIX', () => {
    const fixture = createFixture({ config: '' });

    const result = fixture.run('sync-version.js');

    expect(result.status).toBe(1);
    expect(fixture.packageJson().version).toBe('1.2.3');
  });

  it('produces the version the publish workflow expects after configure-build', () => {
    const fixture = createFixture();

    fixture.run('configure-build.js', ['qa', '--publish']);
    fixture.run('sync-version.js');

    expect(fixture.packageJson().version).toBe('1.2.3-qa');
  });
});
