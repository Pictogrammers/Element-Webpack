#!/usr/bin/env node

import { spawnSync } from 'child_process';

const cmd = "node --experimental-vm-modules ./node_modules/jest/bin/jest --no-cache";
spawnSync(cmd, [
    'experimental-vm-modules',
    'disable-warning=ExperimentalWarning'
], {
    stdio: "inherit",
    shell: true,
    env: {
        ...process.env,
        NODE_ENV: 'test'
    }
});