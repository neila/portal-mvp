import Link from 'next/link'
import LessonLayout from '@lib/components/Layouts/lessonLayout'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from '@lib/components/CodeBlock'

export default function project({
    projectView,
    lessonView,
    thisLessonContent,
    previousLessonPath,
    nextLessonPath,
    airTableFlag,
}) {
    const airTable = airTableFlag ? (
        <div className="mt-4 text-white space-y-2">
            <p>*********************************************************</p>
            <p className="">
                ここまでプロジェクトを完成させ、deployすることができたら、
                <Link href="https://airtable.com/shrf1cCtTx0iQuszX">
                    <a target="_blank" rel="noreferrer">
                        {' '}
                        こちら{' '}
                    </a>
                </Link>
                のairtableのフォームを記入してください！プロジェクト完了を証明するNFTを発行します！
            </p>
        </div>
    ) : null

    return (
        <LessonLayout title={projectView}>
            <div className="text-center">
                <h1 className="text-5xl font-bold text-neutral-500 tablet:truncate">
                    {projectView}
                </h1>
                <h2 className="text-3xl font-semibold text-neutral-500 tab;et:truncate">
                    {lessonView}
                </h2>
            </div>
            <div className="mb-8">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{code: CodeBlock,}}
                    linkTarget={"_blank"}
                    transformImageUri={(uri) =>
                        uri.startsWith('http')
                            ? uri
                            : `https://raw.githubusercontent.com/shiftbase-xyz/UNCHAIN-projects/main${uri}`
                    }
                    children={thisLessonContent}
                />
                {airTable}

                <div className="mt-4 flex flex-row justify-between items-center">
                    {/* previous button */}
                    {  
                        previousLessonPath ?  
                        <Link href={`/projects/${previousLessonPath}/ `} >
                            <div className="mb-4 bg-info-100 border-2 px-4 py-2 rounded-full cursor-pointer">
                                <a className="text-neutral-600 text-base laptop:text-lg font-bold">
                                    Previous lesson
                                </a>
                            </div>
                        </Link> : 
                        <div></div> 
                    }

                    {/* back to portal */}
                    <div className="mb-4 bg-neutral-300 border-2 px-4 py-2 rounded-full cursor-pointer">
                        <Link
                            href={`/projects/${encodeURIComponent(projectView)}/ `}
                        >
                            <a className="text-neutral-600 text-base laptop:text-lg font-bold">
                                Back to project overview
                            </a>
                        </Link>
                    </div>

                    {/* next button */}
                    {  
                        nextLessonPath ?  
                        <Link href={`/projects/${nextLessonPath}/ `} >
                            <div className="mb-4 bg-success-100 border-2 px-4 py-2 rounded-full cursor-pointer">
                                <a className="text-neutral-600 text-base laptop:text-lg font-bold">
                                    Next lesson
                                </a>
                            </div>
                        </Link> : 
                        <div></div> 
                    }
                </div>
            </div>
        </LessonLayout>
    )
}

async function getProjects() {
    // call github API endpoint to get project directories
    const resProj = await fetch(
        'https://api.github.com/repos/shiftbase-xyz/UNCHAIN-projects/contents/docs',
        {
            headers: {
                Authorization: 'token ' + process.env.GITHUB_AUTH_TOKEN,
            },
        }
    )
    const items = await resProj.json()

    // filter out non-project items
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
    // call github API endpoint to get section directories
    const resSection = await fetch(
        `https://api.github.com/repos/shiftbase-xyz/UNCHAIN-projects/contents/docs/${project}/ja`,
        {
            headers: {
                Authorization: 'token ' + process.env.GITHUB_AUTH_TOKEN,
            },
        }
    )
    const folders = await resSection.json()

    // filter out non-section items
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
    // call github API endpoint to get lesson files
    const resLesson = await fetch(
        `https://api.github.com/repos/shiftbase-xyz/UNCHAIN-projects/contents/docs/${project}/ja/${section}`,
        {
            headers: {
                Authorization: 'token ' + process.env.GITHUB_AUTH_TOKEN,
            },
        }
    )
    const files = await resLesson.json()

    // filter out non-lesson items
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
    // retrieve all projects
    const allProjects = await getProjects()

    // retrieve all lessons for each project
    const lessonsFormat = await Promise.all(
        allProjects.map(async (p, i) => {
            const project = await getSections(p.name)
            const section = await Promise.all(

                // for each project section obtain lessons
                project.map(async (s) => {
                    const lessons = await getLessons(p.name, s.name)

                    const lesson = lessons.map((l) => {
                        const lessonPath = l.name
                            .match(/([^\_]*\_){2}/, '')[0]
                            .replace('_', '-')
                            .replace('_', '')
                        const pagePath = s.name + '-' + lessonPath
                        const parameters = {
                            params: { projectView: p.name, lessonView: pagePath },
                        }
                        return parameters
                    })

                    return lesson.flat()
                })
            )
            return section.flat()
        })
    )

    return { paths: lessonsFormat.flat(), fallback: false }
}

export async function getStaticProps({ params }) {
    const { projectView, lessonView } = params

    const section = lessonView.match(/([^\-]*\-){2}/, '')[0].slice(0, -1)
    const sectionCount = (await getSections(projectView)).length - 1

    const currentLessonIndex = parseInt(lessonView.slice(-1)) - 1

    const lessons = await getLessons(projectView, section)
    const lessonContents = await Promise.all(
        lessons.map(async (l, i) => {
            const md = await fetch(l.download_url).then((res) => res.text())
            const isLast = (i === lessons.length - 1 && sectionCount === parseInt(section.slice(-1)))
            return [md, isLast]
        })
    )

    const thisLessonContent = lessonContents[currentLessonIndex][0]
    const airTableFlag = lessonContents[currentLessonIndex][1]
    const nextLessonPath = (currentLessonIndex === lessons.length - 1) ? null : `${projectView}/${(lessonView.slice(0,-1)+(currentLessonIndex + 2).toString())}`
    const previousLessonPath = (currentLessonIndex === 0) ? null : `${projectView}/${(lessonView.slice(0,-1)+(currentLessonIndex).toString())}`

    return {
        props: { projectView, lessonView, thisLessonContent, previousLessonPath, nextLessonPath, airTableFlag },
    }
}
