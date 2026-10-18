"""Exercise the real FastAPI server using only runtime and stdlib dependencies."""
import json
from pathlib import Path
import socket
import threading
import time
import unittest
from urllib.error import HTTPError
from urllib.request import urlopen

import uvicorn

from main import app

ROOT = Path(__file__).resolve().parents[1]


class ServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sock = socket.socket()
        cls.sock.bind(('127.0.0.1', 0))
        cls.base = f'http://127.0.0.1:{cls.sock.getsockname()[1]}'
        cls.server = uvicorn.Server(uvicorn.Config(app, log_level='error'))
        cls.thread = threading.Thread(
            target=cls.server.run, kwargs={'sockets': [cls.sock]}, daemon=True
        )
        cls.thread.start()
        deadline = time.monotonic() + 10
        while not cls.server.started:
            if not cls.thread.is_alive() or time.monotonic() > deadline:
                cls.server.should_exit = True
                cls.thread.join(timeout=3)
                cls.sock.close()
                raise RuntimeError('Preview server failed to start')
            time.sleep(0.02)

    @classmethod
    def tearDownClass(cls):
        cls.server.should_exit = True
        cls.thread.join(timeout=5)
        cls.sock.close()

    def test_pages_files_match_local_preview(self):
        for path, source in [('/', 'index.html'), ('/index.html', 'index.html'),
                             ('/assets/app.js', 'assets/app.js'),
                             ('/assets/theme.css', 'assets/theme.css'),
                             ('/assets/model.js', 'assets/model.js'),
                             ('/content/examples.js', 'content/examples.js')]:
            with self.subTest(path=path), urlopen(self.base + path, timeout=3) as response:
                self.assertEqual(response.status, 200)
                self.assertEqual(response.read(), (ROOT / source).read_bytes())
                if path.endswith('.js'):
                    self.assertIn('javascript', response.headers['Content-Type'])

    def test_health(self):
        with urlopen(self.base + '/health', timeout=3) as response:
            self.assertEqual(json.load(response), {'status': 'ok'})

    def test_missing_and_nonpublic_files(self):
        for path in ['/missing', '/main.py', '/requirements.txt', '/.git/config',
                     '/assets/../main.py', '/content/../main.py']:
            with self.subTest(path=path), self.assertRaises(HTTPError) as error:
                urlopen(self.base + path, timeout=3)
            self.assertEqual(error.exception.code, 404)


if __name__ == '__main__':
    unittest.main()
