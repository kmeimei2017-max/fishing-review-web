/**
 * 데이터 포맷 유틸리티
 * 날짜, 통화 등의 데이터를 사용자 친화적인 형식으로 변환
 */

/**
 * 금액을 한국 원화(KRW) 형식으로 포맷
 * @param amount 금액 (숫자)
 * @param options 추가 포맷 옵션
 * @returns 포맷된 원화 문자열
 *
 * @example
 * formatCurrency(1000000) // "₩1,000,000"
 * formatCurrency(1500000, { showSymbol: false }) // "1,500,000원"
 */
export function formatCurrency(
  amount: number,
  options?: {
    /** 통화 기호 표시 여부 (기본값: true) */
    showSymbol?: boolean
    /** 원 단위 표시 여부 (기본값: false) */
    showWon?: boolean
  }
): string {
  const { showSymbol = true, showWon = false } = options || {}

  // 숫자가 아닌 경우 처리
  if (isNaN(amount)) {
    return showSymbol ? '₩0' : '0원'
  }

  const formatted = new Intl.NumberFormat('ko-KR').format(amount)

  if (showSymbol) {
    return `₩${formatted}`
  }

  if (showWon) {
    return `${formatted}원`
  }

  return formatted
}

/**
 * 파일명에 안전한 문자열로 변환
 * @param text 원본 텍스트
 * @returns 파일명에 사용 가능한 문자열
 *
 * @example
 * sanitizeFilename('거문도 참돔 후기 (2025.10.07)') // "거문도-참돔-후기-2025-10-07"
 */
export function sanitizeFilename(text: string): string {
  return text
    .replace(/[#()]/g, '')
    .replace(/\s+/g, '-')
    .replace(/\./g, '-')
    .toLowerCase()
}
