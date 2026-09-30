import { useState } from "react"
import { CalendarIcon, LogOutIcon, RulerIcon, ScaleIcon, TargetIcon, UserIcon } from "lucide-react"
import toast from "react-hot-toast"
import { useAppContext } from "../context/AppContext"
import mockApi from "../assets/mockApi"
import { goalLabels, goalOptions } from "../assets/assets"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Select from "../components/ui/Select"

type Goal = "lose" | "maintain" | "gain"

// Holds the editable profile values while the user is in edit mode.
type ProfileForm = {
  age: number | ""
  weight: number | ""
  height: number | ""
  goal: Goal
}

// Formats an ISO date string as dd/mm/yyyy, or returns an empty string if invalid.
const formatMemberSince = (value?: string) => {
  if (!value) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-GB")
}

// Converts a number input value into a number, or an empty string when cleared.
const toFieldValue = (value: string | number) =>
  typeof value === "number" && !Number.isNaN(value) ? value : ""

// Renders the profile page with user details, stats and logout.
const Profile = () => {
  const { user, setUser, logout, allFoodLogs, allActivityLogs } = useAppContext()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<ProfileForm>({
    age: user?.age ?? "",
    weight: user?.weight ?? "",
    height: user?.height ?? "",
    goal: user?.goal ?? "maintain",
  })

  const totalActiveMinutes = allActivityLogs.reduce((sum, item) => sum + item.duration, 0)
  const memberSince = formatMemberSince(user?.createdAt)

  // Enters edit mode with the form reset to the saved profile values.
  const startEditing = () => {
    setForm({
      age: user?.age ?? "",
      weight: user?.weight ?? "",
      height: user?.height ?? "",
      goal: user?.goal ?? "maintain",
    })
    setIsEditing(true)
  }

  // Leaves edit mode without saving changes.
  const cancelEditing = () => setIsEditing(false)

  // Validates the form, saves it through the API and updates the user in context.
  const handleSave = async () => {
    if (!user) return

    const age = Number(form.age)
    const weight = Number(form.weight)
    const height = Number(form.height)

    if (!age || age < 13 || age > 100) {
      toast.error("Enter an age between 13 and 100.")
      return
    }
    if (!weight || weight < 20 || weight > 300) {
      toast.error("Enter a weight between 20 and 300 kg.")
      return
    }
    if (form.height !== "" && (height < 100 || height > 250)) {
      toast.error("Enter a height between 100 and 250 cm.")
      return
    }

    try {
      setIsSaving(true)
      const updates = { age, weight, height: form.height === "" ? null : height, goal: form.goal }
      await mockApi.user.update(user.id, updates)
      setUser({ ...user, age, weight, height: updates.height ?? undefined, goal: form.goal })
      toast.success("Profile updated")
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your profile.")
    } finally {
      setIsSaving(false)
    }
  }

  const infoRows = [
    {
      label: "Age",
      value: user?.age ? `${user.age} years` : "Not set",
      icon: CalendarIcon,
      color: "bg-blue-500/10 text-blue-400",
    },
    {
      label: "Weight",
      value: user?.weight ? `${user.weight} kg` : "Not set",
      icon: ScaleIcon,
      color: "bg-violet-500/10 text-violet-400",
    },
    {
      label: "Height",
      value: user?.height ? `${user.height} cm` : "Not set",
      icon: RulerIcon,
      color: "bg-emerald-500/10 text-emerald-400",
    },
    {
      label: "Goal",
      value: user?.goal ? goalLabels[user.goal] : "Not set",
      icon: TargetIcon,
      color: "bg-orange-500/10 text-orange-400",
    },
  ]

  const stats = [
    { label: "Food entries", value: allFoodLogs.length, style: "bg-emerald-500/10 text-emerald-500" },
    { label: "Activities", value: allActivityLogs.length, style: "bg-blue-500/10 text-blue-500" },
    { label: "Active min", value: totalActiveMinutes, style: "bg-violet-500/10 text-violet-500" },
  ]

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profile</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your settings</p>
      </header>

      <div className="profile-content items-start">
        {/* Left column: profile details and editing */}
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 text-white">
              <UserIcon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-white">Your Profile</h2>
              {memberSince && (
                <p className="text-xs text-slate-500 dark:text-slate-400">Member since {memberSince}</p>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Age"
                type="number"
                min={13}
                max={100}
                value={form.age}
                onChange={(value) => setForm((f) => ({ ...f, age: toFieldValue(value) }))}
                required
              />
              <Input
                label="Weight (kg)"
                type="number"
                min={20}
                max={300}
                value={form.weight}
                onChange={(value) => setForm((f) => ({ ...f, weight: toFieldValue(value) }))}
                required
              />
              <Input
                label="Height (cm)"
                type="number"
                min={100}
                max={250}
                value={form.height}
                onChange={(value) => setForm((f) => ({ ...f, height: toFieldValue(value) }))}
              />
              <Select
                label="Goal"
                value={form.goal}
                onChange={(value) => setForm((f) => ({ ...f, goal: value as Goal }))}
                options={goalOptions}
                required
              />
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={cancelEditing}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => void handleSave()} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {infoRows.map((row) => (
                  <div key={row.label} className="profile-info-row">
                    <span className={`flex size-8 items-center justify-center rounded-lg ${row.color}`}>
                      <row.icon className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{row.label}</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="secondary" className="mt-4 w-full" onClick={startEditing}>
                Edit Profile
              </Button>
            </>
          )}
        </Card>

        {/* Right column: stats and logout */}
        <div className="space-y-4">
          <Card>
            <h2 className="mb-4 text-sm font-semibold text-slate-800 dark:text-white">Your Stats</h2>
            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className={`rounded-xl p-4 text-center ${stat.style}`}>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <button
            type="button"
            onClick={logout}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-50 px-5 py-3 font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <LogOutIcon className="size-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile