import AppLayout from '@lib/components/Layouts/AppLayout'
import { useSession, signIn } from 'next-auth/react'
import { useQuery } from 'react-query'
import superagent from 'superagent'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import style from '@lib/styles/projectcard.module.css'

const Page = ({ projects, projDescripts, projImageURLs }) => {
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
              name === projDescripts[i][0] && name == projImageURLs[i][0] ? (
                <div
                  key={name}
                  className="rounded-md align-middle p-3 cursor-pointer border-2 border-info-400 hover:border-yellow-500"
                >
                  <Link
                    href={`/projects/${encodeURIComponent(name)}`}
                    passHref={true}
                  >
                    <div className="space-y-2">
                      {/* <h2 className="cardtitle"> {name} </h2> */}
                      <Image
                        src={projImageURLs[i][1]}
                        width={280}
                        height={200}
                      />

                      <h2>{JSON.parse(projDescripts[i][1]).title}</h2>
                      <p className="text-white">
                        {JSON.parse(projDescripts[i][1]).description}
                      </p>
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
  const projects = await fetch(
    'https://api.github.com/repos/unchain-dev/UNCHAIN-projects/contents/docs/',
    {
      headers: {
        Authorization: 'token ' + process.env.GITHUB_AUTH_TOKEN,
      },
    }
  ).then((res) => res.json())
  console.log(projects)

  // get Descriptions
  const projDescripts = (
    await Promise.all(
      projects.map(async (p, i) => {
        const descrURL = `https://raw.githubusercontent.com/unchain-dev/UNCHAIN-projects/main/public/metadata/${p.name}/description.json`

        const descr = await fetch(descrURL).then((res) => res.text())
        return [p.name, descr]
      })
    )
  ).filter(Boolean)

  // get Images
  const projImageURLs = projects
    .map((p, i) => {
      const imURL = `https://raw.githubusercontent.com/unchain-dev/UNCHAIN-projects/main/public/metadata/${p.name}/square.png`
      return [p.name, imURL]
    })
    .filter(Boolean)

  console.log(projects, projDescripts, projImageURLs)

  return {
    props: {
      projects,
      projDescripts,
      projImageURLs,
    },
  }
}
