// v3/security-rust/src/main.rs
use axum::{
    routing::{post, get},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use std::net::SocketAddr;
use dotenvy::dotenv;
use std::env;

type HmacSha256 = Hmac<Sha256>;

#[derive(Deserialize)]
struct EncryptRequest {
    plaintext: String,
    key: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct EncryptResponse {
    ciphertext: String,
    nonce: String,
    hmac: String,
}

#[derive(Deserialize)]
struct DecryptRequest {
    ciphertext: String,
    nonce: String,
    hmac: String,
    key: String,
}

#[derive(Serialize)]
struct DecryptResponse {
    plaintext: String,
}

async fn encrypt_handler(Json(payload): Json<EncryptRequest>) -> Json<EncryptResponse> {
    let key_bytes = hex::decode(&payload.key).expect("Invalid key hex");
    let cipher = Aes256Gcm::new_from_slice(&key_bytes).expect("Invalid key length");
    
    let nonce_bytes = rand::random::<[u8; 12]>();
    let nonce = Nonce::from_slice(&nonce_bytes);
    
    let ciphertext = cipher
        .encrypt(nonce, payload.plaintext.as_bytes().as_ref())
        .expect("Encryption failure");

    // Calculate HMAC for integrity
    let mut mac = <HmacSha256 as KeyInit>::new_from_slice(&key_bytes).expect("HMAC key error");
    mac.update(&ciphertext);
    let hmac_result = mac.finalize().into_bytes();

    Json(EncryptResponse {
        ciphertext: hex::encode(ciphertext),
        nonce: hex::encode(nonce_bytes),
        hmac: hex::encode(hmac_result),
    })
}

async fn decrypt_handler(Json(payload): Json<DecryptRequest>) -> Json<DecryptResponse> {
    let key_bytes = hex::decode(&payload.key).expect("Invalid key hex");
    let cipher = Aes256Gcm::new_from_slice(&key_bytes).expect("Invalid key length");
    
    let cipher_bytes = hex::decode(&payload.ciphertext).expect("Invalid ciphertext hex");
    let nonce_bytes = hex::decode(&payload.nonce).expect("Invalid nonce hex");
    let hmac_bytes = hex::decode(&payload.hmac).expect("Invalid hmac hex");
    
    // Verify HMAC first
    let mut mac = <HmacSha256 as KeyInit>::new_from_slice(&key_bytes).expect("HMAC key error");
    mac.update(&cipher_bytes);
    mac.verify_slice(&hmac_bytes).expect("HMAC verification failed");

    let nonce = Nonce::from_slice(&nonce_bytes);
    
    let plaintext_bytes = cipher
        .decrypt(nonce, cipher_bytes.as_ref())
        .expect("Decryption failure");

    Json(DecryptResponse {
        plaintext: String::from_utf8(plaintext_bytes).expect("Invalid UTF-8"),
    })
}

async fn health_check() -> &'static str {
    "Security Module OK"
}

#[tokio::main]
async fn main() {
    dotenv().ok();
    let port = env::var("PORT").unwrap_or_else(|_| "3001".to_string());
    let addr = format!("0.0.0.0:{}", port).parse::<SocketAddr>().unwrap();

    let app = Router::new()
        .route("/health", get(health_check))
        .route("/encrypt", post(encrypt_handler))
        .route("/decrypt", post(decrypt_handler));

    println!("Security service running on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_encryption_decryption_flow() {
        let key = "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";
        let plaintext = "SafeWallet-Secret-Message";

        let encrypt_req = EncryptRequest {
            plaintext: plaintext.to_string(),
            key: key.to_string(),
        };

        let encrypt_res = encrypt_handler(Json(encrypt_req)).await;
        assert_eq!(encrypt_res.nonce.len(), 24);
        assert_eq!(encrypt_res.hmac.len(), 64);

        let decrypt_req = DecryptRequest {
            ciphertext: encrypt_res.ciphertext.clone(),
            nonce: encrypt_res.nonce.clone(),
            hmac: encrypt_res.hmac.clone(),
            key: key.to_string(),
        };
        let decrypt_res = decrypt_handler(Json(decrypt_req)).await;
        assert_eq!(decrypt_res.plaintext, plaintext);
    }

    #[tokio::test]
    #[should_panic]
    async fn test_tampered_hmac() {
        let key = "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";
        let encrypt_req = EncryptRequest {
            plaintext: "Secret".to_string(),
            key: key.to_string(),
        };

        let encrypt_res = encrypt_handler(Json(encrypt_req)).await;
        let mut tampered_cipher = hex::decode(&encrypt_res.ciphertext).unwrap();
        tampered_cipher[0] ^= 1;

        let decrypt_req = DecryptRequest {
            ciphertext: hex::encode(tampered_cipher),
            nonce: encrypt_res.nonce.clone(),
            hmac: encrypt_res.hmac.clone(),
            key: key.to_string(),
        };
        
        decrypt_handler(Json(decrypt_req)).await;
    }
}
