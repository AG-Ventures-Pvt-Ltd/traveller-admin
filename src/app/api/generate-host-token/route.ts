import { NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';

export async function POST(request: Request) {
  try {
    const { hostId, email, fullName } = await request.json();

    if (!hostId || !email || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const secret = process.env.HOST_NEXTAUTH_SECRET;

    if (!secret) {
      return NextResponse.json({ error: 'HOST_NEXTAUTH_SECRET not configured' }, { status: 500 });
    }

    const token = await encode({
      token: {
        sub: hostId,
        email: email,
        fullName: fullName,
      },
      secret: secret,
    });

    const cookieString = `next-auth.session-token=${token}`;

    return NextResponse.json({ token: cookieString });
  } catch (error) {
    console.error('Error generating host token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
