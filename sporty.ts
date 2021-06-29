import { readWorkouts, getPathArg } from './read_workouts.ts'


async function main() {
    const workouts = await readWorkouts(getPathArg())
    console.log(JSON.stringify(workouts, null, 2))
}


main()
