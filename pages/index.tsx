import AppLayout from '@lib/components/Layouts/AppLayout'
import { signIn } from "next-auth/react";
import Image from 'next/image'

const Page = () => {
    return (
        <>
            <AppLayout>
                {/* <blockquote> */}
                <h1>Welcome to UNCHAIN developer's portal!</h1>

                <blockquote>
                    <p>
                        Seems like you're still not logged in. Please 
                        <button type="button" onClick={() => signIn()}> &nbsp;<a>login</a>&nbsp; </button> 
                        to continue.
                    </p>
                </blockquote>
            </AppLayout>
        </>
    )
}

export default Page
