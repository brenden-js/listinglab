'use client'

import { useState } from 'react'
import Select, { StylesConfig } from 'react-select'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Home, BarChart, Star, CheckCircle, Lock, ShieldCheck, Users } from 'lucide-react'
import React from 'react'
import { api } from "@/trpc/react"
import { Checkbox } from "@/components/ui/checkbox"

type StateOption = {
  value: string;
  label: string;
};

const states = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
]

const selectStyles: StylesConfig<StateOption> = {
  control: (base) => ({
    ...base,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: 'rgba(79, 70, 229, 0.2)',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#312e81',
  }),
  input: (base) => ({
    ...base,
    color: '#312e81',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? 'rgba(79, 70, 229, 0.1)' : 'rgba(255, 255, 255, 0.9)',
  }),
};

export default function Component() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<StateOption | null>(null);
  const [wantsUpdates, setWantsUpdates] = useState(false)

  const waitlistMutation = api.user.joinWaitlist.useMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && state?.value) {
      waitlistMutation.mutate({ email, state: state.value, wantsUpdates });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full backdrop-blur-md bg-white bg-opacity-20 p-8 rounded-xl shadow-lg">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h1 className="text-4xl font-bold mb-4 text-indigo-900">
              Revolutionize Your Real Estate Marketing with AI
            </h1>
            <p className="text-lg text-indigo-800 mb-6">
              Join the waitlist for exclusive early access to our cutting-edge AI-powered marketing tools designed specifically for real estate agents.
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <Home className="text-indigo-600 mr-2" />
                <span>Personalized property descriptions</span>
              </div>
              <div className="flex items-center">
                <BarChart className="text-indigo-600 mr-2" />
                <span>AI-driven market analysis</span>
              </div>
              <div className="flex items-center">
                <Star className="text-indigo-600 mr-2" />
                <span>Targeted social media campaigns</span>
              </div>
            </div>
            <div className="bg-indigo-100 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-indigo-900 mb-2">What I am saying about Listing Lab:</h3>
              <p className="italic text-indigo-700">&ldquo;Join us, and together we will restore the business of real estate back into glory.&quot; - Brenden P. Founder</p>
            </div>
          </div>
          <div>
            <div className="bg-white bg-opacity-70 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-indigo-900">Join Our Waitlist</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-indigo-900">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white bg-opacity-50 border-indigo-200 text-indigo-900 placeholder-indigo-300"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-indigo-900">State</Label>
                  <Select<StateOption>
                    id="state"
                    options={states}
                    value={state}
                    onChange={(selectedState) => setState(selectedState)}
                    required
                    className="text-indigo-900"
                    styles={selectStyles}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="updates"
                    checked={wantsUpdates}
                    onCheckedChange={(checked: boolean | 'indeterminate') => {
                      if (typeof checked === 'boolean') {
                        setWantsUpdates(checked);
                      }
                    }}
                  />
                  <label
                    htmlFor="updates"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Receive general product updates
                  </label>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white transition-all duration-300"
                  disabled={waitlistMutation.isPending}
                >
                  {waitlistMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Join the Waitlist'
                  )}
                </Button>
              </form>
              {waitlistMutation.isSuccess && (
                <p className="mt-4 text-green-600 text-center">
                  You&apos;re on the list! We&apos;ll be in touch soon with exclusive AI-powered real estate marketing insights.
                </p>
              )}
              {waitlistMutation.isError && (
                <p className="mt-4 text-red-600 text-center">
                  Oops! Something went wrong. Please try again or contact our support team.
                </p>
              )}
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-indigo-700 flex items-center justify-center">
                <CheckCircle className="mr-2" size={16} />
                100% Free. No credit card required.
              </p>
              <div className="mt-4 flex justify-center space-x-6">
                <div className="flex flex-col items-center">
                  <Lock className="text-indigo-600 mb-1" size={24} />
                  <span className="text-xs text-indigo-700">SSL Secure</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck className="text-indigo-600 mb-1" size={24} />
                  <span className="text-xs text-indigo-700">Not gonna spam you</span>
                </div>
                <div className="flex flex-col items-center">
                  <Users className="text-indigo-600 mb-1" size={24} />
                  <span className="text-xs text-indigo-700">For the people</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}