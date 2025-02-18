'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createUser, findUserByEmail } from '@/lib/db/users'
import { comparePasswords, hashPassword } from '@/lib/auth'

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return {
      type: 'error',
      message: 'Email and password are required'
    }
  }

  try {
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return {
        type: 'error',
        message: 'User already exists'
      }
    }

    const hashedPassword = await hashPassword(password)
    await createUser(email, hashedPassword)

    redirect('/sign-in?message=Account created successfully')
  } catch (error) {
    return {
      type: 'error',
      message: 'Error creating account'
    }
  }
}

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return {
      type: 'error',
      message: 'Email and password are required'
    }
  }

  try {
    const user = await findUserByEmail(email)
    if (!user) {
      return {
        type: 'error',
        message: 'Invalid credentials'
      }
    }

    const isValid = await comparePasswords(password, user.password)
    if (!isValid) {
      return {
        type: 'error',
        message: 'Invalid credentials'
      }
    }

    // Set session cookie
    cookies().set('session', user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    redirect('/')
  } catch (error) {
    return {
      type: 'error',
      message: 'Error signing in'
    }
  }
}

export async function signOutAction() {
  cookies().delete('session')
  redirect('/sign-in')
} 