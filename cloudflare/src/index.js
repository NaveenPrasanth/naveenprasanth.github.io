// Cloudflare Workers API for LeetCode Study Guide
// Handles authentication, user data, and progress tracking with D1 database

import { Router } from 'itty-router';

// Initialize router
const router = Router();

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Utility functions for password hashing and JWT
class AuthUtils {
  static async hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static generateSalt() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static async createJWT(payload, secret) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    
    const data = `${encodedHeader}.${encodedPayload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
    
    return `${data}.${encodedSignature}`;
  }

  static async verifyJWT(token, secret) {
    try {
      const [header, payload, signature] = token.split('.');
      const data = `${header}.${payload}`;
      
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );
      
      const signatureBuffer = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
      const isValid = await crypto.subtle.verify('HMAC', key, signatureBuffer, encoder.encode(data));
      
      if (!isValid) return null;
      
      const decodedPayload = JSON.parse(atob(payload));
      
      // Check expiration
      if (decodedPayload.exp && Date.now() / 1000 > decodedPayload.exp) {
        return null;
      }
      
      return decodedPayload;
    } catch (error) {
      return null;
    }
  }
}

// Middleware for authentication
async function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const payload = await AuthUtils.verifyJWT(token, env.JWT_SECRET);
  
  if (!payload) return null;
  
  // Verify session is still active
  const session = await env.DB.prepare(
    'SELECT * FROM user_sessions WHERE user_id = ? AND token_hash = ? AND expires_at > datetime("now") AND is_active = TRUE'
  ).bind(payload.userId, await AuthUtils.hashPassword(token, '')).first();
  
  if (!session) return null;
  
  return payload;
}

// API Routes

// Health check
router.get('/api/health', () => {
  return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
});

// User registration
router.post('/api/auth/register', async (request, env) => {
  try {
    const { username, email, password } = await request.json();
    
    // Validation
    if (!username || !email || !password) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Check if user already exists
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE username = ? OR email = ?'
    ).bind(username, email).first();
    
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Username or email already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Create user
    const salt = AuthUtils.generateSalt();
    const passwordHash = await AuthUtils.hashPassword(password, salt);
    
    const result = await env.DB.prepare(
      'INSERT INTO users (username, email, password_hash, salt) VALUES (?, ?, ?, ?) RETURNING id, username, email, created_at'
    ).bind(username, email, passwordHash, salt).first();
    
    // Create JWT token
    const tokenPayload = {
      userId: result.id,
      username: result.username,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };
    
    const token = await AuthUtils.createJWT(tokenPayload, env.JWT_SECRET);
    const tokenHash = await AuthUtils.hashPassword(token, '');
    
    // Store session
    await env.DB.prepare(
      'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, datetime("now", "+7 days"))'
    ).bind(result.id, tokenHash).run();
    
    return new Response(JSON.stringify({
      user: {
        id: result.id,
        username: result.username,
        email: result.email,
        created_at: result.created_at
      },
      token
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Registration failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// User login
router.post('/api/auth/login', async (request, env) => {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Missing username or password' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Find user
    const user = await env.DB.prepare(
      'SELECT id, username, email, password_hash, salt FROM users WHERE username = ? OR email = ?'
    ).bind(username, username).first();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Verify password
    const passwordHash = await AuthUtils.hashPassword(password, user.salt);
    if (passwordHash !== user.password_hash) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Create JWT token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };
    
    const token = await AuthUtils.createJWT(tokenPayload, env.JWT_SECRET);
    const tokenHash = await AuthUtils.hashPassword(token, '');
    
    // Store session
    await env.DB.prepare(
      'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, datetime("now", "+7 days"))'
    ).bind(user.id, tokenHash).run();
    
    // Update last login
    await env.DB.prepare(
      'UPDATE users SET last_login = datetime("now") WHERE id = ?'
    ).bind(user.id).run();
    
    return new Response(JSON.stringify({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// User logout
router.post('/api/auth/logout', async (request, env) => {
  try {
    const user = await authenticate(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const authHeader = request.headers.get('Authorization');
    const token = authHeader.substring(7);
    const tokenHash = await AuthUtils.hashPassword(token, '');
    
    // Deactivate session
    await env.DB.prepare(
      'UPDATE user_sessions SET is_active = FALSE WHERE user_id = ? AND token_hash = ?'
    ).bind(user.userId, tokenHash).run();
    
    return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Logout failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Get user progress
router.get('/api/progress', async (request, env) => {
  try {
    const user = await authenticate(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const progress = await env.DB.prepare(
      'SELECT problem_id, status, updated_at FROM user_progress WHERE user_id = ?'
    ).bind(user.userId).all();
    
    return new Response(JSON.stringify({ progress: progress.results }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch progress' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Update user progress
router.put('/api/progress/:problemId', async (request, env) => {
  try {
    const user = await authenticate(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const { problemId } = request.params;
    const { status } = await request.json();
    
    if (!['not-started', 'in-progress', 'completed'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    await env.DB.prepare(
      'INSERT OR REPLACE INTO user_progress (user_id, problem_id, status, updated_at) VALUES (?, ?, ?, datetime("now"))'
    ).bind(user.userId, problemId, status).run();
    
    return new Response(JSON.stringify({ message: 'Progress updated successfully' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update progress' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Get user notes
router.get('/api/notes', async (request, env) => {
  try {
    const user = await authenticate(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const notes = await env.DB.prepare(
      'SELECT problem_id, note_text, updated_at FROM user_notes WHERE user_id = ?'
    ).bind(user.userId).all();
    
    return new Response(JSON.stringify({ notes: notes.results }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch notes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Update user note
router.put('/api/notes/:problemId', async (request, env) => {
  try {
    const user = await authenticate(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const { problemId } = request.params;
    const { note_text } = await request.json();
    
    if (!note_text || note_text.trim() === '') {
      // Delete note if empty
      await env.DB.prepare(
        'DELETE FROM user_notes WHERE user_id = ? AND problem_id = ?'
      ).bind(user.userId, problemId).run();
    } else {
      // Update or insert note
      await env.DB.prepare(
        'INSERT OR REPLACE INTO user_notes (user_id, problem_id, note_text, updated_at) VALUES (?, ?, ?, datetime("now"))'
      ).bind(user.userId, problemId, note_text).run();
    }
    
    return new Response(JSON.stringify({ message: 'Note updated successfully' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update note' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Handle CORS preflight requests
router.options('*', () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
});

// 404 handler
router.all('*', () => {
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
});

// Main handler
export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx);
  }
};
