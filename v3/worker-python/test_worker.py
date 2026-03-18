import unittest
from unittest.mock import patch, MagicMock
from main import process_ocr_job
import os

class TestWorker(unittest.TestCase):
    @patch('main.requests.post')
    @patch('main.pytesseract.image_to_string')
    @patch('main.Image.open')
    def test_process_ocr_job_success(self, mock_image_open, mock_ocr, mock_post):
        # Mock OCR output
        mock_ocr.return_value = "Test Document NIK: 12345"
        
        # Mock Security Module response
        mock_enc_res = MagicMock()
        mock_enc_res.status_code = 200
        mock_enc_res.json.return_value = {
            "ciphertext": "encrypted-data",
            "nonce": "nonce-123",
            "hmac": "hmac-123"
        }
        
        # Mock Database response
        mock_db_res = MagicMock()
        mock_db_res.status_code = 201
        
        # Side effects for multiple post calls
        mock_post.side_effect = [mock_enc_res, mock_db_res]

        # Execute
        result = process_ocr_job("user-1", "001122", "test.png")

        self.assertTrue(result)
        mock_ocr.assert_called_once()
        self.assertEqual(mock_post.call_count, 2)

    @patch('main.requests.post')
    def test_process_ocr_job_encryption_failure(self, mock_post):
        mock_enc_res = MagicMock()
        mock_enc_res.status_code = 500
        mock_post.return_value = mock_enc_res

        with self.assertRaises(Exception):
            process_ocr_job("user-1", "001122", "test.png")

if __name__ == '__main__':
    unittest.main()
