/**
 * Deployment satu outlet / satu cabang: tanpa alur HQ (multi-cabang pusat).
 * Set NEXT_PUBLIC_SINGLE_BRANCH=true di .env — lihat .env.example.
 */
export function isSingleBranchDeployment(): boolean {
  return process.env.NEXT_PUBLIC_SINGLE_BRANCH === 'true';
}

/** Default setelah login jika tidak ada callbackUrl */
export function defaultPostLoginPath(): string {
  return isSingleBranchDeployment() ? '/dashboard' : '/opanel/dashboard';
}

/** Home setelah onboarding / KYB selesai */
export function defaultAppHomePath(): string {
  return isSingleBranchDeployment() ? '/dashboard' : '/hq/home';
}
