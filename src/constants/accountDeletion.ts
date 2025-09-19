/**
 * アカウント削除に関する定数
 */
export const ACCOUNT_DELETION = {
  // 削除確認に必要なテキスト
  CONFIRMATION_TEXT: 'アカウントを削除',
  
  // エラーメッセージ
  CONFIRMATION_ERROR: '確認のため「アカウントを削除」と正確に入力してください。',
  
  // 成功メッセージ  
  SUCCESS_MESSAGE: 'アカウントが正常に削除されました。ご利用ありがとうございました。',
  
  // プレースホルダー
  CONFIRMATION_PLACEHOLDER: 'アカウントを削除',
  
  // ヘルプテキスト
  CONFIRMATION_HELP: '誤操作防止のため「アカウントを削除」と正確に入力してください'
} as const;