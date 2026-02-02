import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';



export async function GET(request) {
  try {
    //Read cookie
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    // Return user (never return token)
    return NextResponse.json({
      user: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        area: decoded.area,
      },
    });
  } catch (error) {
    console.error('ME API ERROR:', error.message);

    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
