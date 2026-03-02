/**
 * Fish World — AES-256-CBC Decryption Script
 *
 * Decrypts encrypted role/player data files downloaded from the game's
 * remote endpoints. Uses the custom key derivation algorithm (1000-round
 * S-box mixing) extracted from Udon IL bytecode.
 *
 * Data sources:
 *   encrypted/roles.txt  ← https://gamerexde.github.io/trickforge-public/roles.txt (trusted)
 *   encrypted/all.txt    ← https://api.trickforgestudios.com/api/v1/roles/vrc/all (untrusted/fallback)
 *
 * Usage: node decrypt.js
 * Output: decrypted/roles.json, decrypted/all.json (pretty-printed)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ── AES S-Box (standard) ──
const AES_SBOX = [
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7,
  0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15, 0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83,
  0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf, 0xd0, 0xef, 0xaa,
  0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec,
  0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73, 0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49,
  0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08, 0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6,
  0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a, 0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e,
  0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf, 0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
];

// ── XOR-obfuscated passphrase & salt (from IL) ──
const PP_RAW = [206, 150, 228, 196, 226, 220, 230, 238, 253, 219, 224, 209, 253, 205, 155, 220, 197, 243, 237, 147, 204, 150, 246, 236, 157, 248, 224, 241, 203, 218, 228, 245];
const SALT_RAW = [242, 228, 231, 212, 243, 215, 230, 214, 251, 154, 207, 233, 213, 236, 156, 197, 214, 144, 212, 215, 151, 148, 238, 229, 198, 222, 243, 221, 159, 231, 207, 205];

function xorDecode(raw) {
  let s = '';
  for (let i = 0; i < raw.length; i++) s += String.fromCharCode(raw[i] ^ 163 ^ (i & 15));
  return s;
}

function fishDeriveKey(passphraseBytes, saltBytes) {
  const combined = Buffer.concat([passphraseBytes, saltBytes]);
  let derived = Buffer.alloc(32);
  for (let i = 0; i < 32; i++) derived[i] = combined[i % combined.length];

  for (let round = 0; round < 1000; round++) {
    const temp = Buffer.alloc(32);
    const roundXor = round % 256;
    for (let j = 0; j < 32; j++) {
      const prev = derived[(j + 31) % 32];
      const curr = derived[j];
      const next = derived[(j + 1) % 32];
      const saltByte = saltBytes[(round + j) % saltBytes.length];
      const mixed = (prev ^ curr ^ next ^ saltByte ^ roundXor) & 0xff;
      temp[j] = AES_SBOX[mixed];
    }
    derived = temp;
  }
  return derived;
}

function buildKey() {
  const ppStr = xorDecode(PP_RAW);
  const saltStr = xorDecode(SALT_RAW);
  const ppBytes = Buffer.from(ppStr, 'utf8');
  const saltBytes = Buffer.from(saltStr, 'utf8');
  return fishDeriveKey(ppBytes, saltBytes);
}

function decrypt(base64Data, keyBytes) {
  const combined = Buffer.from(base64Data, 'base64');
  if (combined.length < 32) throw new Error('Ciphertext too short');
  const iv = combined.slice(0, 16);
  const ciphertext = combined.slice(16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', keyBytes, iv);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain.toString('utf8');
}

// ── Main ──
const key = buildKey();
console.log('Derived key:', key.toString('hex'));

const files = [
  { src: 'encrypted/all.txt', dst: 'decrypted/all.json' },
  { src: 'encrypted/roles.txt', dst: 'decrypted/roles.json' },
];

const decryptedDir = path.join(__dirname, 'decrypted');
if (!fs.existsSync(decryptedDir)) fs.mkdirSync(decryptedDir);

for (const { src, dst } of files) {
  const srcPath = path.join(__dirname, src);
  const dstPath = path.join(__dirname, dst);
  console.log(`\nDecrypting ${src} ...`);
  try {
    const raw = fs.readFileSync(srcPath, 'utf8').trim();
    const plaintext = decrypt(raw, key);
    // Auto-format JSON output
    let output;
    try {
      const parsed = JSON.parse(plaintext);
      output = JSON.stringify(parsed, null, 2);
      const playerCount = parsed.players ? Object.keys(parsed.players).length : '?';
      console.log(`  -> ${dst} (${playerCount} players, ${output.length} chars)`);
    } catch {
      output = plaintext;
      console.log(`  -> ${dst} (${plaintext.length} chars, raw text)`);
    }
    fs.writeFileSync(dstPath, output, 'utf8');
  } catch (e) {
    console.error(`  ERROR: ${e.message}`);
  }
}
