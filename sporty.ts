import { readWorkouts, getPathArg } from './read_workouts.ts'
import { XMLObject } from './read_workouts.ts'


function isSwimmingpoolWorkout(w: XMLObject): boolean {
    const meta = w.MetadataEntry as XMLObject[]
    return w.workoutActivityType == 'HKWorkoutActivityTypeSwimming'
        && meta.some(m => m.key == 'HKSwimmingLocationType' && m.value == '1')
}

type WorkoutSummary = Record<string, string | number>

function makePoolWorkout(w: XMLObject): WorkoutSummary {
    const events = w.WorkoutEvent as XMLObject[]
    const laps = events
        .filter(e => e.type == 'HKWorkoutEventTypeLap')
        .length
    return {
        duration: (+w.duration) * 60,
        distance: +w.totalDistance,
        kcal: +w.totalEnergyBurned,
        startDate: w.startDate as string,
        endDate: w.endDate as string,
        laps
    }
}

function json2csv(workouts: WorkoutSummary[]): string {
    return workouts
        .map(w => Object.values(w).join(','))
        .join('\n')
}
    

async function main() {
    const workouts = await readWorkouts(getPathArg())
    //console.log(JSON.stringify(workouts, null, 2))
    const poolWorkouts = workouts
        .filter(isSwimmingpoolWorkout)
        .map(makePoolWorkout)
    //console.log(JSON.stringify(poolWorkouts, null, 2))
    console.log(json2csv(poolWorkouts))
}


main()
