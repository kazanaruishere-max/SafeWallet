Run cd v3/gateway-nest
npm warn deprecated supertest@6.3.4: Please upgrade to supertest v7.1.3+, see release notes at https://github.com/forwardemail/supertest/releases/tag/v7.1.3 - maintenance is supported by Forward Email @ https://forwardemail.net
npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated superagent@8.1.2: Please upgrade to superagent v10.2.2+, see release notes at https://github.com/forwardemail/superagent/releases/tag/v10.2.2 - maintenance is supported by Forward Email @ https://forwardemail.net
npm warn deprecated glob@10.4.5: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.

added 734 packages, and audited 735 packages in 48s

130 packages are looking for funding
  run `npm fund` for details

24 vulnerabilities (4 low, 10 moderate, 10 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

> gateway-nest@0.1.0 test
> jest --config jest.config.js --coverage

FAIL test/scan.controller.spec.ts
  ● Test suite failed to run

    test/scan.controller.spec.ts:4:32 - error TS2307: Cannot find module '@nestjs/throttler' or its corresponding type declarations.

    4 import { ThrottlerGuard } from '@nestjs/throttler';
                                     ~~~~~~~~~~~~~~~~~~~

FAIL test/scan.service.spec.ts
  ● Test suite failed to run

    test/scan.service.spec.ts:3:31 - error TS2307: Cannot find module '@nestjs/bull' or its corresponding type declarations.

    3 import { getQueueToken } from '@nestjs/bull';
                                    ~~~~~~~~~~~~~~
    test/scan.service.spec.ts:4:19 - error TS2307: Cannot find module 'axios' or its corresponding type declarations.

    4 import axios from 'axios';
                        ~~~~~~~

PASS test/auth.spec.ts
Failed to collect coverage from /home/runner/work/SafeWallet/SafeWallet/v3/gateway-nest/src/scan.controller.ts
ERROR: src/scan.controller.ts:4:67 - error TS2307: Cannot find module '@nestjs/swagger' or its corresponding type declarations.

4 import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
                                                                    ~~~~~~~~~~~~~~~~~
src/scan.controller.ts:19:50 - error TS2694: Namespace 'global.Express' has no exported member 'Multer'.

19   async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('user_id') userId: string) {
                                                    ~~~~~~
STACK: 
Failed to collect coverage from /home/runner/work/SafeWallet/SafeWallet/v3/gateway-nest/src/app.module.ts
ERROR: src/app.module.ts:2:28 - error TS2307: Cannot find module '@nestjs/bull' or its corresponding type declarations.

2 import { BullModule } from '@nestjs/bull';
                             ~~~~~~~~~~~~~~
src/app.module.ts:6:33 - error TS2307: Cannot find module '@nestjs/throttler' or its corresponding type declarations.

6 import { ThrottlerModule } from '@nestjs/throttler';
                                  ~~~~~~~~~~~~~~~~~~~
src/app.module.ts:7:46 - error TS2307: Cannot find module '@nest-lab/throttler-storage-redis' or its corresponding type declarations.

7 import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
                                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
src/app.module.ts:10:32 - error TS2307: Cannot find module '@nestjs/throttler' or its corresponding type declarations.

10 import { ThrottlerGuard } from '@nestjs/throttler';
                                  ~~~~~~~~~~~~~~~~~~~
src/app.module.ts:13:32 - error TS2307: Cannot find module '@nestjs/terminus' or its corresponding type declarations.

13 import { TerminusModule } from '@nestjs/terminus';
                                  ~~~~~~~~~~~~~~~~~~
STACK: 
Failed to collect coverage from /home/runner/work/SafeWallet/SafeWallet/v3/gateway-nest/src/scan.service.ts
ERROR: src/scan.service.ts:2:29 - error TS2307: Cannot find module '@nestjs/bull' or its corresponding type declarations.

2 import { InjectQueue } from '@nestjs/bull';
                              ~~~~~~~~~~~~~~
src/scan.service.ts:3:23 - error TS2307: Cannot find module 'bull' or its corresponding type declarations.

3 import { Queue } from 'bull';
                        ~~~~~~
src/scan.service.ts:4:19 - error TS2307: Cannot find module 'axios' or its corresponding type declarations.

4 import axios from 'axios';
                    ~~~~~~~
src/scan.service.ts:10:52 - error TS2694: Namespace 'global.Express' has no exported member 'Multer'.

10   async queueOcrTask(userId: string, file: Express.Multer.File) {
                                                      ~~~~~~
STACK: 
Failed to collect coverage from /home/runner/work/SafeWallet/SafeWallet/v3/gateway-nest/src/main.ts
ERROR: src/main.ts:3:48 - error TS2307: Cannot find module '@nestjs/swagger' or its corresponding type declarations.

3 import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
                                                 ~~~~~~~~~~~~~~~~~
STACK: 
Failed to collect coverage from /home/runner/work/SafeWallet/SafeWallet/v3/gateway-nest/src/common/filters/http-exception.filter.ts
ERROR: src/common/filters/http-exception.filter.ts:9:25 - error TS2307: Cannot find module '@sentry/nestjs' or its corresponding type declarations.

9 import * as Sentry from '@sentry/nestjs';
                          ~~~~~~~~~~~~~~~~
STACK: 
---------------------------|---------|----------|---------|---------|-------------------
File                       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------------------|---------|----------|---------|---------|-------------------
All files                  |      25 |       40 |   33.33 |   26.66 |                   
 auth                      |    30.3 |       40 |      50 |      32 |                   
  auth.module.ts           |       0 |      100 |       0 |       0 | 1-22              
  jwt-auth.guard.ts        |       0 |      100 |     100 |       0 | 1-5               
  jwt.strategy.ts          |     100 |      100 |     100 |     100 |                   
  mfa.guard.ts             |       0 |        0 |       0 |       0 | 1-29              
 common/interceptors       |       0 |      100 |       0 |       0 |                   
  transform.interceptor.ts |       0 |      100 |       0 |       0 | 1-25              
---------------------------|---------|----------|---------|---------|-------------------

Test Suites: 2 failed, 1 passed, 3 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        10.528 s
Ran all test suites.
Error: Process completed with exit code 1.