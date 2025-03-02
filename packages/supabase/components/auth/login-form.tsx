'use client';

import { signInWithPassword, signUp } from '../../actions/auth';

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
  return (
    <form className={className}>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block font-medium text-gray-700 text-sm"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block font-medium text-gray-700 text-sm"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            formAction={signInWithPassword}
            className="flex-1 rounded-md bg-indigo-600 px-3 py-2 font-semibold text-sm text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
          >
            Sign In
          </button>

          <button
            type="submit"
            formAction={signUp}
            className="flex-1 rounded-md bg-white px-3 py-2 font-semibold text-gray-900 text-sm shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
          >
            Sign Up
          </button>
        </div>
      </div>
    </form>
  );
}
