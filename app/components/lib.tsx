import clsx from 'clsx'
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
} from 'react'

export function Button({
  children,
  className,
  ...other
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx('w-full bg-black py-3 px-6 text-white', className)}
      {...other}
    >
      {children}
    </button>
  )
}

export function Input({
  className,
  ...other
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'w-full  p-3 outline-none ring-1 ring-inset ring-black/10 focus:ring-2 focus:ring-black',
        className,
      )}
      {...other}
    />
  )
}

export function ErrorLabel({
  className,
  id,
  error,
}: Pick<HTMLAttributes<HTMLSpanElement>, 'id' | 'className'> & {
  error?: string | null
}) {
  if (!error) return null

  return (
    <span id={id} className={clsx('text-sm text-red-600', className)}>
      {error}
    </span>
  )
}
