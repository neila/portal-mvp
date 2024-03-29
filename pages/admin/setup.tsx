import { getCsrfToken, signIn } from 'next-auth/react'
import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import React from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import superagent from 'superagent'

import prisma from '@db'

const MINIMUM_ACTIVITY_TIMEOUT = 850
type LoginFormValues = {
  csrfToken: string
  email: string
  password: string
}

export default function Page({ csrfToken }) {
  const [isSubmitting, setSubmitting] = React.useState(false)

  const { register, handleSubmit } = useForm()

  const createAdminAccountHandler = async (data: LoginFormValues) => {
    const response = await superagent
      .post('/api/auth/administrator/create')
      .send({
        csrfToken: data.csrfToken,
        email: data.email,
        password: data.password,
      })

    return response.body
  }
  const onSubmit = async (data: LoginFormValues) => {
    setSubmitting(true)
    try {
      createAdminAccountHandler(data)
        .then((response) => {
          signIn('admin-login', {
            callbackUrl: '/admin',
            email: data.email,
            password: data.password,
          })
        })
        .catch((error) => {})

      setTimeout(() => {
        setSubmitting(false)
      }, MINIMUM_ACTIVITY_TIMEOUT)
    } catch (error) {
      console.error(error)
      //   setError(error)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen  flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Setup</title>
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
          <p>Welcome to the PlanetScale Next.js Starter App</p>
          <p>Get started by creating an administrative account to setup.</p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="py-8 px-4 mx-2 rounded-sm sm:px-10">
            <form className=" text-center " onSubmit={handleSubmit(onSubmit)}>
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
                    minLength={12}
                    required
                    {...register('password')}
                    className="appearance-none w-full font-medium py-3 border-b border-t-0 border-l-0 border-r-0 border-dashed outline-none text-xl text-center leading-6 bg-transparent placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 transition duration-150 ease-in-out"
                  />
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
                    <p className="text-white">Create Account</p>
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
  const maybeAdministrator = await prisma.user.findFirst({
    where: {
      role: 'admin',
    },
  })

  if (maybeAdministrator) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  return {
    props: { csrfToken: await getCsrfToken({ req: context.req }) },
  }
}
