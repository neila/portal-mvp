import { filter } from 'lodash'
import { GetServerSidePropsContext } from 'next'
import { getSession, getCsrfToken, signIn, getProviders } from 'next-auth/react'
import Head from 'next/head'
import React from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import Link from 'next/link'

const MINIMUM_ACTIVITY_TIMEOUT = 850
type LoginFormValues = {
    csrfToken: string
    email: string
    password: string
}

export default function Page({ csrfToken, providers }) {
    const [isSubmitting, setSubmitting] = React.useState(false)

    const { register, handleSubmit } = useForm()

    const handleProviderSignIn = (provider) => {
        signIn(provider.id)
    }
    const onSubmit = async (data: LoginFormValues) => {
        setSubmitting(true)
        try {
            signIn('app-login', {
                callbackUrl: '/home',
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

    return (
        <div className="min-h-screen  flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-neutral-600">
            <Head>
                <title>Sign In</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center py-12">
                <Link href="/">
                    <Image
                        className="h-16 w-16 mx-auto"
                        src="/assets/unchain.png"
                        alt="Unchain Logo"
                        height={60}
                        width={60}
                    />
                </Link>
            </div>
            <div className=" flex flex-col justify-center sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                    <h1 className="text-xl font-bold leading-7 text-neutral-100 sm:leading-9 sm:truncate">
                        Sign In
                    </h1>
                    <h2 className="text-neutral-300">
                        Sign in with an existing account, or create new account.
                    </h2>
                </div>
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="py-8 px-4 mx-2 rounded-sm sm:px-10">
                        <form
                            className="text-center my-12"
                            onSubmit={handleSubmit(onSubmit)}
                        >
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
                                    className="block text-sm font-medium text-neutral-300"
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
                                        className="appearance-none w-full font-medium py-3 border-b border-t-0 border-l-0 border-r-0 border-dashed outline-none text-xl text-center leading-6 bg-transparent placeholder-neutral-400 focus:outline-none focus:placeholder-neutral-200 text-neutral-100 transition duration-150 ease-in-out"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mt-8">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-neutral-300"
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
                                        className="appearance-none w-full font-medium py-3 border-b border-t-0 border-l-0 border-r-0 border-dashed outline-none text-xl text-center leading-6 bg-transparent placeholder-neutral-400 focus:outline-none focus:placeholder-neutral-200 text-neutral-100 transition duration-150 ease-in-out"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 space-y-2 flex justify-center">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="button button__md button__primary"
                                >
                                    {isSubmitting ? (
                                        <img src="/assets/loading.svg" />
                                    ) : (
                                        <p>Sign in</p>
                                    )}
                                </button>
                            </div>
                        </form>
                        {/* <section className="mt-8 text-center">
                            <div className="flex flex-col mb-8">
                                <hr className="h-0 border-t mt-1" />
                                <div className="-mt-3 text-sm text-center">
                                    <span className="px-2 bg-neutral-300 text-secondary">
                                        Or with
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {providers.map((provider) => {
                                    return (
                                        <button
                                            key={provider}
                                            type="button"
                                            onClick={() =>
                                                handleProviderSignIn(provider)
                                            }
                                            className="button button__secondary inline-flex space-x-2"
                                        >
                                            <img
                                                className="w-6 h-6"
                                                src={`/assets/${provider.id}.svg`}
                                            />
                                            <p className="text-neutral-500">
                                                {provider.name}
                                            </p>
                                        </button>
                                    )
                                })}
                            </div>
                        </section> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getSession(context)

    if (session) {
        return { redirect: { permanent: false, destination: '/home' } }
    }

    const csrfToken = await getCsrfToken({ req: context.req })
    const providers = filter(await getProviders(), (provider) => {
        return provider.type !== 'credentials'
    })

    return {
        props: { csrfToken, providers },
    }
}
