import { useRef, useState } from "react"
import { ImagePlusIcon, Loader2Icon, PlusIcon, SparklesIcon, Trash2Icon, XIcon } from "lucide-react"
import toast from "react-hot-toast"
import { useAppContext } from "../context/AppContext"
import mockApi from "../assets/mockApi"
import {
  mealColors,
  mealIcons,
  mealTypeOptions,
  quickActivitiesFoodLog,
} from "../assets/assets"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Select from "../components/ui/Select"
import type { FoodEntry } from "../types"

type MealType = FoodEntry["mealType"]

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"]

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
}

type FoodForm = {
  name: string
  calories: number | ""
  mealType: MealType
}

const emptyForm: FoodForm = { name: "", calories: "", mealType: "breakfast" }

// Returns today's date as YYYY-MM-DD, matching how entries are stored.
const getTodayKey = () => new Date().toISOString().split("T")[0]

// Renders a simple modal shell used by the add and AI snap dialogs.
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

const FoodLog = () => {
  const { allFoodLogs, setAllFoodLogs } = useAppContext()

  const [showAddForm, setShowAddForm] = useState(false)
  const [showSnap, setShowSnap] = useState(false)
  const [form, setForm] = useState<FoodForm>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const todayKey = getTodayKey()
  const todayFood = allFoodLogs.filter((item) => item.date === todayKey)
  const totalCalories = todayFood.reduce((sum, item) => sum + item.calories, 0)

  const groups = MEAL_ORDER.map((type) => ({
    type,
    items: todayFood.filter((item) => item.mealType === type),
  })).filter((group) => group.items.length > 0)

  // Opens the add dialog, optionally pre-selecting a meal type.
  const openAddForm = (mealType?: MealType) => {
    setForm((current) => ({ ...current, mealType: mealType ?? current.mealType }))
    setShowAddForm(true)
  }

  const closeAddForm = () => {
    setShowAddForm(false)
    setForm(emptyForm)
  }

  const closeSnap = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setShowSnap(false)
    setImageFile(null)
    setImagePreview(null)
  }

  // Saves a new food entry and adds it to shared state.
  const handleAdd = async () => {
    const calories = Number(form.calories)
    if (!form.name.trim() || !calories || calories <= 0) {
      toast.error("Enter a food name and calories.")
      return
    }

    try {
      setIsSaving(true)
      const { data } = await mockApi.foodLogs.create({
        data: { name: form.name.trim(), calories, mealType: form.mealType },
      })
      setAllFoodLogs((current) => [...current, data])
      toast.success("Food added")
      closeAddForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add food.")
    } finally {
      setIsSaving(false)
    }
  }

  // Removes an entry from storage and shared state.
  const handleDelete = async (entry: FoodEntry) => {
    if (!entry.documentId) return
    try {
      await mockApi.foodLogs.delete(entry.documentId)
      setAllFoodLogs((current) => current.filter((item) => item.documentId !== entry.documentId))
      toast.success("Food removed")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove food.")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // Analyzes the photo and hands the result to the add dialog for confirmation.
  const handleAnalyze = async () => {
    if (!imageFile) return
    try {
      setIsAnalyzing(true)
      const formData = new window.FormData()
      formData.append("image", imageFile)
      const { data } = await mockApi.imageAnalysis.analyze(formData)
      setForm((current) => ({
        ...current,
        name: data.result.name,
        calories: data.result.calories,
      }))
      closeSnap()
      setShowAddForm(true)
      toast.success("Food detected. Check the details and save.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not analyze the image.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Food Log</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track your daily intake</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Today&apos;s Total</p>
            <p className="text-2xl font-bold text-emerald-500">{totalCalories} kcal</p>
          </div>
        </div>
      </header>

      <div className="page-content-grid items-start">
        {/* Left column: quick actions */}
        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-white">Quick Add</h2>
            <div className="flex flex-wrap gap-2">
              {quickActivitiesFoodLog.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => openAddForm(item.name as MealType)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span aria-hidden="true" className="text-xs">{item.emoji}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </Card>

          <Button className="w-full" onClick={() => openAddForm()}>
            <PlusIcon className="size-4" />
            Add Food Entry
          </Button>

          <Button className="w-full" onClick={() => setShowSnap(true)}>
            <SparklesIcon className="size-4" />
            AI Food Snap
          </Button>
        </div>

        {/* Right column: meals grouped by type */}
        <div className="space-y-4">
          {groups.length === 0 && (
            <Card className="text-center">
              <p className="font-medium text-slate-700 dark:text-slate-200">No meals logged today</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Use Add Food Entry or AI Food Snap to log your first meal.
              </p>
            </Card>
          )}

          {groups.map(({ type, items }) => {
            const Icon = mealIcons[type]
            const groupCalories = items.reduce((sum, item) => sum + item.calories, 0)

            return (
              <Card key={type}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`flex size-10 items-center justify-center rounded-xl ${mealColors[type]}`}>
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white">{MEAL_LABELS[type]}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {items.length} {items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-slate-800 dark:text-white">{groupCalories} kcal</p>
                </div>

                <div className="space-y-2">
                  {items.map((entry) => (
                    <div key={entry.documentId ?? entry.id} className="food-entry-item">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{entry.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500 dark:text-slate-400">{entry.calories} kcal</span>
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
              </Card>
            )
          })}
        </div>
      </div>

      {/* Add food dialog */}
      {showAddForm && (
        <Modal title="Add Food Entry" onClose={closeAddForm}>
          <div className="space-y-4">
            <Input
              label="Food name"
              value={form.name}
              onChange={(value) => setForm((f) => ({ ...f, name: String(value) }))}
              placeholder="e.g. Grilled chicken salad"
              required
            />
            <Input
              label="Calories (kcal)"
              type="number"
              min={1}
              value={form.calories}
              onChange={(value) =>
                setForm((f) => ({
                  ...f,
                  calories: typeof value === "number" && !Number.isNaN(value) ? value : "",
                }))
              }
              placeholder="e.g. 350"
              required
            />
            <Select
              label="Meal type"
              value={form.mealType}
              onChange={(value) => setForm((f) => ({ ...f, mealType: value as MealType }))}
              options={mealTypeOptions}
              required
            />
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={closeAddForm}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => void handleAdd()} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save entry"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* AI food snap dialog */}
      {showSnap && (
        <Modal title="AI Food Snap" onClose={closeSnap}>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-slate-300 text-slate-500 transition-colors hover:border-emerald-500 hover:text-emerald-500 dark:border-slate-700 dark:text-slate-400"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Selected meal" className="size-full object-cover" />
              ) : (
                <>
                  <ImagePlusIcon className="size-8" />
                  <span className="text-sm">Upload a photo of your meal</span>
                </>
              )}
            </button>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={closeSnap}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => void handleAnalyze()}
                disabled={!imageFile || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze photo"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default FoodLog