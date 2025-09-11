import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

interface ApiError {
  error: string
}

interface ShiftResponse {
  id: string
  user_id: string
  employer_id: string
  date: string
  hours: number
  hourly_wage: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

// GET /api/shifts - シフト一覧取得
export async function GET(request: NextRequest): Promise<NextResponse<ShiftResponse[] | ApiError>> {
  try {
    const supabase = createSupabaseServerClient()
    
    // ユーザー認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // URLクエリパラメーターの取得
    const url = new URL(request.url)
    const employerId = url.searchParams.get('employer_id')
    const startDate = url.searchParams.get('start_date')
    const endDate = url.searchParams.get('end_date')
    const limit = url.searchParams.get('limit')

    // シフト取得クエリの構築
    let query = supabase
      .from('shifts')
      .select('*')
      .eq('user_id', user.id)

    // フィルタリング条件の適用
    if (employerId) {
      query = query.eq('employer_id', employerId)
    }
    
    if (startDate) {
      query = query.gte('date', startDate)
    }
    
    if (endDate) {
      query = query.lte('date', endDate)
    }

    // 並び順とリミット
    query = query.order('date', { ascending: false })
    
    if (limit) {
      const limitNum = parseInt(limit, 10)
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum)
      }
    }

    const { data: shifts, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch shifts' },
        { status: 500 }
      )
    }

    return NextResponse.json(shifts || [])
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/shifts - 新しいシフト作成
export async function POST(request: NextRequest): Promise<NextResponse<ShiftResponse | ApiError>> {
  try {
    const supabase = createSupabaseServerClient()
    
    // ユーザー認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // リクエストボディの取得
    const body = await request.json()
    
    // 基本的なバリデーション
    const { employer_id, date, hours } = body
    if (!employer_id || !date || typeof hours !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: employer_id, date, hours' },
        { status: 400 }
      )
    }

    // 勤務先の存在確認
    const { data: employer, error: employerError } = await supabase
      .from('employers')
      .select('id')
      .eq('id', employer_id)
      .eq('user_id', user.id)
      .single()

    if (employerError || !employer) {
      return NextResponse.json(
        { error: 'Employer not found' },
        { status: 404 }
      )
    }

    // シフト作成
    const { data: shift, error: createError } = await supabase
      .from('shifts')
      .insert({
        user_id: user.id,
        employer_id,
        date,
        hours,
        hourly_wage: body.hourly_wage || null,
        notes: body.notes || null
      })
      .select()
      .single()

    if (createError) {
      console.error('Database error:', createError)
      return NextResponse.json(
        { error: 'Failed to create shift' },
        { status: 500 }
      )
    }

    return NextResponse.json(shift, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/shifts - シフト更新
export async function PUT(request: NextRequest): Promise<NextResponse<ShiftResponse | ApiError>> {
  try {
    const supabase = createSupabaseServerClient()

    // ユーザー認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // リクエストボディの取得
    const body = await request.json()
    const { id, employer_id, date, hours, hourly_wage, notes } = body
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    // シフトの存在確認
    const { data: existingShift, error: shiftError } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (shiftError || !existingShift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    // 更新データの準備
    const updateData: Record<string, string | number | null> = {}
    if (employer_id !== undefined) updateData.employer_id = employer_id
    if (date !== undefined) updateData.date = date  
    if (typeof hours === 'number') updateData.hours = hours
    if (hourly_wage !== undefined) updateData.hourly_wage = hourly_wage
    if (notes !== undefined) updateData.notes = notes

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // シフト更新
    const { data: updatedShift, error: updateError } = await supabase
      .from('shifts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update shift' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedShift, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/shifts - シフト削除  
export async function DELETE(request: NextRequest): Promise<NextResponse<{ success: boolean } | ApiError>> {
  try {
    const supabase = createSupabaseServerClient()

    // ユーザー認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // URLパラメーターからIDを取得
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      )
    }

    // シフトの存在確認
    const { data: existingShift, error: shiftError } = await supabase
      .from('shifts')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (shiftError || !existingShift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    // シフト削除
    const { error: deleteError } = await supabase
      .from('shifts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete shift' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
