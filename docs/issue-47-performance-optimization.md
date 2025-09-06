# Issue #47: パフォーマンス最適化 - Code Splitting & Bundle最適化

## 問題の概要
動的インポートやCode Splittingが未実装で、Chart.jsなど重いライブラリの初期ロードにより、初期ロード時間が増加しています。

## 現在の状況
- Chart.js全体を静的インポートしている
- バンドル分割が行われていない
- 不要なリレンダリングが発生している可能性
- モバイル環境でのパフォーマンス未検証

## 問題の影響
- 初期ロード時間の増加
- モバイル環境でのパフォーマンス低下
- ユーザーエクスペリエンスの悪化

## 解決方針
1. **動的インポート**: 重いコンポーネントの遅延ロード
2. **Code Splitting**: ページレベルでのバンドル分割
3. **Chart.js最適化**: 必要な部分のみのインポート
4. **メモ化**: 不要なリレンダリングの防止

## 実装タスク
### Phase 1: 動的インポート実装
- [ ] `IncomePrediction`コンポーネントの動的ロード
- [ ] Chart.jsコンポーネントの遅延ロード
- [ ] Suspenseを使ったローディング状態表示
- [ ] 重いライブラリの識別と対応

### Phase 2: Code Splitting最適化
- [ ] ページレベルでのバンドル分割確認
- [ ] ルートレベルでの最適化
- [ ] 共通コンポーネントの適切な分割
- [ ] Webpack Bundle Analyzer導入

### Phase 3: レンダリング最適化
- [ ] React.memoの適切な使用
- [ ] Zustandストアのselector最適化
- [ ] useCallbackとuseMemoの最適化
- [ ] 不要なリレンダリングの特定と修正

### Phase 4: Chart.js最適化
- [ ] 必要なChart.js要素のみインポート
- [ ] チャートコンポーネントの最適化
- [ ] レスポンシブ対応の改善
- [ ] アニメーションの最適化

## 関連ファイル
- `src/components/ui/IncomePrediction.tsx`
- `next.config.ts`
- `package.json`
- 各種ページコンポーネント

## 実装例
```tsx
// 動的インポート例
const IncomePrediction = lazy(() => import('@/components/ui/IncomePrediction'));

// 使用時
<Suspense fallback={<ChartLoadingSkeleton />}>
  <IncomePrediction {...props} />
</Suspense>
```

```typescript
// Chart.js最適化例
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js/auto';

// 必要な要素のみ登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
```

## パフォーマンス指標
### 目標値
- [ ] 初期ロード時間: 3秒以下
- [ ] FCP (First Contentful Paint): 1.5秒以下  
- [ ] LCP (Largest Contentful Paint): 2.5秒以下
- [ ] CLS (Cumulative Layout Shift): 0.1以下

### 測定方法
- [ ] Lighthouse score改善
- [ ] Web Vitals測定
- [ ] 実機での測定（モバイル含む）
- [ ] 継続的なパフォーマンス監視

## テスト項目
- [ ] 動的インポートコンポーネントの正常動作
- [ ] ローディング状態の適切な表示
- [ ] バンドルサイズの削減確認
- [ ] モバイル環境でのパフォーマンス改善
- [ ] チャート表示の高速化

## 優先度
**低** - UX改善として重要だが、機能的な問題ではない

## 関連Issue
なし（独立したパフォーマンス改善）

## Parent Issue
- #40 潜在的問題調査レポート
