/**
 * Password utilities for generation and validation
 */

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
  checks: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
}

const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?'
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'

/**
 * Generate a secure random password
 * @param length - Password length (default 16)
 * @returns A secure password meeting all requirements
 */
export function generateSecurePassword(length: number = 16): string {
  // Ensure minimum requirements are met
  const password: string[] = []

  // Add at least one of each required character type
  password.push(UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)])
  password.push(LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)])
  password.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)])
  password.push(SPECIAL_CHARS[Math.floor(Math.random() * SPECIAL_CHARS.length)])

  // Fill the rest with random characters from all sets
  const allChars = UPPERCASE + LOWERCASE + NUMBERS + SPECIAL_CHARS
  for (let i = password.length; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)])
  }

  // Shuffle the password to randomize position of required chars
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[password[i], password[j]] = [password[j], password[i]]
  }

  return password.join('')
}

/**
 * Validate password strength against requirements
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
  }

  const errors: string[] = []

  if (!checks.minLength) {
    errors.push('Password must be at least 8 characters')
  }
  if (!checks.hasUppercase) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!checks.hasLowercase) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!checks.hasNumber) {
    errors.push('Password must contain at least one number')
  }
  if (!checks.hasSpecialChar) {
    errors.push('Password must contain at least one special character (!@#$%^&*)')
  }

  return {
    valid: errors.length === 0,
    errors,
    checks,
  }
}

/**
 * Get password strength as a percentage (for progress bars)
 */
export function getPasswordStrengthPercent(password: string): number {
  if (!password) return 0

  const { checks } = validatePasswordStrength(password)
  const totalChecks = Object.keys(checks).length
  const passedChecks = Object.values(checks).filter(Boolean).length

  return Math.round((passedChecks / totalChecks) * 100)
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(password: string): 'weak' | 'fair' | 'good' | 'strong' {
  const percent = getPasswordStrengthPercent(password)

  if (percent <= 25) return 'weak'
  if (percent <= 50) return 'fair'
  if (percent <= 75) return 'good'
  return 'strong'
}
