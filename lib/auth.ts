import { createPublicClient } from "@/lib/supabase"

export interface User {
  id: string
  email: string
  name: string
  phone: string
  created_at: string
  total_entries: number
  total_wins: number
  profile_image?: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}

// Register new user
export async function registerUser(userData: {
  name: string
  email: string
  phone: string
  password: string
}): Promise<AuthResponse> {
  try {
    const supabase = createPublicClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", userData.email.toLowerCase())
      .single()

    if (existingUser) {
      return { success: false, error: "User already exists with this email" }
    }

    // Create user account
    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          name: userData.name.trim(),
          email: userData.email.toLowerCase().trim(),
          phone: userData.phone.trim(),
          password_hash: await hashPassword(userData.password),
          created_at: new Date().toISOString(),
          total_entries: 0,
          total_wins: 0,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("User registration error:", error)
      return { success: false, error: "Failed to create account" }
    }

    return { success: true, user: user }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Registration failed" }
  }
}

// Login user
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const supabase = createPublicClient()

    const { data: user, error } = await supabase.from("users").select("*").eq("email", email.toLowerCase()).single()

    if (error || !user) {
      return { success: false, error: "Invalid email or password" }
    }

    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return { success: false, error: "Invalid email or password" }
    }

    // Update last login
    await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", user.id)

    return { success: true, user: user }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Login failed" }
  }
}

// Get user profile
export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const supabase = createPublicClient()

    const { data: user, error } = await supabase
      .from("users")
      .select(`
        *,
        total_entries:participants(count),
        total_wins:participants(count).eq(is_winner, true)
      `)
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Get profile error:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Profile fetch error:", error)
    return null
  }
}

// Simple password hashing (in production, use bcrypt)
async function hashPassword(password: string): Promise<string> {
  // Mock hash - in production use bcrypt
  return `hashed_${password}_${Date.now()}`
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Mock verification - in production use bcrypt
  return hash.includes(password)
}
