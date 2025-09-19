-- アカウント削除用のデータベース関数
-- 外部キー制約を考慮した正しい順序でデータを削除する

CREATE OR REPLACE FUNCTION delete_user_account(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_counts json;
  work_schedules_count int := 0;
  shifts_count int := 0;
  incomes_count int := 0;
  employers_count int := 0;
  profile_count int := 0;
BEGIN
  -- 削除前のカウント取得（監査ログ用）
  SELECT COUNT(*) INTO work_schedules_count FROM work_schedules WHERE user_id = target_user_id;
  SELECT COUNT(*) INTO shifts_count FROM shifts WHERE user_id = target_user_id;
  SELECT COUNT(*) INTO incomes_count FROM incomes WHERE user_id = target_user_id;
  SELECT COUNT(*) INTO employers_count FROM employers WHERE user_id = target_user_id;
  SELECT COUNT(*) INTO profile_count FROM profiles WHERE id = target_user_id;

  -- 外部キー制約を考慮した削除順序
  -- 1. 従属データの削除（外部キー参照あり）
  DELETE FROM work_schedules WHERE user_id = target_user_id;
  DELETE FROM shifts WHERE user_id = target_user_id;
  DELETE FROM incomes WHERE user_id = target_user_id;
  DELETE FROM employers WHERE user_id = target_user_id;
  
  -- 2. プロフィールデータの削除
  DELETE FROM profiles WHERE id = target_user_id;
  
  -- 削除結果のサマリーを作成
  deleted_counts := json_build_object(
    'user_id', target_user_id,
    'deleted_at', NOW(),
    'work_schedules', work_schedules_count,
    'shifts', shifts_count,
    'incomes', incomes_count,
    'employers', employers_count,
    'profile', profile_count,
    'total_records', work_schedules_count + shifts_count + incomes_count + employers_count + profile_count
  );
  
  -- 削除結果のログ
  RAISE NOTICE 'User account data deleted for user: % - Records deleted: %', 
    target_user_id, deleted_counts;
  
  RETURN deleted_counts;
  
EXCEPTION
  WHEN OTHERS THEN
    -- エラー時はロールバック
    RAISE EXCEPTION 'Failed to delete user account data for user %: %', target_user_id, SQLERRM;
END;
$$;

-- 関数に対する適切な権限設定
-- service_role のみがこの関数を実行可能
REVOKE ALL ON FUNCTION delete_user_account(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION delete_user_account(uuid) TO service_role;

-- 関数の使用例とテスト用のコメント
/*
使用例:
SELECT delete_user_account('user-uuid-here');

返り値例:
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "deleted_at": "2025-09-19T10:30:00.000Z",
  "work_schedules": 5,
  "shifts": 12,
  "incomes": 20,
  "employers": 2,
  "profile": 1,
  "total_records": 40
}

テスト時の注意:
- この関数は SECURITY DEFINER で実行されるため、Row Level Security (RLS) をバイパスします
- 実際のデータ削除を行うため、テスト環境でのみ実行してください
- 本番環境では十分な認証とログ記録を行ってから実行してください
*/