import Link from 'next/link'

import { NavLink } from "@/app/(marketing)/components/nav-link";
import Image from "next/image";
import homementorLogo from "@/images/logos/homementor.svg";

export function Footer() {
  return (
    <footer className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Image alt="logo" src={homementorLogo} height={40} width={36} />

          <nav className="text-sm" aria-label="quick links">
            <ul className="flex gap-x-6">
              <li><NavLink href="#features">Features</NavLink></li>
              <li><NavLink href="#pricing">Pricing</NavLink></li>
            </ul>
          </nav>

          <div className="flex gap-x-4">
            <Link href="https://tiktok.com" aria-label="Listing Lab on TikTok">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-tiktok" viewBox="0 0 16 16">
                <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" />
              </svg>
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8 border-t border-slate-400/10 pt-6">
          Copyright © {new Date().getFullYear()} Home Mentor AI.
        </p>
      </div>
    </footer>
  );
}