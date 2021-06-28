import { existsSync } from 'https://deno.land/std@0.99.0/fs/mod.ts'
import { SAXParser, ElementInfo, AttributeInfo } from 'https://deno.land/x/xmlp@v0.2.8/mod.ts'

// See https://decipher.dev/deno-by-example/advanced-readline/
import { readLine } from 'https://raw.githubusercontent.com/deepakshrma/deno-by-example/master/examples/file_reader.ts'


type LineCallback = (line: string) => Promise<unknown>

async function filterXML(xmlPath: string, lineCB: LineCallback) {
    console.log('Reading from ' + xmlPath + '...')
    const reader = await readLine(xmlPath)
    let inWorkout = false
    for await (const line of reader) {
        if (line.trimLeft().startsWith('<Workout ')) inWorkout = true
        if (inWorkout) {
            await lineCB(line)
            if (line.trimLeft().startsWith('</Workout>')) inWorkout = false
        }
    }
}

type XMLObject = { [key: string]: string | XMLObject[] }

function attrs2obj(attrs: AttributeInfo[]): XMLObject {
    const obj: XMLObject = {}
    for (const attr of attrs) {
        obj[attr.qName] = attr.value
    }
    return obj
}

async function parseXML(xmlPath: string) {
    const parser = new SAXParser()
    let inWorkout = false
    let workout: XMLObject
    const workouts: XMLObject[] = []
    parser
        .on('start_element', (e: ElementInfo) => {
            if (inWorkout) {
                if (!workout[e.qName]) {
                    workout[e.qName] = [] as XMLObject[]
                }
                (workout[e.qName] as XMLObject[]).push(attrs2obj(e.attributes))
            }
            else {
                if (e.qName != 'Workout') return
                inWorkout = true
                workout = attrs2obj(e.attributes)
            }
        })
        .on('end_element', (e: ElementInfo) => {
            if (e.qName != 'Workout') return
            inWorkout = false
            workouts.push(workout)
        })
    const reader = await Deno.open(xmlPath)
    await parser.parse(reader)
    await reader.close()
    return workouts
}


async function main() {
    if (Deno.args.length < 1) {
        console.error('Error: missing argument - export.xml path')
        Deno.exit()
    }
    const path = Deno.args[0]
    if (!existsSync(path)) {
        console.error(`Error: path "${path}" not found`)
        Deno.exit();
    }
    const tmpFile = Deno.makeTempFileSync()
    const encoder = new TextEncoder()
    const file = await Deno.open(tmpFile, { write: true })
    await Deno.write(file.rid, encoder.encode('<Workouts>\n'))
    await filterXML(
        path,
        l => Deno.write(file.rid, encoder.encode(l + '\n'))
    )
    await Deno.write(file.rid, encoder.encode('</Workouts>\n'))
    await Deno.close(file.rid)
    const workouts = await parseXML(tmpFile)
    Deno.remove(tmpFile)
    console.log(JSON.stringify(workouts, null, 2))
}


main()
