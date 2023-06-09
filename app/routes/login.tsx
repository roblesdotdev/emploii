import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useFetcher, useSearchParams } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { Button, ErrorLabel, Input } from '~/components/lib'
import { verifyCredentials } from '~/utils/auth.server'
import { createUserSession, getSessionUser } from '~/utils/session.server'
import { validatePassword, validateUsername } from '~/utils/validation'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getSessionUser(request)

  if (user) return redirect('/')

  return json({})
}

type ActionData = {
  status: 'success' | 'error'
  errors?: {
    username?: string | null
    password?: string | null
    form?: string | null
  } | null
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const { username, password, remember, redirectTo } =
    Object.fromEntries(formData)
  invariant(typeof username === 'string', 'username type invalid')
  invariant(typeof password === 'string', 'password type invalid')
  invariant(typeof redirectTo === 'string', 'redirectTo type invalid')

  const errors = {
    username: validateUsername(username),
    password: validatePassword(password),
  }

  if (Object.values(errors).some(Boolean)) {
    return json<ActionData>({ status: 'error', errors }, { status: 400 })
  }

  const user = await verifyCredentials({ username, password })
  if (!user) {
    return json<ActionData>(
      { status: 'error', errors: { form: 'Invalid username or password' } },
      { status: 400 },
    )
  }

  return await createUserSession({
    request,
    userId: user.id,
    remember: remember === 'on',
    redirectTo,
  })
}

export default function LoginRoute() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const fetcher = useFetcher()
  const errors = fetcher.data?.errors

  return (
    <div>
      <fetcher.Form method="post" noValidate aria-describedby="form-error">
        <div className="mx-auto max-w-xl px-4 pt-16 pb-4">
          <h1 className="mb-4 text-xl font-bold">Login</h1>
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
          <div className="space-x-2 py-2">
            <input type="checkbox" name="redirectTo" id="redirectTo" />
            <label htmlFor="redirectTo">Remember me</label>
          </div>
          <input type="hidden" name="redirectTo" defaultValue={redirectTo} />
          <ErrorLabel error={errors?.form} id="form-error" />
          <div className="mt-4">
            <Button
              className="px-10 sm:max-w-max"
              type="submit"
              disabled={fetcher.state !== 'idle'}
            >
              Log in
            </Button>
          </div>
        </div>
      </fetcher.Form>
      <div className="mx-auto max-w-xl px-4">
        <p>
          Don't have an account yet?{' '}
          <Link className="text-blue-600 underline" to="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
