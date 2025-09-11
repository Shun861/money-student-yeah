import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

// 収入データのレスポンス型
interface IncomeResponse {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  source: string | null;
  employer_id: string | null;
  created_at: string;
  updated_at: string;
}

// GET: ユーザーの収入データ一覧取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // URLパラメータから条件を取得
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const employerId = searchParams.get('employer_id');

    let query = supabase
      .from("incomes")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    // 年でフィルタリング
    if (year) {
      query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
    }

    // 月でフィルタリング
    if (month && year) {
      const monthStr = month.padStart(2, '0');
      const startDate = `${year}-${monthStr}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
      query = query.gte('date', startDate).lte('date', endDate);
    }

    // 雇用者でフィルタリング
    if (employerId) {
      query = query.eq('employer_id', employerId);
    }

    const { data: incomes, error } = await query;

    if (error) {
      console.error("Error fetching incomes:", error);
      return NextResponse.json({ error: "Failed to fetch incomes" }, { status: 500 });
    }

    return NextResponse.json(incomes as IncomeResponse[]);
  } catch (error) {
    console.error("Unexpected error in GET /api/incomes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: 新しい収入データ作成
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
    const { amount, date, source, employer_id } = body;

    // バリデーション
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    if (!date || typeof date !== 'string') {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    // 日付形式の検証
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }

    // 雇用者IDが指定されている場合、存在チェック
    if (employer_id) {
      const { data: employer, error: employerError } = await supabase
        .from("employers")
        .select("id")
        .eq("id", employer_id)
        .eq("user_id", user.id)
        .single();

      if (employerError || !employer) {
        return NextResponse.json({ error: "Invalid employer ID" }, { status: 400 });
      }
    }

    // 収入データ作成
    const { data: income, error } = await supabase
      .from("incomes")
      .insert({
        user_id: user.id,
        amount,
        date,
        source: source || null,
        employer_id: employer_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating income:", error);
      return NextResponse.json({ error: "Failed to create income" }, { status: 500 });
    }

    return NextResponse.json(income as IncomeResponse, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/incomes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: 収入データ更新
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
    const { id, amount, date, source, employer_id } = body;

    // バリデーション
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: "Income ID is required" }, { status: 400 });
    }

    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (date !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
      }
    }

    // 雇用者IDが指定されている場合、存在チェック
    if (employer_id) {
      const { data: employer, error: employerError } = await supabase
        .from("employers")
        .select("id")
        .eq("id", employer_id)
        .eq("user_id", user.id)
        .single();

      if (employerError || !employer) {
        return NextResponse.json({ error: "Invalid employer ID" }, { status: 400 });
      }
    }

    // 更新データの準備
    const updateData: Record<string, string | number | null> = {};
    if (amount !== undefined) updateData.amount = amount;
    if (date !== undefined) updateData.date = date;
    if (source !== undefined) updateData.source = source;
    if (employer_id !== undefined) updateData.employer_id = employer_id;

    // 収入データ更新
    const { data: income, error } = await supabase
      .from("incomes")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id) // セキュリティ: 自分の収入データのみ更新可能
      .select()
      .single();

    if (error) {
      console.error("Error updating income:", error);
      return NextResponse.json({ error: "Failed to update income" }, { status: 500 });
    }

    if (!income) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 });
    }

    return NextResponse.json(income as IncomeResponse);
  } catch (error) {
    console.error("Unexpected error in PUT /api/incomes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: 収入データ削除
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
      return NextResponse.json({ error: "Income ID is required" }, { status: 400 });
    }

    // 収入データ削除
    const { error } = await supabase
      .from("incomes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // セキュリティ: 自分の収入データのみ削除可能

    if (error) {
      console.error("Error deleting income:", error);
      return NextResponse.json({ error: "Failed to delete income" }, { status: 500 });
    }

    return NextResponse.json({ message: "Income deleted successfully" });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/incomes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
