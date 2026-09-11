import { z } from "zod"

export const SignUpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
  password_conf: z.string().min(1, {
    message: "Please confirm your password",
  }),
}).refine((data) => data.password === data.password_conf, {
  message: "Passwords do not match",
  path: ["password_conf"],
})

    export const logInSchema = z.object({
     email: z.string().email(),
    password: z.string({required_error: 'Required'}).min(8, { message: 'Minimum password length: 8 characters' }),
     
})
