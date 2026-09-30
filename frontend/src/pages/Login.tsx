import {
  ArrowRightIcon,
  AtSignIcon,
  EyeIcon,
  EyeOffIcon,
  FlameIcon,
  Loader2Icon,
  LockIcon,
  MailIcon,
  PersonStandingIcon,
} from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import toast, { Toaster } from "react-hot-toast"
import { useAppContext } from "../context/AppContext"

type Mode = "login" | "signup"

const MIN_PASSWORD_LENGTH = 6

// Scores a password from 0 (empty) to 3 (strong) for the strength meter.
const getPasswordStrength = (password: string) => {
  if (!password) return 0
  let score = 0
  if (password.length >= MIN_PASSWORD_LENGTH) score += 1
  if (password.length >= 10) score += 1
  if (/[A-Z]/.test(password) && /\d/.test(password)) score += 1
  return Math.max(score, 1)
}

const strengthLabels = ["", "Weak", "Good", "Strong"]
const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-emerald-500"]

// Renders a decorative preview of the dashboard on the brand panel.
const PreviewCard = () => {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const progress = 1840 / 2200

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="flex items-center gap-5">
        <div className="relative size-28 shrink-0">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="8" className="stroke-white/10" />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="stroke-emerald-400"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white">1,840</span>
            <span className="text-xs text-slate-400">of 2,200</span>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-slate-400">Calories left</p>
            <p className="font-semibold text-white">360 kcal</p>
          </div>
          <div className="flex items-center gap-2 text-orange-300">
            <FlameIcon className="size-4" aria-hidden="true" />
            <span className="font-medium">420 kcal burned</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Renders the sign in and sign up page with a brand panel and a validated form.
const Login = () => {
  const [mode, setMode] = useState<Mode>("login")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const { login, signup, user } = useAppContext()

  const isSignup = mode === "signup"
  const strength = getPasswordStrength(password)

  // Sends signed-in users straight to the dashboard.
  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true })
  }, [user, navigate])

  // Switches between sign in and sign up and hides the password again.
  const switchMode = (next: Mode) => {
    setMode(next)
    setShowPassword(false)
  }

  // Validates the form, then signs in or creates the account.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isSignup && password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`)
      return
    }

    try {
      setIsSubmitting(true)
      if (isSignup) {
        await signup({ username: username.trim(), email: email.trim(), password })
      } else {
        await login({ email: email.trim(), password })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-800 placeholder-slate-400 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
  const iconClass = "absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-slate-400"

  return (
    <>
      <Toaster />
      <main className="grid min-h-screen bg-white transition-colors duration-200 dark:bg-slate-950 lg:grid-cols-[1.1fr_1fr]">
        {/* Brand panel (desktop only) */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-12 lg:flex">
          <div
            aria-hidden="true"
            className="absolute -left-24 -top-24 size-96 rounded-full bg-emerald-500/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 right-0 size-96 rounded-full bg-emerald-600/10 blur-3xl"
          />

          <div className="relative flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500">
              <PersonStandingIcon className="size-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">FitTrack</span>
          </div>

          <div className="relative space-y-8">
            <div className="max-w-md space-y-4">
              <h1 className="text-4xl font-bold leading-tight text-white">
                Know what you eat. See what you burn.
              </h1>
              <p className="text-lg text-slate-400">
                Log meals and workouts in seconds and watch your week take shape.
              </p>
            </div>
            <PreviewCard />
          </div>

          <p className="relative text-sm text-slate-500">Your data stays on this device in demo mode.</p>
        </section>

        {/* Form panel */}
        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500">
                <PersonStandingIcon className="size-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-800 dark:text-white">FitTrack</span>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {isSignup ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {isSignup
                ? "It takes under a minute. Your targets come next."
                : "Sign in to pick up where you left off."}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {isSignup && (
                <div>
                  <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Username
                  </label>
                  <div className="relative">
                    <AtSignIcon className={iconClass} aria-hidden="true" />
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      placeholder="fitfan"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <div className="relative">
                  <MailIcon className={iconClass} aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <LockIcon className={iconClass} aria-hidden="true" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    placeholder={isSignup ? `At least ${MIN_PASSWORD_LENGTH} characters` : "Your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-11`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((shown) => !shown)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>

                {isSignup && password && (
                  <div className="mt-2 flex items-center gap-3" aria-live="polite">
                    <div className="flex flex-1 gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                            level <= strength ? strengthColors[strength] : "bg-slate-200 dark:bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="w-12 text-right text-xs text-slate-500 dark:text-slate-400">
                      {strengthLabels[strength]}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition-all duration-200 hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-950"
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
                    {isSignup ? "Creating account..." : "Signing in..."}
                  </>
                ) : (
                  <>
                    {isSignup ? "Create account" : "Sign in"}
                    <ArrowRightIcon className="size-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {isSignup ? "Already have an account?" : "New to FitTrack?"}
              <button
                type="button"
                onClick={() => switchMode(isSignup ? "login" : "signup")}
                className="ml-1 cursor-pointer font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                {isSignup ? "Sign in" : "Create an account"}
              </button>
            </p>
          </div>
        </section>
      </main>
    </>
  )
}

export default Login