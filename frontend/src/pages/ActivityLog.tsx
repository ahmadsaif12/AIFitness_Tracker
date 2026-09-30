import { useState } from "react"
import { ActivityIcon, PlusIcon, TimerIcon, Trash2Icon, XIcon } from "lucide-react"
import toast from "react-hot-toast"
import { useAppContext } from "../context/AppContext"
import mockApi from "../assets/mockApi"
import { quickActivities } from "../assets/assets"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import type { ActivityEntry } from "../types"

// Holds the values entered in the add-activity dialog.
type ActivityForm = {
  name: string
  duration: number | ""
  calories: number | ""
  rate: number | null // kcal per minute for quick activities, null for custom ones
}

const emptyForm: ActivityForm = { name: "", duration: "", calories: "", rate: null }

// Returns today's date as YYYY-MM-DD, matching how entries are stored.
const getTodayKey = () => new Date().toISOString().split("T")[0]

// Formats an entry's creation time as a short clock time like 03:58 PM.
const formatTime = (value?: string) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// Renders a modal shell used by the add-activity dialog.
const Modal = ({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-label={title}
  >
    <div
      className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <XIcon className="size-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
)

// Renders the activity log page with quick add, custom entry and today's list.
const ActivityLog = () => {
  const { allActivityLogs, setAllActivityLogs } = useAppContext()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ActivityForm>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)

  const todayKey = getTodayKey()
  const todayActivities = allActivityLogs.filter((item) => item.date === todayKey)
  const totalMinutes = todayActivities.reduce((sum, item) => sum + item.duration, 0)

  // Calories are auto-calculated for quick activities and typed in for custom ones.
  const previewCalories =
    form.rate !== null ? Math.round(Number(form.duration || 0) * form.rate) : Number(form.calories || 0)

  // Opens the dialog, prefilled when a quick activity is chosen.
  const openForm = (activity?: { name: string; rate: number }) => {
    setForm(activity ? { ...emptyForm, name: activity.name, rate: activity.rate } : emptyForm)
    setShowForm(true)
  }

  // Closes the dialog and clears the form.
  const closeForm = () => {
    setShowForm(false)
    setForm(emptyForm)
  }

  // Validates the form, saves the activity and updates shared state.
  const handleAdd = async () => {
    const duration = Number(form.duration)
    if (!form.name.trim() || !duration || duration <= 0 || previewCalories <= 0) {
      toast.error("Enter a name, duration and calories.")
      return
    }

    try {
      setIsSaving(true)
      const { data } = await mockApi.activityLogs.create({
        data: { name: form.name.trim(), duration, calories: previewCalories },
      })
      setAllActivityLogs((current) => [...current, data])
      toast.success("Activity added")
      closeForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add activity.")
    } finally {
      setIsSaving(false)
    }
  }

  // Deletes an activity from storage and shared state.
  const handleDelete = async (entry: ActivityEntry) => {
    try {
      await mockApi.activityLogs.delete(entry.documentId)
      setAllActivityLogs((current) => current.filter((item) => item.documentId !== entry.documentId))
      toast.success("Activity removed")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove activity.")
    }
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Activity Log</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track your workouts</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Active Today</p>
            <p className="text-2xl font-bold text-sky-500">{totalMinutes} min</p>
          </div>
        </div>
      </header>

      <div className="page-content-grid items-start">
        {/* Left column: quick add and custom activity */}
        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-white">Quick Add</h2>
            <div className="flex flex-wrap gap-2">
              {quickActivities.map((activity) => (
                <button
                  key={activity.name}
                  type="button"
                  onClick={() => openForm(activity)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span aria-hidden="true" className="text-xs">{activity.emoji}</span>
                  {activity.name}
                </button>
              ))}
            </div>
          </Card>

          <Button className="w-full" onClick={() => openForm()}>
            <PlusIcon className="size-4" />
            Add Custom Activity
          </Button>
        </div>

        {/* Right column: today's activities */}
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
              <ActivityIcon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white">Today&apos;s Activities</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{todayActivities.length} logged</p>
            </div>
          </div>

          {todayActivities.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No activities yet. Pick a quick add or log a custom one.
            </p>
          ) : (
            <div className="space-y-2">
              {todayActivities.map((entry) => (
                <div key={entry.documentId} className="activity-entry-item">
                  <div className="flex items-center gap-3">
                    <TimerIcon className="size-5 text-sky-500" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{entry.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatTime(entry.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{entry.duration} min</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{entry.calories} kcal</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete(entry)}
                      aria-label={`Delete ${entry.name}`}
                      className="cursor-pointer text-red-400 transition-colors hover:text-red-500"
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Total Active Time</span>
            <span className="font-semibold text-sky-500">{totalMinutes} minutes</span>
          </div>
        </Card>
      </div>

      {showForm && (
        <Modal title={form.rate !== null ? `Log ${form.name}` : "Add Custom Activity"} onClose={closeForm}>
          <div className="space-y-4">
            {form.rate === null && (
              <Input
                label="Activity name"
                value={form.name}
                onChange={(value) => setForm((f) => ({ ...f, name: String(value) }))}
                placeholder="e.g. Basketball"
                required
              />
            )}
            <Input
              label="Duration (minutes)"
              type="number"
              min={1}
              value={form.duration}
              onChange={(value) =>
                setForm((f) => ({
                  ...f,
                  duration: typeof value === "number" && !Number.isNaN(value) ? value : "",
                }))
              }
              placeholder="e.g. 30"
              required
            />
            {form.rate === null ? (
              <Input
                label="Calories burned (kcal)"
                type="number"
                min={1}
                value={form.calories}
                onChange={(value) =>
                  setForm((f) => ({
                    ...f,
                    calories: typeof value === "number" && !Number.isNaN(value) ? value : "",
                  }))
                }
                placeholder="e.g. 200"
                required
              />
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Estimated burn: <span className="font-semibold text-emerald-500">{previewCalories} kcal</span>
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={closeForm}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => void handleAdd()} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save activity"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default ActivityLog