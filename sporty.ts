import { readWorkouts, getPathArg } from './read_workouts.ts'
import { XMLObject } from './read_workouts.ts'


function isPoolSwimmingWorkout(w: XMLObject): boolean {
    const meta = w.MetadataEntry as XMLObject[]
    return w.workoutActivityType == 'HKWorkoutActivityTypeSwimming'
        && meta.some(m => m.key == 'HKSwimmingLocationType' && m.value == '1')
}

async function main() {
    const workouts = await readWorkouts(getPathArg())
    //console.log(JSON.stringify(workouts, null, 2))
    const poolWorkouts = workouts
        .filter(isPoolSwimmingWorkout)
    console.log(poolWorkouts.length)
}


main()
