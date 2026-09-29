import {
  AtSignIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
} from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { useAppContext } from "../context/AppContext"

const Login = () => {
  const [state, setState] = useState<"login" | "signup">("signup")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const { login, signup, user } = useAppContext()

  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      if (state === "login") {
        await login({ email, password })
      } else {
        await signup({ username, email, password })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="text-3xl font-medium text-gray-900 dark:text-white">
          {state === "login" ? "Sign In" : "Sign Up"}
        </h2>

        <p className="mt-2 text-sm text-gray-500/90 dark:text-gray-400">
          {state === "login"
            ? "Please enter email and password to access."
            : "Please enter your details to create an account."}
        </p>

        {state !== "login" && (
          <div className="mt-4">
            <label className="font-medium text-sm text-gray-700 dark:text-gray-300">
              Username
            </label>

            <div className="relative mt-2">
              <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4.5" />

              <input
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input"
                required
              />
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="font-medium text-sm text-gray-700 dark:text-gray-300">
            Email
          </label>

          <div className="relative mt-2">
            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4.5" />

            <input
              type="email"
              placeholder="Please Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="font-medium text-sm text-gray-700 dark:text-gray-300">
            Password
          </label>

          <div className="relative mt-2">
            <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4.5" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input pr-10"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOffIcon size={18} />
              ) : (
                <EyeIcon size={18} />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="login-button mt-6"
        >
          {isSubmitting
            ? "Please wait..."
            : state === "login"
              ? "Sign In"
              : "Create Account"}
        </button>

        <p className="mt-5 text-center text-sm text-gray-500">
          {state === "login"
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={() => setState(state === "login" ? "signup" : "login")}
            className="ml-1 font-medium text-blue-600 hover:underline"
          >
            {state === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </form>
    </main>
  )
}

export default Login
