<<<<<<< HEAD
// v3/security-rust/src/main.rs
use axum::{
    routing::{post, get},
=======
use axum::{
    routing::post,
>>>>>>> 7fa1416d021156d01b5169f1739fac21d9ce3c81
    Json, Router,
};
use serde::{Deserialize, Serialize};
use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use hmac::{Hmac, Mac};
<<<<<<< HEAD
use sha2::Sha256;
use std::net::SocketSocketAddr;
use dotenvy::dotenv;
use std::env;

type HmacSha256 = Hmac<Sha256>;
=======
use rand::{RngCore, thread_rng};
use sha2::{Sha256, Digest};
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use tower_http::cors::CorsLayer;
>>>>>>> 7fa1416d021156d01b5169f1739fac21d9ce3c81

#[derive(Deserialize)]
struct EncryptRequest {
    plaintext: String,
<<<<<<< HEAD
    key: String,
}

#[derive(Serialize, Deserialize, Clone)]
=======
    key: String, // 32 bytes hex string
}

#[derive(Serialize)]
>>>>>>> 7fa1416d021156d01b5169f1739fac21d9ce3c81
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

<<<<<<< HEAD
async fn encrypt_handler(Json(payload): Json<EncryptRequest>) -> Json<EncryptResponse> {
    let key_bytes = hex::decode(&payload.key).expect("Invalid key hex");
    let cipher = Aes256Gcm::new_from_slice(&key_bytes).expect("Invalid key length");
    
    let nonce_bytes = rand::random::<[u8; 12]>();
    let nonce = Nonce::from_slice(&nonce_bytes);
    
    let ciphertext = cipher
        .encrypt(nonce, payload.plaintext.as_bytes().as_ref())
        .expect("Encryption failure");
=======
#[derive(Deserialize)]
struct HashRequest {
    data: String,
}

#[derive(Serialize)]
struct HashResponse {
    hash: String,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    // Initialize logging
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let app = Router::new()
        .route("/encrypt", post(encrypt_handler))
        .route("/decrypt", post(decrypt_handler))
        .route("/hash", post(hash_handler))
        .layer(CorsLayer::permissive());

    let port = std::env::var("PORT").unwrap_or_else(|_| "3001".to_string()).parse().unwrap();
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("Security Module (Rust) listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

type HmacSha256 = Hmac<Sha256>;

async fn encrypt_handler(Json(payload): Json<EncryptRequest>) -> Json<EncryptResponse> {
    let key_bytes = hex::decode(payload.key).expect("Invalid key hex");
    let cipher = Aes256Gcm::new_from_slice(&key_bytes).expect("Invalid key length");
    
    // Generate secure random nonce (IV)
    let mut nonce_bytes = [0u8; 12];
    thread_rng().fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, payload.plaintext.as_bytes())
        .expect("Encryption failed");
>>>>>>> 7fa1416d021156d01b5169f1739fac21d9ce3c81

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
<<<<<<< HEAD
    let key_bytes = hex::decode(&payload.key).expect("Invalid key hex");
    let cipher = Aes256Gcm::new_from_slice(&key_bytes).expect("Invalid key length");
    
    let cipher_bytes = hex::decode(&payload.ciphertext).expect("Invalid ciphertext hex");
    let nonce_bytes = hex::decode(&payload.nonce).expect("Invalid nonce hex");
    let hmac_bytes = hex::decode(&payload.hmac).expect("Invalid hmac hex");
=======
    let key_bytes = hex::decode(payload.key).expect("Invalid key hex");
    let nonce_bytes = hex::decode(payload.nonce).expect("Invalid nonce hex");
    let cipher_bytes = hex::decode(payload.ciphertext).expect("Invalid ciphertext hex");
    let hmac_bytes = hex::decode(payload.hmac).expect("Invalid hmac hex");
>>>>>>> 7fa1416d021156d01b5169f1739fac21d9ce3c81
    
    // Verify HMAC first
    let mut mac = <HmacSha256 as KeyInit>::new_from_slice(&key_bytes).expect("HMAC key error");
    mac.update(&cipher_bytes);
    mac.verify_slice(&hmac_bytes).expect("HMAC verification failed");

<<<<<<< HEAD
    let nonce = Nonce::from_slice(&nonce_bytes);
    
    let plaintext_bytes = cipher
        .decrypt(nonce, cipher_bytes.as_ref())
        .expect("Decryption failure");

    DecryptResponse {
        plaintext: String::from_utf8(plaintext_bytes).expect("Invalid UTF-8"),
    }
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
=======
    let cipher = Aes256Gcm::new_from_slice(&key_bytes).expect("Invalid key length");
    let nonce = Nonce::from_slice(&nonce_bytes);
    
    let plaintext = cipher
        .decrypt(nonce, cipher_bytes.as_slice())
        .expect("Decryption failed");

    Json(DecryptResponse {
        plaintext: String::from_utf8(plaintext).expect("Invalid UTF-8"),
    })
>>>>>>> 7fa1416d021156d01b5169f1739fac21d9ce3c81
}

#[cfg(test)]
mod tests {
    use super::*;
<<<<<<< HEAD
    use ax_test_helper::TestClient; // Hypothetical, but common pattern

    #[tokio::test]
    async fn test_encryption_decryption_flow() {
        let key = "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";
        let plaintext = "SafeWallet-Secret-Message";

        let encrypt_req = EncryptRequest {
            plaintext: plaintext.to_string(),
            key: key.to_string(),
        };

        let encrypt_res = encrypt_handler(Json(encrypt_req)).await;
=======
    use hex;

    #[tokio::test]
    async fn test_encryption_decryption_positive() {
        let key = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
        let plaintext = "Sensitive Financial Data 1234567890".to_string();

        let encrypt_req = EncryptRequest {
            plaintext: plaintext.clone(),
            key: key.to_string(),
        };
        let encrypt_res = encrypt_handler(Json(encrypt_req)).await;

        assert!(!encrypt_res.ciphertext.is_empty());
>>>>>>> 7fa1416d021156d01b5169f1739fac21d9ce3c81
        assert_eq!(encrypt_res.nonce.len(), 24);
        assert_eq!(encrypt_res.hmac.len(), 64);

        let decrypt_req = DecryptRequest {
            ciphertext: encrypt_res.ciphertext.clone(),
            nonce: encrypt_res.nonce.clone(),
            hmac: encrypt_res.hmac.clone(),
            key: key.to_string(),
        };
        let decrypt_res = decrypt_handler(Json(decrypt_req)).await;
<<<<<<< HEAD
=======

>>>>>>> 7fa1416d021156d01b5169f1739fac21d9ce3c81
        assert_eq!(decrypt_res.plaintext, plaintext);
    }

    #[tokio::test]
<<<<<<< HEAD
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
=======
    #[should_panic(expected = "HMAC verification failed")]
    async fn test_decryption_negative_tampered_ciphertext() {
        let key = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
        let plaintext = "Secret".to_string();

        let encrypt_req = EncryptRequest { plaintext, key: key.to_string() };
        let encrypt_res = encrypt_handler(Json(encrypt_req)).await;

        // Tamper with ciphertext
        let mut tampered_cipher = hex::decode(&encrypt_res.ciphertext).unwrap();
        tampered_cipher[0] ^= 0xFF; // Flip bits
>>>>>>> 7fa1416d021156d01b5169f1739fac21d9ce3c81

        let decrypt_req = DecryptRequest {
            ciphertext: hex::encode(tampered_cipher),
            nonce: encrypt_res.nonce.clone(),
            hmac: encrypt_res.hmac.clone(),
            key: key.to_string(),
        };
<<<<<<< HEAD
        
        decrypt_handler(Json(decrypt_req)).await;
    }
=======
        decrypt_handler(Json(decrypt_req)).await;
    }

    #[tokio::test]
    #[should_panic(expected = "Invalid key length")]
    async fn test_encryption_negative_invalid_key_length() {
        let short_key = "0123456789abcdef".to_string(); // Too short
        let encrypt_req = EncryptRequest {
            plaintext: "data".to_string(),
            key: short_key,
        };
        encrypt_handler(Json(encrypt_req)).await;
    }

    #[tokio::test]
    async fn test_hash_integrity_edge_case_empty_string() {
        let hash_req = HashRequest { data: "".to_string() };
        let hash_res = hash_handler(Json(hash_req)).await;
        // SHA-256 for empty string
        assert_eq!(hash_res.hash, "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    }

    #[tokio::test]
    async fn test_secure_random_iv_uniqueness() {
        let key = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef".to_string();
        let plaintext = "Same Plaintext".to_string();

        let res1 = encrypt_handler(Json(EncryptRequest { plaintext: plaintext.clone(), key: key.clone() })).await;
        let res2 = encrypt_handler(Json(EncryptRequest { plaintext, key })).await;

        // Nonce should be different for every encryption
        assert_ne!(res1.nonce, res2.nonce);
        // Ciphertext should also be different due to different nonces (even for same plaintext)
        assert_ne!(res1.ciphertext, res2.ciphertext);
    }
}

async fn hash_handler(Json(payload): Json<HashRequest>) -> Json<HashResponse> {
    let mut hasher = Sha256::new();
    hasher.update(payload.data.as_bytes());
    let result = hasher.finalize();
    
    Json(HashResponse {
        hash: hex::encode(result),
    })
>>>>>>> 7fa1416d021156d01b5169f1739fac21d9ce3c81
}
