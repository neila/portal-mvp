import Link from 'next/link'
import AppLayout from '@lib/components/Layouts/AppLayout'

export default function project({ projname, sections, lessons }) {
  return (
    <AppLayout title={projname}>
      {sections.map((s, i) => {
        return s.type !== 'dir' || s.name === 'public' ? (
          <></>
        ) : (
          <div className="">
            <h2 key={s.name}>
              <span className="text-2xl lg:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">
                {s.name}
              </span>
            </h2>
            <div className="">
              {/* <h3>{`/projects/${encodeURIComponent(path)}`}</h3> */}
              {/* <h3 className='truncate text-base lg:text-lg'>{s.url}</h3> */}

              {lessons[i].map((l) => {
                const displayName = l.name
                  .replace('.md', '')
                  .replace('_', ' ')
                  .replace('_', ' - ')

                const lessonPath = l.name
                  .match(/([^\_]*\_){2}/, '')[0]
                  .replace('_', '-')
                  .replace('_', '')
                const pagePath = s.name + '-' + lessonPath

                return (
                  <div key={l.name} className="my-2">
                    <Link
                      href={`/projects/${encodeURIComponent(
                        projname
                      )}/${encodeURIComponent(pagePath)}`}
                    >
                      <a className="cursor-pointer text-neutral-200 hover:text-info-300 hover:no-underline">
                        {displayName}
                      </a>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </AppLayout>
  )
}

async function getProjects() {
  // call github API endpoint to get projects
  const resProj = await fetch(
    'https://api.github.com/repos/unchain-dev/UNCHAIN-projects/contents/docs/',
    {
      headers: {
        Authorization: 'token ' + process.env.GITHUB_AUTH_TOKEN,
      },
    }
  )
  const items = await resProj.json()

  // get the paths we want to pre-render based on projects
  const projects = items
    .map((i) => {
      if (i.type !== 'dir' || i.name === 'public') {
        return null
      } else {
        return i
      }
    })
    .filter(Boolean)

  return projects
}

async function getSections(project) {
  // call github API endpoint to get projects
  const resSection = await fetch(
    `https://api.github.com/repos/unchain-dev/UNCHAIN-projects/contents/docs/${project}/ja`,
    {
      headers: {
        Authorization: 'token ' + process.env.GITHUB_AUTH_TOKEN,
      },
    }
  )
  const folders = await resSection.json()

  const sections = folders
    .map((p) => {
      if (p.type !== 'dir' || p.name === 'public') {
        return null
      } else {
        return p
      }
    })
    .filter(Boolean)

  return sections
}

async function getLessons(project, section) {
  // call github API endpoint to get projects
  const resLesson = await fetch(
    `https://api.github.com/repos/unchain-dev/UNCHAIN-projects/contents/docs/${project}/ja/${section}`,
    {
      headers: {
        Authorization: 'token ' + process.env.GITHUB_AUTH_TOKEN,
      },
    }
  )
  const files = await resLesson.json()

  const lessons = files
    .map((f) => {
      if (f.type !== 'file') {
        return null
      } else {
        return f
      }
    })
    .filter(Boolean)

  return lessons
}

export async function getStaticPaths() {
  const allProjects = await getProjects()

  const projectsformat = allProjects.map((p) => {
    return { params: { projectView: p.name } }
  })

  return { paths: projectsformat, fallback: false }
}

export async function getStaticProps(context) {
  const { params } = context
  const projname = params.projectView
  const sections = await getSections(projname)

  const lessons = await Promise.all(
    sections.map(async (s) => {
      const lessonJson = await getLessons(projname, s.name)
      return lessonJson
    })
  )

  return {
    props: { projname, sections, lessons },
  }
}
