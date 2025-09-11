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
