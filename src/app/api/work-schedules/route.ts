import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

interface ApiError {
  error: string
}

interface WorkScheduleResponse {
  id: string
  user_id: string
  employer_id: string
  day_of_week: number
  hours: number
  created_at: string
  updated_at: string
}

// GET /api/work-schedules - 勤務スケジュール一覧取得
export async function GET(): Promise<NextResponse<WorkScheduleResponse[] | ApiError>> {
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

    // 勤務スケジュール取得
    const { data: workSchedules, error } = await supabase
      .from('work_schedules')
      .select('*')
      .eq('user_id', user.id)
      .order('day_of_week', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch work schedules' },
        { status: 500 }
      )
    }

    return NextResponse.json(workSchedules || [])
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/work-schedules - 新しい勤務スケジュール作成
export async function POST(request: NextRequest): Promise<NextResponse<WorkScheduleResponse | ApiError>> {
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
    const { employer_id, day_of_week, hours } = body
    if (!employer_id || day_of_week === undefined || !hours) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // 勤務スケジュール作成
    const { data: workSchedule, error: createError } = await supabase
      .from('work_schedules')
      .insert({
        user_id: user.id,
        employer_id,
        day_of_week,
        hours
      })
      .select()
      .single()

    if (createError) {
      console.error('Database error:', createError)
      return NextResponse.json(
        { error: 'Failed to create work schedule' },
        { status: 500 }
      )
    }

    return NextResponse.json(workSchedule, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/work-schedules - 勤務スケジュール更新
export async function PUT(request: NextRequest): Promise<NextResponse<WorkScheduleResponse | ApiError>> {
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
    const { id, employer_id, day_of_week, hours } = body
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    // 勤務スケジュールの存在確認
    const { data: existingSchedule, error: findError } = await supabase
      .from('work_schedules')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (findError || !existingSchedule) {
      return NextResponse.json(
        { error: 'Work schedule not found' },
        { status: 404 }
      )
    }

    // 更新データの準備
    const updateData: Record<string, string | number> = {}
    if (employer_id !== undefined) updateData.employer_id = employer_id
    if (day_of_week !== undefined) updateData.day_of_week = day_of_week
    if (hours !== undefined) updateData.hours = hours

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // 勤務スケジュール更新
    const { data: updatedSchedule, error: updateError } = await supabase
      .from('work_schedules')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update work schedule' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedSchedule, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/work-schedules - 勤務スケジュール削除
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

    // 勤務スケジュールの存在確認
    const { data: existingSchedule, error: findError } = await supabase
      .from('work_schedules')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (findError || !existingSchedule) {
      return NextResponse.json(
        { error: 'Work schedule not found' },
        { status: 404 }
      )
    }

    // 勤務スケジュール削除
    const { error: deleteError } = await supabase
      .from('work_schedules')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete work schedule' },
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
