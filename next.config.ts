import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // @libsql/client は file: 接続時にネイティブモジュールを使うためバンドル対象から除外
  serverExternalPackages: ['@libsql/client', 'libsql'],
}

export default nextConfig
