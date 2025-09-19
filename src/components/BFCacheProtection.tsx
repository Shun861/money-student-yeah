"use client";
import { useEffect } from 'react';

/**
 * ブラウザのBack/Forward Cache (BFCache)対策コンポーネント
 * 認証が必要なページでBFCacheによる古いページ表示を防ぐ
 */
export function BFCacheProtection() {
  useEffect(() => {
    // pageshow イベントでBFCacheからの復帰を検知
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // BFCacheから復帰した場合は強制リロード
        window.location.reload();
      }
    };

    // beforeunload でBFCacheへの保存を阻止
    const handleBeforeUnload = () => {
      // BFCacheに保存されないようにする
    };

    // pagehide でBFCacheへの保存を阻止
    const handlePageHide = () => {
      // BFCacheに保存されないようにする
    };

    // イベントリスナーを登録
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    // Cache-Control ヘッダーを設定（可能な場合）
    if (typeof document !== 'undefined') {
      // メタタグでキャッシュを無効化
      const metaTag = document.createElement('meta');
      metaTag.httpEquiv = 'Cache-Control';
      metaTag.content = 'no-cache, no-store, must-revalidate';
      document.head.appendChild(metaTag);

      const pragmaTag = document.createElement('meta');
      pragmaTag.httpEquiv = 'Pragma';
      pragmaTag.content = 'no-cache';
      document.head.appendChild(pragmaTag);

      const expiresTag = document.createElement('meta');
      expiresTag.httpEquiv = 'Expires';
      expiresTag.content = '0';
      document.head.appendChild(expiresTag);

      // クリーンアップで削除
      return () => {
        window.removeEventListener('pageshow', handlePageShow);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('pagehide', handlePageHide);
        
        document.head.removeChild(metaTag);
        document.head.removeChild(pragmaTag);
        document.head.removeChild(expiresTag);
      };
    }

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  return null; // UIを持たないコンポーネント
}