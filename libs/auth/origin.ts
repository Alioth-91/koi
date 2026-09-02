/** 로컬 개발에서 OAuth callback에 허용하는 주소. */
const LOCAL_ORIGIN = "http://localhost:3000";

/**
 * OAuth에서 사용할 서비스의 대표 origin을 반환한다.
 *
 * 로컬에서는 localhost를 허용하고, 운영에서는 HTTPS 주소만 허용한다.
 * 경로·쿼리·해시가 포함된 URL은 origin으로 사용할 수 없으므로 거부한다.
 *
 * @param siteUrl OAuth에 사용할 사이트 URL. 기본값은 환경변수다.
 * @param isDevelopment 개발 환경인지 여부
 * @returns 경로를 제외한 정규화된 origin
 * @throws 사이트 URL이 없거나 OAuth에 사용할 수 없는 형식이면 오류를 던진다.
 */
export function getCanonicalOrigin(
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL,
  isDevelopment = process.env.NODE_ENV === "development",
): string {
  const value = siteUrl ?? (isDevelopment ? LOCAL_ORIGIN : undefined);

  if (!value) {
    throw new Error("NEXT_PUBLIC_SITE_URL이 설정되지 않았습니다");
  }

  const url = new URL(value);
  const isLocalHttp =
    isDevelopment && url.protocol === "http:" && url.hostname === "localhost";

  if (url.protocol !== "https:" && !isLocalHttp) {
    throw new Error("운영 OAuth 주소는 HTTPS여야 합니다");
  }

  if (url.pathname !== "/" || url.search || url.hash) {
    throw new Error("NEXT_PUBLIC_SITE_URL에는 origin만 설정해야 합니다");
  }

  return url.origin;
}

/**
 * OAuth callback 요청의 origin이 허용된 주소인지 확인한다.
 *
 * 개발 환경에서는 localhost와 대표 origin을 모두 허용하고,
 * 운영 환경에서는 대표 origin만 허용한다.
 *
 * @param requestUrl OAuth callback을 요청한 전체 URL
 * @param canonicalOrigin 서비스가 공식적으로 사용하는 대표 origin
 * @param isDevelopment 개발 환경인지 여부
 * @returns 허용된 origin이면 반환하고, 아니면 null을 반환한다.
 */
export function getAllowedOAuthOrigin(
  requestUrl: string,
  canonicalOrigin: string,
  isDevelopment = process.env.NODE_ENV === "development",
): string | null {
  const requestOrigin = new URL(requestUrl).origin;
  const allowedOrigins = isDevelopment
    ? [canonicalOrigin, LOCAL_ORIGIN]
    : [canonicalOrigin];

  return allowedOrigins.includes(requestOrigin) ? requestOrigin : null;
}
