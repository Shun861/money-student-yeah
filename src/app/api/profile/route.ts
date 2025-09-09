import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import {
  ProfileGetResponse,
  ProfileUpdateRequest,
  ProfileUpdateResponse,
  ProfileCreateRequest,
  ProfileCreateResponse,
  ApiErrorResponse,
  ApiErrorCode
} from '@/types/api'
import { UserProfile } from '@/types'

/**
 * GET /api/profile - ユーザープロフィール取得
 * 認証されたユーザーのプロフィール情報を取得します
 */
export async function GET(): Promise<NextResponse<ProfileGetResponse | ApiErrorResponse>> {
  try {
    const supabase = createSupabaseServerClient()
    
    // ユーザー認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ApiErrorCode.UNAUTHORIZED,
            message: '認証が必要です',
            details: authError?.message
          }
        },
        { status: 401 }
      )
    }

    // プロフィールデータ取得
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ApiErrorCode.DATABASE_ERROR,
            message: 'プロフィールの取得に失敗しました',
            details: profileError.message
          }
        },
        { status: 500 }
      )
    }

    // プロフィールが存在しない場合（正常なケース）
    if (!profile) {
      return NextResponse.json({
        success: true,
        profile: null
      })
    }

    // UserProfile型に変換
    const userProfile: UserProfile = {
      birthDate: profile.birth_date,
      studentType: profile.student_type,
      residenceCity: profile.residence_city,
      insuranceStatus: profile.insurance_status,
      parentInsuranceType: profile.parent_insurance_type,
      livingStatus: profile.living_status,
      monthlyAllowance: profile.monthly_allowance,
      employers: [], // TODO: 雇用者情報は別テーブルから取得
      otherIncome: profile.other_income,
      grade: profile.grade,
      isParentDependent: profile.is_parent_dependent,
      employerSize: profile.employer_size,
      defaultHourlyWage: profile.default_hourly_wage,
      bracket: profile.bracket,
      termsAccepted: profile.terms_accepted
    }

    return NextResponse.json({
      success: true,
      profile: userProfile
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ApiErrorCode.INTERNAL_ERROR,
          message: '内部サーバーエラーが発生しました',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/profile - プロフィール更新
 * 認証されたユーザーのプロフィール情報を更新します
 */
export async function PUT(request: NextRequest): Promise<NextResponse<ProfileUpdateResponse | ApiErrorResponse>> {
  try {
    const supabase = createSupabaseServerClient()
    
    // ユーザー認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ApiErrorCode.UNAUTHORIZED,
            message: '認証が必要です',
            details: authError?.message
          }
        },
        { status: 401 }
      )
    }

    // リクエストボディ解析
    let updateData: ProfileUpdateRequest
    try {
      updateData = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ApiErrorCode.VALIDATION_ERROR,
            message: 'リクエストボディの形式が正しくありません',
            details: parseError instanceof Error ? parseError.message : 'JSON parse error'
          }
        },
        { status: 400 }
      )
    }

    // データベース形式に変換
    const dbUpdateData: Record<string, string | number | boolean | null> = {}
    
    if (updateData.birthDate !== undefined) dbUpdateData.birth_date = updateData.birthDate
    if (updateData.studentType !== undefined) dbUpdateData.student_type = updateData.studentType
    if (updateData.residenceCity !== undefined) dbUpdateData.residence_city = updateData.residenceCity
    if (updateData.insuranceStatus !== undefined) dbUpdateData.insurance_status = updateData.insuranceStatus
    if (updateData.parentInsuranceType !== undefined) dbUpdateData.parent_insurance_type = updateData.parentInsuranceType
    if (updateData.livingStatus !== undefined) dbUpdateData.living_status = updateData.livingStatus
    if (updateData.monthlyAllowance !== undefined) dbUpdateData.monthly_allowance = updateData.monthlyAllowance
    if (updateData.otherIncome !== undefined) dbUpdateData.other_income = updateData.otherIncome
    if (updateData.grade !== undefined) dbUpdateData.grade = updateData.grade
    if (updateData.isParentDependent !== undefined) dbUpdateData.is_parent_dependent = updateData.isParentDependent
    if (updateData.employerSize !== undefined) dbUpdateData.employer_size = updateData.employerSize
    if (updateData.defaultHourlyWage !== undefined) dbUpdateData.default_hourly_wage = updateData.defaultHourlyWage
    if (updateData.bracket !== undefined) dbUpdateData.bracket = updateData.bracket
    if (updateData.termsAccepted !== undefined) dbUpdateData.terms_accepted = updateData.termsAccepted
    if (updateData.onboardingCompleted !== undefined) dbUpdateData.onboarding_completed = updateData.onboardingCompleted

    // 更新処理
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(dbUpdateData)
      .eq('id', user.id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ApiErrorCode.DATABASE_ERROR,
            message: 'プロフィールの更新に失敗しました',
            details: updateError.message
          }
        },
        { status: 500 }
      )
    }

    // UserProfile型に変換
    const userProfile: UserProfile = {
      birthDate: updatedProfile.birth_date,
      studentType: updatedProfile.student_type,
      residenceCity: updatedProfile.residence_city,
      insuranceStatus: updatedProfile.insurance_status,
      parentInsuranceType: updatedProfile.parent_insurance_type,
      livingStatus: updatedProfile.living_status,
      monthlyAllowance: updatedProfile.monthly_allowance,
      employers: [], // TODO: 雇用者情報は別テーブルから取得
      otherIncome: updatedProfile.other_income,
      grade: updatedProfile.grade,
      isParentDependent: updatedProfile.is_parent_dependent,
      employerSize: updatedProfile.employer_size,
      defaultHourlyWage: updatedProfile.default_hourly_wage,
      bracket: updatedProfile.bracket,
      termsAccepted: updatedProfile.terms_accepted
    }

    return NextResponse.json({
      success: true,
      profile: userProfile
    })

  } catch (error) {
    console.error('Unexpected error in PUT /api/profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ApiErrorCode.INTERNAL_ERROR,
          message: '内部サーバーエラーが発生しました',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/profile - 新規プロフィール作成
 * 認証されたユーザーの新規プロフィールを作成します
 */
export async function POST(request: NextRequest): Promise<NextResponse<ProfileCreateResponse | ApiErrorResponse>> {
  try {
    const supabase = createSupabaseServerClient()
    
    // ユーザー認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ApiErrorCode.UNAUTHORIZED,
            message: '認証が必要です',
            details: authError?.message
          }
        },
        { status: 401 }
      )
    }

    // 既存プロフィールの確認
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ApiErrorCode.VALIDATION_ERROR,
            message: 'プロフィールは既に存在します',
            details: 'Use PUT method to update existing profile'
          }
        },
        { status: 409 }
      )
    }

    // リクエストボディ解析
    let createData: ProfileCreateRequest = {}
    try {
      createData = await request.json()
    } catch (parseError) {
      // JSON解析に失敗した場合は空のオブジェクトとして進行（デフォルト値で作成）
      console.warn('Failed to parse JSON body, creating with default values:', parseError)
    }

    // 新規プロフィール作成
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        display_name: createData.displayName || null,
        grade: createData.grade || null,
        // その他のフィールドはデフォルト値またはNULL
      })
      .select('*')
      .single()

    if (createError) {
      console.error('Profile creation error:', createError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ApiErrorCode.DATABASE_ERROR,
            message: 'プロフィールの作成に失敗しました',
            details: createError.message
          }
        },
        { status: 500 }
      )
    }

    // UserProfile型に変換
    const userProfile: UserProfile = {
      birthDate: newProfile.birth_date,
      studentType: newProfile.student_type,
      residenceCity: newProfile.residence_city,
      insuranceStatus: newProfile.insurance_status,
      parentInsuranceType: newProfile.parent_insurance_type,
      livingStatus: newProfile.living_status,
      monthlyAllowance: newProfile.monthly_allowance,
      employers: [], // 新規作成時は空配列
      otherIncome: newProfile.other_income,
      grade: newProfile.grade,
      isParentDependent: newProfile.is_parent_dependent,
      employerSize: newProfile.employer_size,
      defaultHourlyWage: newProfile.default_hourly_wage,
      bracket: newProfile.bracket,
      termsAccepted: newProfile.terms_accepted
    }

    return NextResponse.json({
      success: true,
      profile: userProfile
    })

  } catch (error) {
    console.error('Unexpected error in POST /api/profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ApiErrorCode.INTERNAL_ERROR,
          message: '内部サーバーエラーが発生しました',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    )
  }
}
