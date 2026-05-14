## TESTING INI MENGGUNAKAN TOOLS KALI LINUX

1. NUCLEI
   [WRN] Found 1 templates with runtime error (use -validate flag for further examination)
   [INF] Current nuclei version: v3.7.1 (outdated)
   [INF] Current nuclei-templates version: v10.4.3 (latest)
   [INF] New templates added in latest release: 103
   [INF] Templates loaded for current scan: 10194
   [INF] Executing 10178 signed templates from projectdiscovery/nuclei-templates
   [WRN] Loading 16 unsigned templates for scan. Use with caution.
   [INF] Targets loaded for current scan: 1
   [INF] Templates clustered: 2292 (Reduced 2162 Requests)
   [wildcard-dns-detect] [dns] [info] 3Dhs90gg5vmYOxQOl6GXRwoiO2L-3Dhs90gg5vmYOxQOl6GXRwoiO2L.safe-wallet-orpin.vercel.app ["64.29.17.195","216.198.79.195"]
   [INF] Using Interactsh Server: oast.live
   [tls-version] [ssl] [info] safe-wallet-orpin.vercel.app:443 ["tls12"]
   [tls-version] [ssl] [info] safe-wallet-orpin.vercel.app:443 ["tls13"]
   [http-missing-security-headers:strict-transport-security] [http] [info] https://safe-wallet-orpin.vercel.app
   [http-missing-security-headers:content-security-policy] [http] [info] https://safe-wallet-orpin.vercel.app
   [http-missing-security-headers:permissions-policy] [http] [info] https://safe-wallet-orpin.vercel.app
   [http-missing-security-headers:x-frame-options] [http] [info] https://safe-wallet-orpin.vercel.app
   [http-missing-security-headers:x-content-type-options] [http] [info] https://safe-wallet-orpin.vercel.app
   [http-missing-security-headers:referrer-policy] [http] [info] https://safe-wallet-orpin.vercel.app
   [http-missing-security-headers:x-permitted-cross-domain-policies] [http] [info] https://safe-wallet-orpin.vercel.app
   [http-missing-security-headers:clear-site-data] [http] [info] https://safe-wallet-orpin.vercel.app
   [http-missing-security-headers:cross-origin-embedder-policy] [http] [info] https://safe-wallet-orpin.vercel.app
   [http-missing-security-headers:cross-origin-opener-policy] [http] [info] https://safe-wallet-orpin.vercel.app
   [http-missing-security-headers:cross-origin-resource-policy] [http] [info] https://safe-wallet-orpin.vercel.app
   [caa-fingerprint] [dns] [info] safe-wallet-orpin.vercel.app
   [ssl-issuer] [ssl] [info] safe-wallet-orpin.vercel.app:443 ["Google Trust Services"]
   [ssl-dns-names] [ssl] [info] safe-wallet-orpin.vercel.app:443 ["*.vercel.app","vercel.app"]
   [wildcard-tls] [ssl] [info] safe-wallet-orpin.vercel.app:443 ["CN: _.vercel.app","SAN: [_.vercel.app vercel.app]"]
   [INF] Scan completed in 5m. 18 matches found.

2. SQLMAP
   [15:06:39] [INFO] testing connection to the target URL
   [15:06:39] [WARNING] the web server responded with an HTTP error code (403) which could interfere with the results of the tests
   [15:06:39] [INFO] checking if the target is protected by some kind of WAF/IPS
   [15:06:39] [INFO] testing if the target URL content is stable
   [15:06:40] [WARNING] target URL content is not stable (i.e. content differs). sqlmap will base the page comparison on a sequence matcher. If no dynamic nor injectable parameters are detected, or in case of junk results, refer to user's manual paragraph 'Page comparison'
   how do you want to proceed? [(C)ontinue/(s)tring/(r)egex/(q)uit] C
   [15:06:40] [INFO] testing if POST parameter 'content' is dynamic
   [15:06:40] [WARNING] POST parameter 'content' does not appear to be dynamic
   [15:06:40] [WARNING] heuristic (basic) test shows that POST parameter 'content' might not be injectable
   [15:06:41] [INFO] testing for SQL injection on POST parameter 'content'
   [15:06:41] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
   [15:06:46] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (subquery - comment)'
   [15:06:50] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (comment)'
   [15:06:53] [INFO] testing 'MySQL RLIKE boolean-based blind - WHERE, HAVING, ORDER BY or GROUP BY clause'
   [15:06:58] [INFO] testing 'PostgreSQL AND boolean-based blind - WHERE or HAVING clause (CAST)'
   [15:07:03] [INFO] testing 'Oracle AND boolean-based blind - WHERE or HAVING clause (CTXSYS.DRITHSX.SN)'
   [15:07:09] [INFO] testing 'SQLite AND boolean-based blind - WHERE, HAVING, GROUP BY or HAVING clause (JSON)'
   [15:07:14] [INFO] testing 'Boolean-based blind - Parameter replace (original value)'
   [15:07:14] [INFO] testing 'Boolean-based blind - Parameter replace (DUAL)'
   [15:07:14] [INFO] testing 'Boolean-based blind - Parameter replace (CASE)'
   [15:07:15] [INFO] testing 'MySQL >= 5.0 boolean-based blind - ORDER BY, GROUP BY clause'
   [15:07:15] [INFO] testing 'PostgreSQL boolean-based blind - ORDER BY, GROUP BY clause'
   [15:07:16] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)'
   [15:07:17] [INFO] testing 'MySQL >= 5.6 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (GTID_SUBSET)'
   [15:07:19] [INFO] testing 'PostgreSQL AND error-based - WHERE or HAVING clause'
   [15:07:21] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (IN)'
   [15:07:22] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONVERT)'
   [15:07:24] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONCAT)'
   [15:07:25] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (XMLType)'
   [15:07:27] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (UTL_INADDR.GET_HOST_ADDRESS)'
   [15:07:29] [INFO] testing 'MySQL >= 5.1 error-based - PROCEDURE ANALYSE (EXTRACTVALUE)'
   [15:07:30] [INFO] testing 'MySQL >= 5.1 error-based - Parameter replace (EXTRACTVALUE)'
   [15:07:30] [INFO] testing 'PostgreSQL error-based - Parameter replace'
   [15:07:31] [INFO] testing 'Microsoft SQL Server/Sybase error-based - Stacking (EXEC)'
   [15:07:32] [INFO] testing 'Generic inline queries'
   [15:07:32] [INFO] testing 'MySQL inline queries'
   [15:07:32] [INFO] testing 'PostgreSQL inline queries'
   [15:07:32] [INFO] testing 'Microsoft SQL Server/Sybase inline queries'
   [15:07:32] [INFO] testing 'Oracle inline queries'
   [15:07:32] [INFO] testing 'MySQL >= 5.0.12 stacked queries (comment)'
   [15:07:34] [INFO] testing 'PostgreSQL > 8.1 stacked queries (comment)'
   [15:07:35] [INFO] testing 'PostgreSQL stacked queries (heavy query - comment)'
   [15:07:36] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (comment)'
   [15:07:37] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (DECLARE - comment)'
   [15:07:39] [INFO] testing 'Oracle stacked queries (DBMS_PIPE.RECEIVE_MESSAGE - comment)'
   [15:07:40] [INFO] testing 'Oracle stacked queries (heavy query - comment)'
   [15:07:41] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)'
   [15:07:42] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP)'
   [15:07:44] [INFO] testing 'MySQL < 5.0.12 AND time-based blind (BENCHMARK)'
   [15:07:46] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind'
   [15:07:47] [INFO] testing 'PostgreSQL > 8.1 AND time-based blind'
   [15:07:49] [INFO] testing 'PostgreSQL AND time-based blind (heavy query)'
   [15:07:51] [INFO] testing 'Microsoft SQL Server/Sybase time-based blind (IF)'
   [15:07:53] [INFO] testing 'Microsoft SQL Server/Sybase AND time-based blind (heavy query)'
   [15:07:54] [INFO] testing 'Oracle AND time-based blind'
   [15:07:56] [INFO] testing 'Oracle AND time-based blind (heavy query)'
   [15:07:57] [INFO] testing 'Informix AND time-based blind (heavy query)'
   [15:07:59] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace'
   it is recommended to perform only basic UNION tests if there is not at least one other (potential) technique found. Do you want to reduce the number of requests? [Y/n] Y
   [15:07:59] [INFO] testing 'Generic UNION query (NULL) - 1 to 10 columns'
   [15:08:02] [INFO] testing 'MySQL UNION query (NULL) - 1 to 10 columns'
   [15:08:06] [WARNING] POST parameter 'content' does not seem to be injectable
   [15:08:06] [CRITICAL] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests. Please retry with the switch '--text-only' (along with --technique=BU) as this case looks like a perfect candidate (low textual content along with inability of comparison engine to detect at least one dynamic parameter). If you suspect that there is some kind of protection mechanism involved (e.g. WAF) maybe you could try to use option '--tamper' (e.g. '--tamper=space2comment') and/or switch '--random-agent'
   [15:08:06] [WARNING] HTTP error codes detected during run:
   403 (Forbidden) - 620 times

[*] ending @ 15:08:06 /2026-05-14/

3. GOBUSTER
   500 (Status: 500) [Size: 5934]
