import Link from "next/link";
import LessonLayout from "@lib/components/Layouts/lessonLayout";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function project({ projectView, lessonView, thisLessonContent, airTableFlag }){
    const airTable = airTableFlag ? (
    <div className="mt-4 text-white space-y-2">
        <p>*********************************************************</p>
        <p className="">ここまでプロジェクトを完成させ、deployすることができたら、
        <Link href="https://airtable.com/shrf1cCtTx0iQuszX"><a target="_blank"> こちら </a></Link>
        のairtableのフォームを記入してください！プロジェクト完了を証明するNFTを発行します！</p>
    </div>
    ) : null
    
    return (
        <LessonLayout title={projectView}>
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-5xl font-bold leading-7 text-neutral-400 sm:leading-9 sm:truncate">
                    {projectView}
                </h1>
                <h2 className="text-3xl font-semibold leading-7 text-neutral-400 sm:leading-9 sm:truncate">
                    {lessonView}
                </h2>
            </div>
            <div className="mb-24">
                <ReactMarkdown remarkPlugins={[remarkGfm]} 
                transformImageUri={uri => uri.startsWith('http') ? uri: `https://raw.githubusercontent.com/shiftbase-xyz/UNCHAIN-projects/main${uri}`} >{thisLessonContent}</ReactMarkdown>
                {airTable}
            </div>
        </LessonLayout>
    )
}

async function getProjects() {
    
    // call github API endpoint to get projects
    const resProj  = await fetch("https://api.github.com/repos/shiftbase-xyz/UNCHAIN-projects/contents",
    {
        headers: { "Authorization": "token " + process.env.GITHUB_AUTH_TOKEN }
    })
    const items = await resProj.json()

    // get the paths we want to pre-render based on projects
    const projects = items.map((i) => {
        if (i.type !== "dir" || i.name === "public") { 
            return null
        } else { 
            return (i)
        }
    }).filter(Boolean)


    return projects
}

async function getSections(project) {
    
    // call github API endpoint to get projects
    const resSection  = await fetch(`https://api.github.com/repos/shiftbase-xyz/UNCHAIN-projects/contents${project}/ja`,
    {
        headers: { "Authorization": "token " + process.env.GITHUB_AUTH_TOKEN }
    })
    const folders = await resSection.json()

    const sections = folders.map((p) => {
        if (p.type !== "dir" || p.name === "public") { 
            return null
        } else { 
            return (p)
        }
    }).filter(Boolean)

    return sections
}

async function getLessons(project, section) {
    
    // call github API endpoint to get projects
    const resLesson  = await fetch(`https://api.github.com/repos/shiftbase-xyz/UNCHAIN-projects/contents${project}/ja/${section}`,
    {
        headers: { "Authorization": "token " + process.env.GITHUB_AUTH_TOKEN }
    })
    const files = await resLesson.json()

    const lessons = files.map((f) => {
        if (f.type !== "file") { 
            return null
        } else { 
            return (f)
        }
    }).filter(Boolean)

    return lessons
}

export async function getStaticPaths() {
    
    const allProjects = await getProjects()

    const lessonsFormat = await Promise.all(allProjects.map(async(p) => {
        const project = await getSections(p.name)

        const section = await Promise.all(project.map(async(s) => {
            const lessons = await getLessons(p.name, s.name)
            const lesson = lessons.map((l) => {
                const lessonPath = l.name.match(/([^\_]*\_){2}/, '')[0].replace("_", "-").replace("_", "")
                const pagePath = s.name+"-"+lessonPath
                const parameters = { params: {projectView: p.name, lessonView:pagePath} }
                return (parameters)
            })
            return lesson.flat()
        }))
        return section.flat()
    }))

    return { paths: lessonsFormat.flat(), fallback: false }
}


export async function getStaticProps({ params }) {
    const { projectView, lessonView } = params;
    
    const section = lessonView.match(/([^\-]*\-){2}/, '')[0].slice(0, -1)
    const sectionCount = (await getSections(projectView)).length - 1

    const lessons = await getLessons(projectView, section)
    const lessonCount = lessons.length - 1

    const lessonContents = await Promise.all(
        lessons.map(async(l, i) => {
            const md = await fetch(l.download_url).then(res => res.text())
            const last = (i === lessons.length - 1 && sectionCount === parseInt(section.slice(-1)))
            return [md, last]
        })
    )

    const thisLessonContent = lessonContents[parseInt(lessonView.slice(-1))-1][0]
    const airTableFlag = lessonContents[parseInt(lessonView.slice(-1))-1][1]

    return {
        props: { projectView, lessonView, thisLessonContent, airTableFlag }
    };
}