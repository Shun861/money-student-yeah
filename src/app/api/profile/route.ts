import { NextResponse } from 'next/server';

// 一時的にSupabaseを無効にして、ローカルストレージのみで動作
export async function GET() {
  // ローカルストレージのデータを返す（クライアントサイドで処理）
  return NextResponse.json({ profile: null });
}

export async function PUT(req: Request) {
  // ローカルストレージのデータを更新（クライアントサイドで処理）
  return NextResponse.json({ success: true });
}
