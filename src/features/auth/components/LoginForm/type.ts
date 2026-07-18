export interface FormValues {
  email: string
  password: string
  confirmPassword?: string
}

export interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  form?: string
}
