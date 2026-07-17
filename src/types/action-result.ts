/**
 * Server Action 공통 반환 타입
 */
export interface ActionResult<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[] | undefined>
}
