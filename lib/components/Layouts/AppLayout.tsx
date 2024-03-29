import classNames from 'classnames'
import { useSession, signOut, signIn } from 'next-auth/react'
import Link from 'next/link'
import { Menu, Transition } from '@headlessui/react'
import { UserIcon } from '@heroicons/react/outline'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { Fragment } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Head from 'next/head'

const AppLayout = (props) => {
  const { status, data: session } = useSession({
    required: false,
  })

  const router = useRouter()

  const currentPath = router.pathname
  const NAV_AUTH = [
    {
      title: 'Auth',
      href: '/',
    },
    // {
    //     title: 'Client',
    //     href: '/client',
    // },
    // {
    //     title: 'Server',
    //     href: '/server',
    // },
  ]
  const NAV_ITEMS = [
    {
      title: 'Home',
      href: '/home',
    },
    // {
    //     title: 'Client Redirect',
    //     href: '/client-redirect',
    // },
    // {
    //     title: 'Server Redirect',
    //     href: '/server-redirect',
    // },
  ]

  return (
    <>
      <Head>
        <title> UNCHAIN portal </title>
        <link rel="icon" href="/assets/favicon.ico" />

        <meta property="og:url" content="app.shiftbase.xyz" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="shiftbase, inc." />
        <meta
          property="og:description"
          content="Let's get started with web3."
        />
        <meta
          property="og:image"
          content="https://shiftbase.xyz/images/shiftbase-preview.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@_k1ddx" />
      </Head>

      <div className="min-h-screen bg-neutral-600">
        <div className="flex flex-col flex-1">
          <div className="border-b">
            <div className="relative flex-shrink-0 flex h-16 bg-neutral-600">
              <div className="flex-1 px-4 flex mt-1 justify-between sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
                <button
                  type="button"
                  className="px-4 text-neutral-400 focus:outline-none"
                >
                  <Image
                    className="h-8 w-8 mx-auto"
                    src="/assets/unchain.png"
                    alt="Unchain Logo"
                    height={60}
                    width={60}
                  />
                </button>
                <div className="flex-1 flex"></div>
                <div className="ml-4 flex items-center md:ml-6">
                  {status == 'authenticated' ? (
                    <div></div>
                  ) : (
                    <Menu as="div" className="ml-3 relative">
                      <div>
                        <Menu.Button className="max-w-xs bg-gray-100 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-2 lg:rounded-md lg:hover:bg-gray-50">
                          {session?.user?.image ? (
                            <Image
                              className="h-6 w-6 rounded-full"
                              src={session.user.image}
                              alt="User Avatar"
                            />
                          ) : (
                            <UserIcon className="h-6 w-6 rounded-full" />
                          )}

                          <span className="hidden  text-neutral-700 text-sm font-medium lg:block">
                            <span className="sr-only">Open user menu for </span>
                          </span>
                          <ChevronDownIcon
                            className="flex-shrink-0 h-5 w-5 text-neutral-400"
                            aria-hidden="true"
                          />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                          {/* {status == 'authenticated' ? (
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <a
                                                                    onClick={() =>
                                                                        signOut()
                                                                    }
                                                                    className={classNames(
                                                                        active
                                                                            ? 'bg-gray-100'
                                                                            : '',
                                                                        'block px-4 py-2 text-sm text-neutral-700'
                                                                    )}
                                                                >
                                                                    Sign Out
                                                                </a>
                                                            )}
                                                        </Menu.Item>
                                                    ) : ( */}
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                onClick={() => signIn()}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-neutral-700'
                                )}
                              >
                                Sign In
                              </a>
                            )}
                          </Menu.Item>
                          {/* )} */}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  )}
                </div>
              </div>
            </div>
            <div className="relative flex-shrink-0 flex h-16 bg-neutral-600">
              <div className="flex-1 px-4 flex justify-between sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
                <div className="flex flex-1">
                  {status !== 'authenticated'
                    ? NAV_AUTH.map((item) => (
                        <Link key={item.title} href={item.href}>
                          <a
                            className={classNames(
                              item.href === currentPath
                                ? 'border-b border-indigo-600 text-white'
                                : ' hover:border-b  hover:border-gray-200 text-neutral-300 ',
                              'group flex items-center px-2 py-2 leading-6 font-medium'
                            )}
                            aria-current={
                              item.href === currentPath ? 'page' : undefined
                            }
                          >
                            {item.title}
                          </a>
                        </Link>
                      ))
                    : NAV_ITEMS.map((item) => (
                        <Link key={item.title} href={item.href}>
                          <a
                            className={classNames(
                              item.href === currentPath
                                ? 'border-b border-indigo-600 text-white'
                                : ' hover:border-b  hover:border-gray-200 text-neutral-300 ',
                              'group flex items-center px-2 py-2 leading-6 font-medium'
                            )}
                            aria-current={
                              item.href === currentPath ? 'page' : undefined
                            }
                          >
                            {item.title}
                          </a>
                        </Link>
                      ))}
                </div>
              </div>
            </div>
          </div>
          <main className="flex-1 pb-8">
            <div className="bg-neutral-600">
              <div className="px-4 mobile:px-6 laptop:max-w-6xl lg:px-8">
                <div className="pt-6 pb-2 tablet:flex tablet:items-center tablet:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div>
                        <div className="flex items-center">
                          <h1 className="text-base laptop:text-xl font-bold leading-7 text-neutral-300 sm:leading-9 sm:truncate">
                            {props.title}
                          </h1>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {props.children}
              </div>
            </div>
          </main>
          <footer className="flex flex-row mb-4 mx-auto space-x-4">
            <Link href="https://unchain-shiftbase.notion.site/20220228-437efe5314d64e0f965efe911b062ce2">
              <a className="text-neutral-300" target="_blank">
                利用規約
              </a>
            </Link>
            <Link href="https://unchain-shiftbase.notion.site/20220303-11d1b7d0e0384aa9912b6893decd51dc">
              <a className="text-neutral-300" target="_blank">
                プライバシーポリシー
              </a>
            </Link>
          </footer>
        </div>
      </div>
    </>
  )
}

export default AppLayout
