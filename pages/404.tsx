import { useRouter } from 'next/router'
import Loader from '@lib/components/Loader'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export default function Custom404() {
  const { status, data: session } = useSession({
    required: false,
  })

  if (status === 'loading') {
    return <Loader />
  }

  console.log(status, session)

  const router = useRouter()

  if (!session) {
    router.push('/')
    return null
  }

  router.push('/home')

  return null
}
