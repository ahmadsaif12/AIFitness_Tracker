import {
  ArrowLeft,
  ArrowRight,
  PersonStanding,
  Target,
  User,
} from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast, { Toaster } from "react-hot-toast"
import { useAppContext } from "../context/AppContext"
import type { ProfileFormData } from "../types"
import Input from "../components/ui/Input"
import Slider from "../components/ui/Slider"
import mockApi from "../assets/mockApi"

const Onboarding = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  const { user, setOnboardingCompleted, fetchUser } = useAppContext()

  const [formData, setFormData] = useState<ProfileFormData>({
    age: 0,
    weight: 0,
    height: 0,
    goal: "maintain",
    dailyCalorieIntake: 2500,
    dailyCalorieBurn: 550,
  })

  const totalSteps = 3

  const updateField = (
    field: keyof ProfileFormData,
    value: string | number
  ) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleFinish = async () => {
    if (!user) {
      toast.error("Create an account to save your profile.")
      navigate("/login")
      return
    }

    try {
      await mockApi.user.update(user.id, {
        age: Number(formData.age),
        weight: Number(formData.weight),
        height: Number(formData.height) || null,
        goal: formData.goal as "lose" | "maintain" | "gain",
        dailyCalorieIntake: Number(formData.dailyCalorieIntake),
        dailyCalorieBurn: Number(formData.dailyCalorieBurn),
      })

      await fetchUser(user.token)
      setOnboardingCompleted(true)
      navigate("/dashboard")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save your profile."
      )
    }
  }

  return (
    <>
      <Toaster />

      <div className="onboarding-container dark min-h-screen pb-20">
        {/* Header */}
        <div className="onboarding-wrapper px-6 pt-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500">
              <PersonStanding className="h-6 w-6 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              FitTrack
            </h1>
          </div>

          <p className="mt-4 text-slate-400">
            Let&apos;s personalize your experience
          </p>
        </div>

        {/* Progress */}
        <div className="onboarding-wrapper mb-8 px-6 pt-7">
          <div className="flex max-w-[720px] gap-2">
            {[1, 2, 3].map((currentStep) => (
              <div
                key={currentStep}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  currentStep <= step
                    ? "bg-emerald-500"
                    : "bg-slate-700"
                }`}
              />
            ))}
          </div>

          <p className="mt-3 text-sm text-slate-400">
            Step {step} of {totalSteps}
          </p>
        </div>

        <div className="onboarding-wrapper flex-1 px-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="max-w-2xl">
              <div className="my-8 flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl border border-emerald-800 bg-emerald-900/10">
                  <User className="size-6 text-emerald-400" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    How Old Are You?
                  </h2>

                  <p className="text-sm text-slate-400">
                    This helps us calculate your needs
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <Input
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={(value) => updateField("age", value)}
                  placeholder="Enter Your Age"
                  min={13}
                  max={100}
                  required
                />

                <Input
                  label="Weight (kg)"
                  type="number"
                  value={formData.weight}
                  onChange={(value) => updateField("weight", value)}
                  placeholder="Enter Your Weight"
                  min={20}
                  max={300}
                  required
                />

                <Input
                  label="Height (cm) - Optional"
                  type="number"
                  value={formData.height}
                  onChange={(value) => updateField("height", value)}
                  placeholder="Enter Your Height"
                  min={100}
                  max={250}
                />
              </div>

              <div className="flex justify-end pt-8">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-xl bg-emerald-500 px-8 py-3 font-semibold text-white transition hover:bg-emerald-600"
                >
                  Continue
                  <ArrowRight className="ml-2 inline size-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="max-w-2xl">
              <div className="my-8 flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl border border-emerald-800 bg-emerald-900/10">
                  <User className="size-6 text-emerald-400" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Your Measurements
                  </h2>

                  <p className="text-sm text-slate-400">
                    Help us track your progress
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <Input
                  label="Weight (kg)"
                  type="number"
                  className="max-w-2xl"
                  value={formData.weight}
                  onChange={(v) => updateField("weight", v)}
                  placeholder="Enter Your Weight"
                  min={20}
                  max={300}
                  required
                />

                <Input
                  label="Height (cm) - Optional"
                  type="number"
                  className="max-w-2xl"
                  value={formData.height}
                  onChange={(v) => updateField("height", v)}
                  placeholder="Enter Your Height"
                  min={100}
                  max={250}
                />
              </div>

              <div className="flex justify-between pt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl bg-slate-800 px-8 py-3 font-semibold text-slate-200 transition hover:bg-slate-700"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-xl bg-emerald-500 px-8 py-3 font-semibold text-white transition hover:bg-emerald-600"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="max-w-[720px]">
              {/* Goal Header */}
              <div className="mb-8 flex items-center gap-4">
                <div className="flex size-[52px] items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/5">
                  <Target className="size-7 text-emerald-400" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    What&apos;s your goal?
                  </h2>

                  <p className="text-slate-400">
                    We&apos;ll tailor your experience
                  </p>
                </div>
              </div>

              <div className="max-w-[550px]">
                {/* Goal Options */}
                <div className="space-y-4">
                  {[
                    {
                      value: "lose",
                      label: "Lose Weight",
                    },
                    {
                      value: "maintain",
                      label: "Maintain Weight",
                    },
                    {
                      value: "gain",
                      label: "Gain Muscle",
                    },
                  ].map((goal) => (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() =>
                        updateField("goal", goal.value)
                      }
                      aria-pressed={formData.goal === goal.value}
                      className={`min-h-[54px] w-full rounded-xl border px-5 py-3.5 text-left text-base transition-all ${
                        formData.goal === goal.value
                          ? "border-emerald-500 bg-slate-800 ring-1 ring-emerald-500"
                          : "border-slate-700 bg-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <span className="text-slate-200">
                        {goal.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-slate-700" />

                {/* Daily Targets */}
                <div>
                  <h3 className="mb-5 text-base font-semibold text-white">
                    Daily Targets
                  </h3>

                  <Slider
                    label="Daily Calorie Intake"
                    min={1200}
                    max={4000}
                    step={50}
                    value={formData.dailyCalorieIntake ?? 2500}
                    onChange={(value) =>
                      updateField("dailyCalorieIntake", value)
                    }
                    unit="kcal"
                    infoText="Your suggested daily calorie intake."
                    className="mb-7"
                  />

                  <Slider
                    label="Daily Calorie Burn"
                    min={100}
                    max={1500}
                    step={50}
                    value={formData.dailyCalorieBurn ?? 550}
                    onChange={(value) =>
                      updateField("dailyCalorieBurn", value)
                    }
                    unit="kcal"
                    infoText="Your suggested daily calories to burn through activity."
                  />
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex justify-end gap-3 pt-25  ">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex h-[52px] min-w-[134px] items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 text-base font-medium text-slate-200 transition hover:bg-slate-700 sm:min-w-[154px] sm:px-6"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => void handleFinish()}
                  className="inline-flex h-[52px] min-w-[174px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-base font-semibold text-white transition hover:bg-emerald-500 sm:min-w-[207px] sm:px-6"
                >
                  Get Started
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Onboarding