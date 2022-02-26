import AppLayout from '@lib/components/Layouts/AppLayout'
import { useSession } from 'next-auth/react'
import { useQuery } from 'react-query'
import superagent from 'superagent'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const Page = () => {
    const { status, data: session } = useSession({
        required: true,
    })

    const withSessionQuery = useQuery(
        ['with-session-example', session],
        async () => {
            console.log(session)
            const data = await superagent.get('/api/with-session-example')

            return data.body.content
        },
        {
            // The query will not execute until the session exists
            enabled: !!session,
        }
    )

    if (status === 'loading') {
        return 'Loading or not authenticated...'
    }

    console.log(withSessionQuery)

    const router = useRouter()
    if(!session){
        router.push('/')
        return null
    }

    router.push('/home')

    return (
        <>
            <AppLayout title="Server Redirect">
                <div>
                    <h1>
                        Hello, {session.user.name ?? session.user.email} This is
                        a protected route. You can see it because you&apos;re logged
                        in.
                    </h1>
                </div>
                <blockquote>
                    <p>This page is protected using Page.auth = true</p>
                    <p>Either way works.</p>
                    <p>
                        But in this case the session is available on the first
                        render.
                    </p>
                </blockquote>
            </AppLayout>
        </>
    )
}

Page.auth = {
    redirectTo: '/home',
}

export default Page
