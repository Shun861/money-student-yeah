import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

// 雇用者情報のレスポンス型
interface EmployerResponse {
  id: string;
  user_id: string;
  name: string;
  hourly_wage: number | null;
  size: 'small' | 'medium' | 'large' | 'unknown' | null;
  created_at: string;
  updated_at: string;
}

// GET: ユーザーの雇用者一覧取得
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 雇用者データ取得
    const { data: employers, error } = await supabase
      .from("employers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching employers:", error);
      return NextResponse.json({ error: "Failed to fetch employers" }, { status: 500 });
    }

    return NextResponse.json(employers as EmployerResponse[]);
  } catch (error) {
    console.error("Unexpected error in GET /api/employers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: 新しい雇用者作成
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // リクエストボディの解析
    const body = await request.json();
    const { name, hourly_wage, size } = body;

    // バリデーション
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (hourly_wage !== null && hourly_wage !== undefined && (typeof hourly_wage !== 'number' || hourly_wage < 0)) {
      return NextResponse.json({ error: "Invalid hourly wage" }, { status: 400 });
    }

    if (size && !['small', 'medium', 'large', 'unknown'].includes(size)) {
      return NextResponse.json({ error: "Invalid employer size" }, { status: 400 });
    }

    // 雇用者データ作成
    const { data: employer, error } = await supabase
      .from("employers")
      .insert({
        user_id: user.id,
        name: name.trim(),
        hourly_wage: hourly_wage || null,
        size: size || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating employer:", error);
      return NextResponse.json({ error: "Failed to create employer" }, { status: 500 });
    }

    return NextResponse.json(employer as EmployerResponse, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/employers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: 雇用者情報更新
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // リクエストボディの解析
    const body = await request.json();
    const { id, name, hourly_wage, size } = body;

    // バリデーション
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: "Employer ID is required" }, { status: 400 });
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    if (hourly_wage !== undefined && hourly_wage !== null && (typeof hourly_wage !== 'number' || hourly_wage < 0)) {
      return NextResponse.json({ error: "Invalid hourly wage" }, { status: 400 });
    }

    if (size !== undefined && size !== null && !['small', 'medium', 'large', 'unknown'].includes(size)) {
      return NextResponse.json({ error: "Invalid employer size" }, { status: 400 });
    }

    // 更新データの準備
    const updateData: Record<string, string | number | null> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (hourly_wage !== undefined) updateData.hourly_wage = hourly_wage;
    if (size !== undefined) updateData.size = size;

    // 雇用者データ更新
    const { data: employer, error } = await supabase
      .from("employers")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id) // セキュリティ: 自分の雇用者のみ更新可能
      .select()
      .single();

    if (error) {
      console.error("Error updating employer:", error);
      return NextResponse.json({ error: "Failed to update employer" }, { status: 500 });
    }

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 });
    }

    return NextResponse.json(employer as EmployerResponse);
  } catch (error) {
    console.error("Unexpected error in PUT /api/employers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: 雇用者削除
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // URLからIDを取得
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Employer ID is required" }, { status: 400 });
    }

    // 雇用者削除
    const { error } = await supabase
      .from("employers")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // セキュリティ: 自分の雇用者のみ削除可能

    if (error) {
      console.error("Error deleting employer:", error);
      return NextResponse.json({ error: "Failed to delete employer" }, { status: 500 });
    }

    return NextResponse.json({ message: "Employer deleted successfully" });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/employers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
