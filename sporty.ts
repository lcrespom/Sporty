import { existsSync } from 'https://deno.land/std@0.99.0/fs/mod.ts'

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
    await filterXML(
        path,
        l => Deno.write(file.rid, encoder.encode(l + '\n'))
    )
    Deno.close(file.rid);
    console.log('Check file ' + tmpFile)
}


main()
