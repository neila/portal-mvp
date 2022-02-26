import AppLayout from '@lib/components/Layouts/AppLayout'
import { signIn } from "next-auth/react"
import { useSession } from 'next-auth/react'
import Loader from '@lib/components/Loader'
import Router from 'next/router'
import Image from 'next/image'

const Page = () => {
    const { status, data: session } = useSession({
        required: false,
    })

    if (status === 'loading') {
        return <Loader />
    }

    if(session){
        Router.push('/home')
        return null
    }

    return (
        <>
            <AppLayout title="Auth">
                <h1>Welcome to UNCHAIN developer&apos;s portal!</h1>

                <div className="my-6 p-2">
                    <p>
                        Seems like you&apos;re still not logged in. Please 
                        <button type="button" onClick={() => signIn()}> &nbsp;<a>login</a>&nbsp; </button> 
                        to continue.
                    </p>
                </div>
            </AppLayout>
        </>
    )
}

export default Page
