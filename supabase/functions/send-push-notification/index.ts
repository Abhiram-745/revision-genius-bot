import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper functions for Web Push encryption
function base64UrlDecode(str: string): Uint8Array {
  const padding = '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0));
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Create VAPID JWT token
async function createVapidJwt(
  audience: string,
  subject: string,
  vapidPrivateKey: string
): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60,
    sub: subject,
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import the private key - convert to ArrayBuffer for Deno compatibility
  const privateKeyBytes = base64UrlDecode(vapidPrivateKey);
  
  let cryptoKey: CryptoKey;
  
  try {
    cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyBytes.buffer as ArrayBuffer,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );
  } catch (e) {
    console.error('Failed to import private key:', e);
    throw new Error('Invalid VAPID private key format');
  }

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const sigBytes = new Uint8Array(signature);
  const signatureB64 = base64UrlEncode(sigBytes);

  return `${unsignedToken}.${signatureB64}`;
}

// Encrypt payload using aes128gcm for Web Push
async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<{ encrypted: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  const encoder = new TextEncoder();
  
  // Generate local key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  // Import subscriber's public key
  const subscriberPublicKeyBytes = base64UrlDecode(p256dhKey);
  const subscriberPublicKey = await crypto.subtle.importKey(
    'raw',
    subscriberPublicKeyBytes.buffer as ArrayBuffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: subscriberPublicKey },
    localKeyPair.privateKey,
    256
  );

  // Export local public key
  const localPublicKeyRaw = await crypto.subtle.exportKey('raw', localKeyPair.publicKey);
  const localPublicKey = new Uint8Array(localPublicKeyRaw);

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Decode auth secret
  const authSecretBytes = base64UrlDecode(authSecret);

  // HKDF for key derivation
  async function hkdf(saltParam: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
    const key = await crypto.subtle.importKey(
      'raw', 
      ikm.buffer as ArrayBuffer, 
      { name: 'HMAC', hash: 'SHA-256' }, 
      false, 
      ['sign']
    );
    const saltToUse = saltParam.length > 0 ? saltParam : new Uint8Array(32);
    const prk = new Uint8Array(await crypto.subtle.sign('HMAC', key, saltToUse.buffer as ArrayBuffer));
    
    const prkKey = await crypto.subtle.importKey(
      'raw', 
      prk.buffer as ArrayBuffer, 
      { name: 'HMAC', hash: 'SHA-256' }, 
      false, 
      ['sign']
    );
    const infoWithCounter = new Uint8Array([...info, 1]);
    const okm = new Uint8Array(await crypto.subtle.sign('HMAC', prkKey, infoWithCounter.buffer as ArrayBuffer));
    
    return okm.slice(0, length);
  }

  // Build info strings
  const keyInfo = encoder.encode('WebPush: info\x00');
  const keyInfoFull = new Uint8Array([
    ...keyInfo,
    ...subscriberPublicKeyBytes,
    ...localPublicKey
  ]);

  // Derive IKM from auth secret and shared secret
  const ikm = await hkdf(authSecretBytes, new Uint8Array(sharedSecret), keyInfoFull, 32);

  // Derive content encryption key and nonce
  const cekInfo = encoder.encode('Content-Encoding: aes128gcm\x00');
  const nonceInfo = encoder.encode('Content-Encoding: nonce\x00');
  
  const cek = await hkdf(salt, ikm, cekInfo, 16);
  const nonce = await hkdf(salt, ikm, nonceInfo, 12);

  // Import CEK for AES-GCM
  const aesKey = await crypto.subtle.importKey(
    'raw', 
    cek.buffer as ArrayBuffer, 
    { name: 'AES-GCM' }, 
    false, 
    ['encrypt']
  );

  // Add padding delimiter
  const payloadBytes = encoder.encode(payload);
  const paddedPayload = new Uint8Array([...payloadBytes, 2]); // 2 = padding delimiter

  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce.buffer as ArrayBuffer, tagLength: 128 },
    aesKey,
    paddedPayload.buffer as ArrayBuffer
  );

  return {
    encrypted: new Uint8Array(encrypted),
    salt,
    localPublicKey
  };
}

// Build aes128gcm body
function buildAes128gcmBody(encrypted: Uint8Array, salt: Uint8Array, localPublicKey: Uint8Array, recordSize: number = 4096): Uint8Array {
  // Header: salt (16) + record size (4) + key length (1) + key (65)
  const header = new Uint8Array(16 + 4 + 1 + 65);
  header.set(salt, 0);
  
  // Record size as big-endian uint32
  const view = new DataView(header.buffer);
  view.setUint32(16, recordSize, false);
  
  // Key length
  header[20] = 65;
  
  // Local public key
  header.set(localPublicKey, 21);

  // Combine header and encrypted data
  const body = new Uint8Array(header.length + encrypted.length);
  body.set(header, 0);
  body.set(encrypted, header.length);
  
  return body;
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: object,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  try {
    const payloadString = JSON.stringify(payload);
    
    // Encrypt the payload
    const { encrypted, salt, localPublicKey } = await encryptPayload(
      payloadString,
      subscription.p256dh,
      subscription.auth
    );

    // Build the encrypted body
    const body = buildAes128gcmBody(encrypted, salt, localPublicKey);

    // Create VAPID authorization
    const audience = new URL(subscription.endpoint).origin;
    const jwt = await createVapidJwt(audience, 'mailto:noreply@vistara.app', vapidPrivateKey);

    // Send the push notification
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'Content-Length': body.length.toString(),
        'TTL': '86400',
        'Urgency': 'high'
      },
      body: body.buffer as ArrayBuffer
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Push failed:', response.status, errorText);
      
      // 410 Gone or 404 Not Found means subscription is invalid
      if (response.status === 410 || response.status === 404) {
        return false;
      }
      
      return false;
    }

    console.log('Push sent successfully to:', subscription.endpoint.substring(0, 50) + '...');
    return true;
  } catch (error) {
    console.error('Error sending push:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, title, body, data, tag } = await req.json();

    if (!user_id) {
      throw new Error('user_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      return new Response(
        JSON.stringify({ error: 'VAPID keys not configured', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's push subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', user_id);

    if (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found for user:', user_id);
      return new Response(
        JSON.stringify({ message: 'No subscriptions found', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const notificationPayload = {
      title: title || 'Vistara',
      body: body || 'You have a notification',
      icon: '/owl-notification.png',
      badge: '/owl-notification.png',
      tag: tag || 'general',
      data: data || { url: '/' },
      image: '/owl-notification.png'
    };

    console.log(`Sending push to ${subscriptions.length} subscription(s)`);

    // Send to all subscriptions
    let sentCount = 0;
    const failedEndpoints: string[] = [];

    for (const sub of subscriptions) {
      try {
        const success = await sendWebPush(sub, notificationPayload, vapidPublicKey, vapidPrivateKey);
        if (success) {
          sentCount++;
        } else {
          failedEndpoints.push(sub.endpoint);
        }
      } catch (err) {
        console.error('Error sending to subscription:', err);
        failedEndpoints.push(sub.endpoint);
      }
    }

    // Clean up failed subscriptions (likely expired)
    if (failedEndpoints.length > 0) {
      console.log('Cleaning up failed subscriptions:', failedEndpoints.length);
      for (const endpoint of failedEndpoints) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', endpoint);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Push notifications processed', 
        sent: sentCount,
        failed: failedEndpoints.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
