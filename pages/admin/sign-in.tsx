import { getCsrfToken, getSession, signIn } from 'next-auth/react'
import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useState, useRef } from 'react'

const MINIMUM_ACTIVITY_TIMEOUT = 850
type LoginFormValues = {
  csrfToken: string
  email: string
  password: string
}

export default function Page({ csrfToken }) {
  const [isSubmitting, setSubmitting] = React.useState(false)

  const { register, handleSubmit } = useForm()

  const onSubmit = async (data: LoginFormValues) => {
    setSubmitting(true)
    try {
      signIn('admin-login', {
        callbackUrl: '/admin',
        redirect: true,
        email: data.email,
        password: data.password,
      })

      setTimeout(() => {
        setSubmitting(false)
      }, MINIMUM_ACTIVITY_TIMEOUT)
    } catch (error) {
      console.error(error)
      //   setError(error)
      setSubmitting(false)
    }
  }

  const [pass, setPass] = useState('')

  const pwRef = useRef(null)
  const letterRef = useRef(null)
  const capitalRef = useRef(null)
  const numberRef = useRef(null)
  const lengthRef = useRef(null)

  const lowerCaseLetters = /[a-z]/g
  const upperCaseLetters = /[A-Z]/g
  const numbers = /[0-9]/g

  const handleOnChange = (e) => {
    setPass(e.target.value)

    let currString = e.target.value

    //check lowercase match
    if (currString.match(lowerCaseLetters)) {
      letterRef.current.className = 'valid'
    } else {
      letterRef.current.className = 'invalid'
    }

    //check uppercase match
    if (currString.match(upperCaseLetters)) {
      capitalRef.current.className = 'valid'
    } else {
      capitalRef.current.className = 'invalid'
    }

    //check number match
    if (currString.match(numbers)) {
      numberRef.current.className = 'valid'
    } else {
      numberRef.current.className = 'invalid'
    }

    //check length match
    if (currString.length >= 8) {
      lengthRef.current.className = 'valid'
    } else {
      lengthRef.current.className = 'invalid'
    }
  }

  return (
    <div className="min-h-screen  flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Admin Sign In</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center py-12">
        <Image
          className="h-16 w-16 mx-auto"
          src="/assets/unchain.png"
          alt="Unchain Logo"
          height={60}
          width={60}
        />
      </div>
      <div className=" flex flex-col justify-center py-12 sm:px-6 lg:px-8 mt-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center ">
          <p>Admin Sign In</p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="py-8 px-4 mx-2 rounded-sm sm:px-10">
            <form className="text-center" onSubmit={handleSubmit(onSubmit)}>
              <input
                name="csrfToken"
                {...register('csrfToken')}
                type="hidden"
                defaultValue={csrfToken}
                hidden
              />
              <div className="">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-400"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    {...register('email')}
                    className="appearance-none w-full font-medium py-3 border-b border-t-0 border-l-0 border-r-0 border-dashed outline-none text-xl text-center leading-6 bg-transparent placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 transition duration-150 ease-in-out"
                  />
                </div>
              </div>

              <div>
                <div className="mt-8">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-neutral-400"
                  >
                    Password
                  </label>
                </div>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    minLength={8}
                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                    title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
                    required
                    {...register('password')}
                    className="appearance-none w-full font-medium py-3 border-b border-t-0 border-l-0 border-r-0 border-dashed outline-none text-xl text-center leading-6 bg-transparent placeholder-neutral-400 focus:outline-none focus:placeholder-neutral-200 text-neutral-100 transition duration-150 ease-in-out"
                    ref={pwRef}
                    value={pass}
                    onChange={handleOnChange}
                  />
                </div>
                <div id="message" className="mt-4">
                  <h3>Password must contain the following:</h3>
                  <p ref={letterRef} className="invalid">
                    A <b>lowercase</b> letter
                  </p>
                  <p ref={capitalRef} className="invalid">
                    A <b>capital (uppercase)</b> letter
                  </p>
                  <p ref={numberRef} className="invalid">
                    A <b>number</b>
                  </p>
                  <p ref={lengthRef} className="invalid">
                    Minimum <b>8 characters</b>
                  </p>
                </div>
              </div>

              <div className="mt-16 space-y-2 flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="button button__round button__md button__primary w-full"
                >
                  {isSubmitting ? (
                    <img src="/assets/loading.svg" />
                  ) : (
                    <p className="text-white">Sign In</p>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context)

  if (session) {
    return { redirect: { permanent: false, destination: '/admin' } }
  }

  return {
    props: { csrfToken: await getCsrfToken({ req: context.req }) },
  }
}
