import {
  Activity,
  Flame,
  Scale,
  TrendingUp,
  Utensils,
  Zap,
} from "lucide-react"
import { getMotivationalMessage } from "../assets/assets"
import { useAppContext } from "../context/AppContext"
import Card from "../components/ui/Card"
import ProgressBar from "../components/ui/ProgressBar"

// Returns a local calendar date key for a date value or log timestamp.
const getDateKey = (value: string | Date | undefined): string => {
  if (typeof value === "string") {
    const datePrefix = value.slice(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePrefix)) return datePrefix
  }

  const date = value instanceof Date ? value : new Date(value ?? "")
  if (Number.isNaN(date.getTime())) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Defines the activity values shown for each day in the weekly chart.
type WeeklyDay = {
  label: string
  dateKey: string
  intake: number
  burn: number
}

// Renders the user's daily nutrition and activity overview.
const Dashboard = () => {
  const { user, allActivityLogs, allFoodLogs } = useAppContext()
  const today = new Date()
  const todayKey = getDateKey(today)
  const calorieLimit = user?.dailyCalorieIntake || 2200
  const calorieBurnGoal = user?.dailyCalorieBurn || 400
  const todayFood = allFoodLogs.filter((item) => getDateKey(item.createdAt ?? item.date) === todayKey)
  const todayActivities = allActivityLogs.filter((item) => getDateKey(item.createdAt ?? item.date) === todayKey)
  const totalCalories = todayFood.reduce((sum, item) => sum + item.calories, 0)
  const totalBurned = todayActivities.reduce((sum, item) => sum + item.calories, 0)
  const totalActiveMinutes = todayActivities.reduce((sum, item) => sum + item.duration, 0)
  const remainingCalories = Math.max(calorieLimit - totalCalories, 0)
  const motivation = getMotivationalMessage(totalCalories, totalActiveMinutes, calorieLimit)
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weeklyDays: WeeklyDay[] = []
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  for (let index = 0; index < weekdayLabels.length; index += 1) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    weeklyDays.push({
      label: weekdayLabels[index],
      dateKey: getDateKey(date),
      intake: 0,
      burn: 0,
    })
  }

  const daysByDate = new Map(weeklyDays.map((day) => [day.dateKey, day]))
  for (const entry of allFoodLogs) {
    const day = daysByDate.get(getDateKey(entry.createdAt ?? entry.date))
    if (day) day.intake += entry.calories
  }
  for (const entry of allActivityLogs) {
    const day = daysByDate.get(getDateKey(entry.createdAt ?? entry.date))
    if (day) day.burn += entry.calories
  }

  const chartMaximum = Math.max(
    800,
    Math.ceil(Math.max(...weeklyDays.flatMap((day) => [day.intake, day.burn])) / 200) * 200
  )
  const bodyMassIndex = user?.weight && user?.height
    ? user.weight / ((user.height / 100) ** 2)
    : null
  const goalLabel = user?.goal === "lose"
    ? "Lose Weight"
    : user?.goal === "gain"
      ? "Gain Weight"
      : "Maintain Weight"

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div className="mx-auto max-w-4xl">
          <p className="text-emerald-100 text-sm font-medium">Welcome back</p>
          <h1 className="mt-1 text-2xl font-bold">
            Hi there! <span aria-hidden="true">👋</span> {user?.username || "there"}
          </h1>
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-white/20 p-4 backdrop-blur-sm">
            <span className="text-3xl" aria-hidden="true">{motivation.emoji}</span>
            <p className="font-medium">{motivation.text}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <Card className="lg:col-span-2">
          <div className="space-y-5">
            <div>
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-orange-100 p-3 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300">
                    <Utensils size={21} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Calories Consumed</p>
                    <p className="text-2xl font-bold">{totalCalories}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Limit</p>
                  <p className="text-2xl font-bold">{calorieLimit}</p>
                </div>
              </div>
              <ProgressBar value={totalCalories} max={calorieLimit} />
              <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                <span className="rounded-md bg-emerald-50 px-3 py-2 font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  {remainingCalories} kcal remaining
                </span>
                <span className="text-slate-400">
                  {calorieLimit ? Math.round((totalCalories / calorieLimit) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-orange-100 p-3 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300">
                    <Flame size={21} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Calories Burned</p>
                    <p className="text-2xl font-bold">{totalBurned}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Goal</p>
                  <p className="text-2xl font-bold">{calorieBurnGoal}</p>
                </div>
              </div>
              <ProgressBar value={totalBurned} max={calorieBurnGoal} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-sky-100 p-2.5 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
              <Activity size={21} aria-hidden="true" />
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
          </div>
          <p className="mt-3 text-2xl font-bold">{totalActiveMinutes}</p>
          <p className="text-sm text-slate-400">minutes today</p>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-violet-100 p-2.5 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
              <Zap size={21} aria-hidden="true" />
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-400">Workouts</p>
          </div>
          <p className="mt-3 text-2xl font-bold">{todayActivities.length}</p>
          <p className="text-sm text-slate-400">activities logged</p>
        </Card>

        <Card className="min-h-40 bg-slate-800 text-white dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-white/10 p-2.5 text-emerald-400">
              <TrendingUp size={21} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-slate-300">Your Goal</p>
              <p className="mt-1 font-semibold">{goalLabel}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
              <Scale size={21} aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">Body Metrics</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your stats</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Weight</span>
              <span className="font-medium">{user?.weight ? `${user.weight} kg` : "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Height</span>
              <span className="font-medium">{user?.height ? `${user.height} cm` : "Not set"}</span>
            </div>
            {bodyMassIndex !== null && (
              <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="mb-2 flex justify-between">
                  <span>BMI</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {bodyMassIndex.toFixed(1)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-linear-to-r from-sky-300 via-emerald-300 via-50% to-rose-300" />
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>18.5</span><span>25</span><span>30</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold">Today’s Summary</h2>
          <div className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <div className="flex justify-between py-3 text-slate-500 dark:text-slate-400">
              <span>Meals logged</span><span className="font-medium text-slate-700 dark:text-slate-200">{todayFood.length}</span>
            </div>
            <div className="flex justify-between py-3 text-slate-500 dark:text-slate-400">
              <span>Total calories</span><span className="font-medium text-slate-700 dark:text-slate-200">{totalCalories} kcal</span>
            </div>
            <div className="flex justify-between py-3 text-slate-500 dark:text-slate-400">
              <span>Active time</span><span className="font-medium text-slate-700 dark:text-slate-200">{totalActiveMinutes} min</span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-semibold">This Week’s Progress</h2>
          <div className="mt-5 grid grid-cols-[2rem_1fr] gap-3">
            <div className="flex h-52 flex-col justify-between pb-6 text-right text-xs text-slate-400">
              {[3, 2, 1, 0].map((step) => (
                <span key={step}>{Math.round((chartMaximum * step) / 3)}</span>
              ))}
            </div>
            <div className="relative h-52">
              <div className="absolute inset-0 flex flex-col justify-between pb-6">
                {[0, 1, 2, 3].map((line) => (
                  <div key={line} className="border-t border-dashed border-slate-200 dark:border-slate-700" />
                ))}
              </div>
              <div className="relative flex h-full items-end justify-around pb-6">
                {/* Render each day as a paired burn and intake bar. */}
                {weeklyDays.map((day) => (
                  <div key={day.dateKey} className="flex h-full min-w-8 flex-1 flex-col items-center justify-end">
                    <div className="flex h-[calc(100%-1.5rem)] items-end gap-1">
                      <div
                        className="w-3 rounded-t bg-orange-500 sm:w-3.5"
                        style={{ height: `${(day.burn / chartMaximum) * 100}%` }}
                        title={`${day.burn} kcal burned`}
                      />
                      <div
                        className="w-3 rounded-t bg-emerald-500 sm:w-3.5"
                        style={{ height: `${(day.intake / chartMaximum) * 100}%` }}
                        title={`${day.intake} kcal consumed`}
                      />
                    </div>
                    <span className={`mt-2 text-xs ${day.dateKey === todayKey ? "font-semibold text-emerald-600" : "text-slate-500 dark:text-slate-400"}`}>
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-1 flex justify-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-orange-500"><span className="size-2.5 rounded-full bg-orange-500" />Burn</span>
            <span className="flex items-center gap-1.5 text-emerald-500"><span className="size-2.5 rounded-full bg-emerald-500" />Intake</span>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard