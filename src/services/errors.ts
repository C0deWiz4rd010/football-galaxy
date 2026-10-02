/** Thrown when an upstream source answered but the requested entity does not exist. */
export class NotFoundError extends Error {
  readonly notFound = true

  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError || (typeof error === 'object' && error !== null && 'notFound' in error)
}
