import { NextRequest, NextResponse } from 'next/server';
import { getUmbrellaCatalog } from '@/lib/umbrella-catalog';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('umbrella_session')?.value;

  if (session !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  return NextResponse.json(getUmbrellaCatalog());
}
