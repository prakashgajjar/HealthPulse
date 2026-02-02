import { verifyToken } from './auth';
import { cookies } from 'next/headers';

export async function getAuthFromRequest(request) {
  try {
    // Try to get token from cookie
    let token = null;
    
    if (request) {
      // From request headers
      const authHeader = request.headers?.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      // Try to get from cookies
      const cookieStore = await cookies();
      token = cookieStore.get('authToken')?.value;
    }

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    return null;
  }
}

export function verifyAuth(decoded) {
  if (!decoded) {
    return false;
  }
  return true;
}

export function isAdmin(decoded) {
  return decoded?.role === 'admin';
}

export function isUser(decoded) {
  return decoded?.role === 'user';
}
