# Stock-Bird
Desktop apps for NODACORPORATION

# プロジェクト構成（Vite + React + Electron）

📦 vite-project/\
├─ 📁 electron/                  # Electronメインプロセス関連\
│  ├─ main.cjs                  # メインエントリ（CommonJS）\
│  └─ preload.js                # Preloadスクリプト（Rendererとの橋渡し）\
├─ 📁 public/                    # 公開用静的ファイル\
│  ├─ template.csv              # CSVテンプレートファイル（例示用）\
│  └─ vite.svg                  # Viteロゴ画像\
├─ 📁 src/                       # ソースコード\
│  ├─ 📁 components/             # 共通UIコンポーネント\
│  │  └─ UploadButton.tsx       # ファイルアップロードボタン\
│  ├─ 📁 pages/                  # ページ単位のコンポーネント群\
│  │  ├─ BuildingList.tsx       # ビル一覧表示ページ\
│  │  ├─ GraphPage.tsx          # グラフ可視化ページ\
│  │  └─ MainPage.tsx           # メイン画面\
│  ├─ 📁 types/                  # 型定義（TypeScript用）\
│  │  ├─ css.d.ts               # CSS Modules用型定義\
│  │  ├─ global.d.ts            # グローバル型定義\
│  │  └─ property.ts            # 不動産データの型定義\
│  ├─ App.tsx                   # アプリケーションのルートコンポーネント\
│  ├─ main.css                  # グローバルスタイル\
│  └─ main.tsx                  # Reactアプリのエントリポイント\
├─ .gitignore                   # Git管理から除外するファイル設定\
├─ eslint.config.js             # ESLint設定ファイル\
├─ index.html                   # HTMLエントリポイント\
├─ package.json                 # プロジェクトの依存パッケージ定義\
├─ package-lock.json            # 依存パッケージのバージョン固定\
├─ README.md                    # プロジェクト概要ドキュメント\
├─ test.html                    # テスト用HTML（用途に応じて整理）\
├─ tsconfig.app.json            # TypeScript設定（アプリ用）\
├─ tsconfig.json                # 共通のTypeScript設定\
├─ tsconfig.node.json           # Node.js向けのTypeScript設定\
├─ tsconfig.tsbuildinfo         # TypeScriptのビルド情報キャッシュ\
├─ vite.config.ts               # Viteのビルド設定\
└─ 要件定義.md                  # 機能要件・仕様などのまとめ\

# exe化
1. versionを変更
2. コマンドでnpm run dist