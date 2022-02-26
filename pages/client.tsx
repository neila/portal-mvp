import AppLayout from '@lib/components/Layouts/AppLayout'
import { useSession } from 'next-auth/react'
import Loader from '@lib/components/Loader'
import { useRouter } from 'next/router'

const Page = () => {
    const router = useRouter()
    const { status, data: session } = useSession({
        required: false,
    })

    if (status === 'loading') {
        return <Loader />
    }

    if (session) {
        router.push(`/home`)
        return null
    }

    router.push(`/`)

    return (
        <>
            <AppLayout title="Client">
                <div className="my-6 p-2">
                    <p>This page uses the useSession() React Hook.</p>

                    <p>
                        The useSession() React Hook is easy to use and allows
                        pages to render very quickly.
                    </p>

                    <p>
                        The advantage of this approach is that session state is
                        shared between pages by using the Provider in _app.js so
                        that navigation between pages using useSession() is very
                        fast.
                    </p>

                    <p>
                        The disadvantage of useSession() is that it requires
                        client side JavaScript.
                    </p>
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
