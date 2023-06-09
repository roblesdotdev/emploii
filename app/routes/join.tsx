import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { Button, ErrorLabel, Input } from '~/components/lib'
import { createUser } from '~/utils/auth.server'
import { createUserSession, getJoinSession } from '~/utils/session.server'
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateUsername,
  validateUsernameExistence,
} from '~/utils/validation'

export const loader: LoaderFunction = async ({ request }) => {
  const joinEmail = await getJoinSession(request)

  if (!joinEmail || validateEmail(joinEmail)) {
    return redirect('/signup')
  }

  return json({})
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const email = await getJoinSession(request)
  const { username, password, confirmPassword, termsAndConditions } =
    Object.fromEntries(formData)
  invariant(typeof username === 'string', 'username type is invalid')
  invariant(typeof password === 'string', 'password type is invalid')
  invariant(
    typeof confirmPassword === 'string',
    'confirmPassword type is invalid',
  )

  const errors = {
    username:
      validateUsername(username) || (await validateUsernameExistence(username)),
    password: validatePassword(password),
    confirmPassword: validateConfirmPassword(password, confirmPassword),
    termsAndConditions:
      termsAndConditions === 'on'
        ? null
        : 'You must agree to terms and conditions',
  }

  if (Object.values(errors).some(Boolean)) {
    return json({ status: 'error', errors }, { status: 400 })
  }

  const user = await createUser({ email, username, password })

  return await createUserSession({
    request,
    userId: user.id,
    remember: true,
    redirectTo: '/',
  })
}

export default function Join() {
  const fetcher = useFetcher()
  const errors = fetcher.data?.errors
  return (
    <div>
      <fetcher.Form method="post" noValidate>
        <div className="mx-auto max-w-xl px-4 pt-16 pb-4">
          <h1 className="mb-4 text-xl font-bold">Register</h1>
          <div className="flex flex-col py-2">
            <label htmlFor="username">Username</label>
            <Input
              placeholder="Enter your username..."
              type="text"
              name="username"
              id="username"
              aria-describedby="username-error"
              aria-invalid={Boolean(errors?.username)}
            />
            <ErrorLabel error={errors?.username} id="username-error" />
          </div>
          <div className="flex flex-col py-2">
            <label htmlFor="password">Password</label>
            <Input
              placeholder="Enter your password..."
              type="password"
              name="password"
              id="password"
              aria-describedby="password-error"
              aria-invalid={Boolean(errors?.password)}
            />
            <ErrorLabel error={errors?.password} id="password-error" />
          </div>
          <div className="flex flex-col py-2">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <Input
              placeholder="Confirm your password..."
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              aria-describedby="confirmPassword-error"
              aria-invalid={Boolean(errors?.confirmPassword)}
            />
            <ErrorLabel
              error={errors?.confirmPassword}
              id="confirmPassword-error"
            />
          </div>

          <div className="flex flex-col gap-2 py-2">
            <div className="space-x-2">
              <input
                type="checkbox"
                name="termsAndConditions"
                id="termsAndConditions"
              />
              <label htmlFor="termsAndConditions">
                I accept the terms and conditions
              </label>
            </div>
            <ErrorLabel
              error={errors?.termsAndConditions}
              id="termsAndConditions-error"
            />
          </div>
          <div className="mt-4">
            <Button
              type="submit"
              className="px-10 sm:max-w-max"
              disabled={fetcher.state !== 'idle'}
            >
              Register
            </Button>
          </div>
        </div>
      </fetcher.Form>
    </div>
  )
}
