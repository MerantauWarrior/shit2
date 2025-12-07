import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator,} from "@/components/ui/field"
import {Input} from "@/components/ui/input"
import React from "react";

export function LoginForm() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>
          Login with your KeyCloak account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <Button variant="outline" type="button">
                <svg className={'size-6'} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50"
                     viewBox="0 0 50 50">
                  <path fill="none" stroke="#030000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10"
                        strokeWidth="2"
                        d="M40.401,35l-4.69,8.457C35.526,43.792,35.173,44,34.791,44H12.852c-0.383,0-0.735-0.208-0.921-0.543l-9.666-17.44 c-0.353-0.638-0.353-1.413,0-2.05l9.666-17.424C12.117,6.208,12.47,6,12.852,6h21.939c0.383,0,0.735,0.208,0.921,0.543L40.401,15"></path>
                  <line x1="14.972" x2="8.005" y1="15" y2="15" fill="none" stroke="#030000" strokeLinecap="round"
                        strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2"></line>
                  <line x1="26.003" x2="21.894" y1="15" y2="15" fill="none" stroke="#030000" strokeLinecap="round"
                        strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2"></line>
                  <path fill="none" stroke="#030000" strokeLinecap="round" strokeLinejoin="round"
                        strokeMiterlimit="10" strokeWidth="2"
                        d="M33.085,35h12.862C46.528,35,47,34.503,47,33.889V16.111C47,15.497,46.528,15,45.946,15H33.045"></path>
                  <line x1="22" x2="26" y1="35" y2="35" fill="none" stroke="#030000" strokeLinecap="round"
                        strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2"></line>
                  <line x1="8.01" x2="14.798" y1="35" y2="35" fill="none" stroke="#030000" strokeLinecap="round"
                        strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2"></line>
                  <polygon fill="none" stroke="#030000" strokeLinecap="round" strokeLinejoin="round"
                           strokeMiterlimit="10" strokeWidth="2"
                           points="16.746,12.02 19.907,12.02 22.014,15.181 16.318,25.025 21.982,34.836 19.874,37.997 16.714,37.997 9.003,25.025"></polygon>
                  <polygon fill="none" stroke="#030000" strokeLinecap="round" strokeLinejoin="round"
                           strokeMiterlimit="10" strokeWidth="2"
                           points="31.271,12.02 28.11,12.02 26.003,15.181 31.699,25.025 26.036,34.836 28.143,37.997 31.303,37.997 39.014,25.025"></polygon>
                  <path fill="#030000"
                        d="M7.583,14.319l4.822-8.006h22.601l4.785,8.319l-6.746,0.074l-1.61-2.595l-3.791,0.35l-1.969,2.117 c0,0-3.844-0.147-3.781-0.11c0.063,0.037-2.587-2.945-2.532-2.945s-2.853,0.258-2.853,0.258L14.669,15L7.583,14.319z"></path>
                  <polygon fill="#030000"
                           points="7.794,35.319 15.122,35.319 16.353,38.218 19.528,38.383 21.894,35.319 26.181,35.319 28.224,38.383 31.123,38.383 33.085,35 40.023,35 35.181,43.92 12.852,43.92"></polygon>
                </svg>
                Login with KeyCloak
              </Button>
            </Field>
            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
              Or continue with
            </FieldSeparator>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </Field>
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <a
                  href="#"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required/>
            </Field>
            <Field>
              <Button type="submit">Login</Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account? <a href="#">Sign up</a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
