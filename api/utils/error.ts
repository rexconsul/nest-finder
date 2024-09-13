export const errorHandler = (msg: string, cause: Error): Error => {
  const error = new Error(msg)
  error.stack = msg + cause
  return error;
}