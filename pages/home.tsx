import AppLayout from '@lib/components/Layouts/AppLayout'
import { useSession, signIn } from 'next-auth/react'
import { useQuery } from 'react-query'
import superagent from 'superagent'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import style from "@lib/styles/projectcard.module.css"

const Page = ({ projects, projDescripts, projImages }) => {
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
        return (
            <div className="min-h-screen bg-neutral-600 text-center py-48">
                <h1>Loading or not authenticated...</h1>
            </div>
        )
    }

    console.log(withSessionQuery)

    if (!session) {
        return (
            <>
                <AppLayout title="Home">
                    <div className="my-6 p-2">
                        <h1>Access Denied</h1>
                        <h1>
                            <button type="button" onClick={() => signIn()}>
                                <a>Login</a>&nbsp;
                            </button>
                            to see a secret message
                        </h1>
                    </div>
                </AppLayout>
            </>
        )
    }

    return (
        <>
            <AppLayout title={session.user.name ?? session.user.email}>
                <div className="text-center">
                    <h1>Projects</h1>
                    <div className="grid grid-cols-1 laptop:grid-cols-3 gap-16 my-6 p-2">
                        {projects.map(({ name, type, path, url }, i) =>
                            ((name === projDescripts[i][0]) && (name == projImages[i][0])) ? (
                                <div key={name} className="rounded-md align-middle p-3 cursor-pointer border-2 border-info-400 hover:border-yellow-500" >
                                    <Link href={`/projects/${encodeURIComponent(name)}`} passHref={true}>
                                        <div className="space-y-2">
                                            {/* <h2 className="cardtitle"> {name} </h2> */}
                                            <Image src={projImages[i][1]} width={280} height={200}/>
                                            <ReactMarkdown className={style.reactMarkDown} remarkPlugins={[remarkGfm]} transformImageUri={(uri) => uri.startsWith('http') ? uri : `https://raw.githubusercontent.com/shiftbase-xyz/UNCHAIN-projects/main${uri}`}>
                                                {projDescripts[i][1]}
                                            </ReactMarkdown>
                                        </div>
                                    </Link>
                                </div>
                            ) : null
                        )}
                    </div>
                    {/* {withSessionQuery?.data && <p>{withSessionQuery.data}</p>} */}
                </div>
            </AppLayout>
        </>
    )
}

export default Page

export const getStaticProps = async () => {
    // Get projects
    const resProj = await fetch(
        'https://api.github.com/repos/shiftbase-xyz/UNCHAIN-projects/contents/docs/',
        {
            headers: {
                Authorization: 'token ' + process.env.GITHUB_AUTH_TOKEN,
            },
        }
    )
    const items = await resProj.json()

    const projects = items
        .map((i) => {
            if (i.type !== 'dir' || i.name === 'public') {
                return null
            } else {
                return i
            }
        })
        .filter(Boolean)

    // get Descriptions
    const projDescripts = (
        await Promise.all(
            projects.map(async (p, i) => {
                const descrURL = (
                    await fetch(
                        `https://api.github.com/repos/unchain-dev/UNCHAIN-projects/contents/public/texts/${p.name}/description.md`,
                        {
                            headers: {
                                Authorization:
                                    'token ' + process.env.GITHUB_AUTH_TOKEN,
                            },
                        }
                    ).then((res) => res.json())
                ).download_url

                const descr = await fetch(descrURL).then((res) => res.text())
                return [p.name, descr]
            })
        )
    ).filter(Boolean)

    // get Images
    const projImages = (await Promise.all(projects.map(async(p, i) => {
        const imURL = (await fetch (`https://api.github.com/repos/unchain-dev/UNCHAIN-projects/contents/public/squares/${p.name}/square.png`,
        {
            headers: { "Authorization": "token " + process.env.GITHUB_AUTH_TOKEN }
        }).then(res => res.json())).download_url

        return ([p.name, imURL])
    }))).filter(Boolean)

    return {
        props: {
            projects,
            projDescripts,
            projImages,
        },
    }
}
