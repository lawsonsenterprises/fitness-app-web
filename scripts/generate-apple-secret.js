#!/usr/bin/env node

/**
 * Generate Apple Sign In Client Secret for Supabase
 *
 * This script generates a JWT client secret required for Apple Sign In on the web.
 * The secret is valid for 6 months (maximum allowed by Apple).
 *
 * Usage: node scripts/generate-apple-secret.js
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

// Configuration - update these values
const config = {
  // Your Apple Team ID (found in Apple Developer account top right, or in Xcode project)
  teamId: '36BY84JWDC',

  // The Key ID from the .p8 file name (AuthKey_XXXXX.p8)
  keyId: 'LPBAX5LA73',

  // Your Services ID (the one you created for web - NOT the App ID)
  // This should match what you set in Supabase as the Client ID
  clientId: 'com.lawsonsenterprises.fitness-app-web',

  // Path to your .p8 private key file
  privateKeyPath: '/Users/andrewlawson/Development/Apps/ios/fitness-app-ios/docs/AuthKey_LPBAX5LA73.p8',
}

function base64UrlEncode(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function generateClientSecret() {
  // Read the private key
  let privateKey
  try {
    privateKey = fs.readFileSync(config.privateKeyPath, 'utf8')
  } catch (err) {
    console.error(`Error reading private key from ${config.privateKeyPath}:`, err.message)
    process.exit(1)
  }

  // JWT Header
  const header = {
    alg: 'ES256',
    kid: config.keyId,
    typ: 'JWT'
  }

  // JWT Payload
  const now = Math.floor(Date.now() / 1000)
  const sixMonths = 15777000 // ~6 months in seconds (maximum allowed)

  const payload = {
    iss: config.teamId,
    iat: now,
    exp: now + sixMonths,
    aud: 'https://appleid.apple.com',
    sub: config.clientId
  }

  // Create the signing input
  const headerBase64 = base64UrlEncode(Buffer.from(JSON.stringify(header)))
  const payloadBase64 = base64UrlEncode(Buffer.from(JSON.stringify(payload)))
  const signingInput = `${headerBase64}.${payloadBase64}`

  // Sign with ES256 (ECDSA using P-256 and SHA-256)
  const sign = crypto.createSign('SHA256')
  sign.update(signingInput)
  sign.end()

  const signature = sign.sign({
    key: privateKey,
    dsaEncoding: 'ieee-p1363' // Apple requires this format
  })

  const signatureBase64 = base64UrlEncode(signature)

  // Combine to create the JWT
  const jwt = `${signingInput}.${signatureBase64}`

  return {
    jwt,
    expiresAt: new Date((now + sixMonths) * 1000).toISOString()
  }
}

// Generate and output
console.log('\n=== Apple Sign In Client Secret Generator ===\n')
console.log('Configuration:')
console.log(`  Team ID: ${config.teamId}`)
console.log(`  Key ID: ${config.keyId}`)
console.log(`  Client ID (Services ID): ${config.clientId}`)
console.log(`  Private Key: ${config.privateKeyPath}`)
console.log('')

try {
  const { jwt, expiresAt } = generateClientSecret()

  console.log('✅ Client Secret generated successfully!\n')
  console.log('Expires at:', expiresAt)
  console.log('\n--- Copy the secret below into Supabase Apple Provider "Secret Key" field ---\n')
  console.log(jwt)
  console.log('\n--- End of secret ---\n')

  console.log('Next steps:')
  console.log('1. Go to Supabase Dashboard → Authentication → Providers → Apple')
  console.log('2. Paste this secret into the "Secret Key" field')
  console.log('3. Make sure "Client ID" is set to:', config.clientId)
  console.log('4. Save the configuration')
  console.log('')
  console.log('⚠️  This secret expires in 6 months. Set a reminder to regenerate it before:', expiresAt)

} catch (err) {
  console.error('❌ Error generating client secret:', err.message)
  process.exit(1)
}
