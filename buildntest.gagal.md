Run if [ -d "v3/worker-python" ]; then
  if [ -d "v3/worker-python" ]; then
    cd v3/worker-python
    pip install -r requirements.txt
    python -m unittest discover test/
  else
    echo "v3/worker-python not found, skipping..."
  fi
  shell: /usr/bin/bash -e {0}
  env:
    NODE_VERSION: 22
    SNYK_SEVERITY: high
Defaulting to user installation because normal site-packages is not writeable
Collecting fastapi==0.110.0 (from -r requirements.txt (line 1))
  Downloading fastapi-0.110.0-py3-none-any.whl.metadata (25 kB)
Collecting uvicorn==0.27.1 (from -r requirements.txt (line 2))
  Downloading uvicorn-0.27.1-py3-none-any.whl.metadata (6.3 kB)
Collecting redis==5.0.1 (from -r requirements.txt (line 3))
  Downloading redis-5.0.1-py3-none-any.whl.metadata (8.9 kB)
Collecting pytesseract==0.3.10 (from -r requirements.txt (line 4))
  Downloading pytesseract-0.3.10-py3-none-any.whl.metadata (11 kB)
Collecting python-multipart==0.0.9 (from -r requirements.txt (line 5))
  Downloading python_multipart-0.0.9-py3-none-any.whl.metadata (2.5 kB)
Collecting pydantic==2.6.3 (from -r requirements.txt (line 6))
  Downloading pydantic-2.6.3-py3-none-any.whl.metadata (84 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 84.4/84.4 kB 2.4 MB/s eta 0:00:00
Requirement already satisfied: requests==2.31.0 in /usr/lib/python3/dist-packages (from -r requirements.txt (line 7)) (2.31.0)
Collecting python-dotenv==1.0.1 (from -r requirements.txt (line 8))
  Downloading python_dotenv-1.0.1-py3-none-any.whl.metadata (23 kB)
Collecting rq==1.16.1 (from -r requirements.txt (line 9))
  Downloading rq-1.16.1-py3-none-any.whl.metadata (5.7 kB)
Collecting rq-dashboard==0.6.1 (from -r requirements.txt (line 10))
  Downloading rq-dashboard-0.6.1.tar.gz (103 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 103.2/103.2 kB 8.3 MB/s eta 0:00:00
  Preparing metadata (setup.py): started
  Preparing metadata (setup.py): finished with status 'done'
Collecting pillow==10.2.0 (from -r requirements.txt (line 11))
  Downloading pillow-10.2.0-cp312-cp312-manylinux_2_28_x86_64.whl.metadata (9.7 kB)
Collecting aioredis==2.0.1 (from -r requirements.txt (line 12))
  Downloading aioredis-2.0.1-py3-none-any.whl.metadata (15 kB)
Collecting sentry-sdk==1.40.0 (from sentry-sdk[fastapi]==1.40.0->-r requirements.txt (line 13))
  Downloading sentry_sdk-1.40.0-py2.py3-none-any.whl.metadata (9.7 kB)
Collecting prometheus-fastapi-instrumentator==6.1.0 (from -r requirements.txt (line 14))
  Downloading prometheus_fastapi_instrumentator-6.1.0-py3-none-any.whl.metadata (13 kB)
Collecting starlette<0.37.0,>=0.36.3 (from fastapi==0.110.0->-r requirements.txt (line 1))
  Downloading starlette-0.36.3-py3-none-any.whl.metadata (5.9 kB)
Requirement already satisfied: typing-extensions>=4.8.0 in /usr/lib/python3/dist-packages (from fastapi==0.110.0->-r requirements.txt (line 1)) (4.10.0)
Requirement already satisfied: click>=7.0 in /usr/lib/python3/dist-packages (from uvicorn==0.27.1->-r requirements.txt (line 2)) (8.1.6)
Collecting h11>=0.8 (from uvicorn==0.27.1->-r requirements.txt (line 2))
  Downloading h11-0.16.0-py3-none-any.whl.metadata (8.3 kB)
Requirement already satisfied: packaging>=21.3 in /usr/lib/python3/dist-packages (from pytesseract==0.3.10->-r requirements.txt (line 4)) (24.0)
Collecting annotated-types>=0.4.0 (from pydantic==2.6.3->-r requirements.txt (line 6))
  Downloading annotated_types-0.7.0-py3-none-any.whl.metadata (15 kB)
Collecting pydantic-core==2.16.3 (from pydantic==2.6.3->-r requirements.txt (line 6))
  Downloading pydantic_core-2.16.3-cp312-cp312-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (6.5 kB)
Collecting Flask (from rq-dashboard==0.6.1->-r requirements.txt (line 10))
  Downloading flask-3.1.3-py3-none-any.whl.metadata (3.2 kB)
Collecting arrow (from rq-dashboard==0.6.1->-r requirements.txt (line 10))
  Downloading arrow-1.4.0-py3-none-any.whl.metadata (7.7 kB)
Collecting async-timeout (from aioredis==2.0.1->-r requirements.txt (line 12))
  Downloading async_timeout-5.0.1-py3-none-any.whl.metadata (5.1 kB)
Requirement already satisfied: certifi in /usr/lib/python3/dist-packages (from sentry-sdk==1.40.0->sentry-sdk[fastapi]==1.40.0->-r requirements.txt (line 13)) (2023.11.17)
Requirement already satisfied: urllib3>=1.26.11 in /usr/lib/python3/dist-packages (from sentry-sdk==1.40.0->sentry-sdk[fastapi]==1.40.0->-r requirements.txt (line 13)) (2.0.7)
Collecting prometheus-client<1.0.0,>=0.8.0 (from prometheus-fastapi-instrumentator==6.1.0->-r requirements.txt (line 14))
  Downloading prometheus_client-0.24.1-py3-none-any.whl.metadata (2.1 kB)
Collecting anyio<5,>=3.4.0 (from starlette<0.37.0,>=0.36.3->fastapi==0.110.0->-r requirements.txt (line 1))
  Downloading anyio-4.12.1-py3-none-any.whl.metadata (4.3 kB)
Requirement already satisfied: python-dateutil>=2.7.0 in /usr/lib/python3/dist-packages (from arrow->rq-dashboard==0.6.1->-r requirements.txt (line 10)) (2.8.2)
Collecting tzdata (from arrow->rq-dashboard==0.6.1->-r requirements.txt (line 10))
  Downloading tzdata-2025.3-py2.py3-none-any.whl.metadata (1.4 kB)
Collecting blinker>=1.9.0 (from Flask->rq-dashboard==0.6.1->-r requirements.txt (line 10))
  Downloading blinker-1.9.0-py3-none-any.whl.metadata (1.6 kB)
Collecting itsdangerous>=2.2.0 (from Flask->rq-dashboard==0.6.1->-r requirements.txt (line 10))
  Downloading itsdangerous-2.2.0-py3-none-any.whl.metadata (1.9 kB)
Requirement already satisfied: jinja2>=3.1.2 in /usr/lib/python3/dist-packages (from Flask->rq-dashboard==0.6.1->-r requirements.txt (line 10)) (3.1.2)
Requirement already satisfied: markupsafe>=2.1.1 in /usr/lib/python3/dist-packages (from Flask->rq-dashboard==0.6.1->-r requirements.txt (line 10)) (2.1.5)
Collecting werkzeug>=3.1.0 (from Flask->rq-dashboard==0.6.1->-r requirements.txt (line 10))
  Downloading werkzeug-3.1.6-py3-none-any.whl.metadata (4.0 kB)
Requirement already satisfied: idna>=2.8 in /usr/lib/python3/dist-packages (from anyio<5,>=3.4.0->starlette<0.37.0,>=0.36.3->fastapi==0.110.0->-r requirements.txt (line 1)) (3.6)
Downloading fastapi-0.110.0-py3-none-any.whl (92 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 92.1/92.1 kB 14.2 MB/s eta 0:00:00
Downloading uvicorn-0.27.1-py3-none-any.whl (60 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 60.8/60.8 kB 12.5 MB/s eta 0:00:00
Downloading redis-5.0.1-py3-none-any.whl (250 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 250.3/250.3 kB 8.3 MB/s eta 0:00:00
Downloading pytesseract-0.3.10-py3-none-any.whl (14 kB)
Downloading python_multipart-0.0.9-py3-none-any.whl (22 kB)
Downloading pydantic-2.6.3-py3-none-any.whl (395 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 395.2/395.2 kB 29.7 MB/s eta 0:00:00
Downloading python_dotenv-1.0.1-py3-none-any.whl (19 kB)
Downloading rq-1.16.1-py3-none-any.whl (89 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 89.7/89.7 kB 34.5 MB/s eta 0:00:00
Downloading pillow-10.2.0-cp312-cp312-manylinux_2_28_x86_64.whl (4.5 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 4.5/4.5 MB 61.3 MB/s eta 0:00:00
Downloading aioredis-2.0.1-py3-none-any.whl (71 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 71.2/71.2 kB 28.4 MB/s eta 0:00:00
Downloading sentry_sdk-1.40.0-py2.py3-none-any.whl (257 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 257.5/257.5 kB 78.5 MB/s eta 0:00:00
Downloading prometheus_fastapi_instrumentator-6.1.0-py3-none-any.whl (18 kB)
Downloading pydantic_core-2.16.3-cp312-cp312-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (2.2 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 2.2/2.2 MB 153.8 MB/s eta 0:00:00
Downloading annotated_types-0.7.0-py3-none-any.whl (13 kB)
Downloading h11-0.16.0-py3-none-any.whl (37 kB)
Downloading prometheus_client-0.24.1-py3-none-any.whl (64 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 64.1/64.1 kB 24.6 MB/s eta 0:00:00
Downloading starlette-0.36.3-py3-none-any.whl (71 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 71.5/71.5 kB 27.4 MB/s eta 0:00:00
Downloading arrow-1.4.0-py3-none-any.whl (68 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 68.8/68.8 kB 26.7 MB/s eta 0:00:00
Downloading async_timeout-5.0.1-py3-none-any.whl (6.2 kB)
Downloading flask-3.1.3-py3-none-any.whl (103 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 103.4/103.4 kB 40.0 MB/s eta 0:00:00
Downloading anyio-4.12.1-py3-none-any.whl (113 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 113.6/113.6 kB 38.6 MB/s eta 0:00:00
Downloading blinker-1.9.0-py3-none-any.whl (8.5 kB)
Downloading itsdangerous-2.2.0-py3-none-any.whl (16 kB)
Downloading werkzeug-3.1.6-py3-none-any.whl (225 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 225.2/225.2 kB 51.3 MB/s eta 0:00:00
Downloading tzdata-2025.3-py2.py3-none-any.whl (348 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 348.5/348.5 kB 93.6 MB/s eta 0:00:00
Building wheels for collected packages: rq-dashboard
  Building wheel for rq-dashboard (setup.py): started
  Building wheel for rq-dashboard (setup.py): finished with status 'done'
  Created wheel for rq-dashboard: filename=rq_dashboard-0.6.1-py2.py3-none-any.whl size=105247 sha256=f14db0b7b9da0c75e93c96680f9e2569c4c25379a96e841b2367995af9ba0b24
  Stored in directory: /home/runner/.cache/pip/wheels/d2/d4/40/23603cac3db12752aec3af5b7bbb4f588559004ebfbb6ca8d7
Successfully built rq-dashboard
Installing collected packages: werkzeug, tzdata, sentry-sdk, redis, python-multipart, python-dotenv, pydantic-core, prometheus-client, pillow, itsdangerous, h11, blinker, async-timeout, anyio, annotated-types, uvicorn, starlette, rq, pytesseract, pydantic, Flask, arrow, aioredis, rq-dashboard, fastapi, prometheus-fastapi-instrumentator
Successfully installed Flask-3.1.3 aioredis-2.0.1 annotated-types-0.7.0 anyio-4.12.1 arrow-1.4.0 async-timeout-5.0.1 blinker-1.9.0 fastapi-0.110.0 h11-0.16.0 itsdangerous-2.2.0 pillow-10.2.0 prometheus-client-0.24.1 prometheus-fastapi-instrumentator-6.1.0 pydantic-2.6.3 pydantic-core-2.16.3 pytesseract-0.3.10 python-dotenv-1.0.1 python-multipart-0.0.9 redis-5.0.1 rq-1.16.1 rq-dashboard-0.6.1 sentry-sdk-1.40.0 starlette-0.36.3 tzdata-2025.3 uvicorn-0.27.1 werkzeug-3.1.6
Traceback (most recent call last):
  File "<frozen runpy>", line 198, in _run_module_as_main
  File "<frozen runpy>", line 88, in _run_code
  File "/usr/lib/python3.12/unittest/__main__.py", line 18, in <module>
    main(module=None)
  File "/usr/lib/python3.12/unittest/main.py", line 104, in __init__
    self.parseArgs(argv)
  File "/usr/lib/python3.12/unittest/main.py", line 130, in parseArgs
    self._do_discovery(argv[2:])
  File "/usr/lib/python3.12/unittest/main.py", line 253, in _do_discovery
    self.createTests(from_discovery=True, Loader=Loader)
  File "/usr/lib/python3.12/unittest/main.py", line 160, in createTests
    self.test = loader.discover(self.start, self.pattern, self.top)
                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/lib/python3.12/unittest/loader.py", line 307, in discover
    raise ImportError('Start directory is not importable: %r' % start_dir)
ImportError: Start directory is not importable: 'test/'
Error: Process completed with exit code 1.