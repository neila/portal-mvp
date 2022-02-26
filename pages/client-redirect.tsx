import AppLayout from '@lib/components/Layouts/AppLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import superagent from 'superagent'

const Page = () => {
    const router = useRouter()
    const { status, data: session } = useSession({
        required: true,
        onUnauthenticated() {
            router.push('/', '/', {})
        },
    })

    if (status === 'loading') {
        return 'Loading or not authenticated...'
    }

    if (session) {
        router.push(`/home`)
        return null
    }
    
    router.push(`/`)
    return (
        <>
            <AppLayout title="Client Redirect">
                <div>
                    <h1>
                        Hello, {session.user.name ?? session.user.email} This is
                        a protected route. You can see it because you&apos;re logged
                        in.
                    </h1>
                </div>
                <div className="my-6 p-2">
                    Client Side Rendering This page uses the useSession() React
                    Hook. The useSession() React Hook is easy to use and allows
                    pages to render very quickly. The advantage of this approach
                    is that session state is shared between pages by using the
                    Provider in _app.js so that navigation between pages using
                    useSession() is very fast. The disadvantage of useSession()
                    is that it requires client side JavaScript.
                </div>
                <div className="my-6 p-2">
                    <p>This page is protected using the useSession hook.</p>
                    <p>Either way works.</p>
                    <p>
                        But in this case the session is <strong>not</strong>{' '}
                        available on the first render.
                    </p>
                </div>
            </AppLayout>
        </>
    )
}

export default Page
