import Link from 'next/link'

import {NavLink} from "@/app/(marketing)/components/nav-link";
import Image, {type StaticImageData} from "next/image";
import homementorLogo from "@/images/logos/homementor.svg";

export function Footer() {
  return (
    <footer className="bg-slate-50">
      <div  className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className="py-16">
                        <Image alt="logo" src={homementorLogo as StaticImageData}  height={50} width={45}/>
          <nav className="mt-10 text-sm" aria-label="quick links">
            <div className="-my-1 flex justify-center gap-x-6">
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#pricing">Pricing</NavLink>
            </div>
          </nav>
        </div>
        <div className="flex flex-col items-center border-t border-slate-400/10 py-10 sm:flex-row-reverse sm:justify-between">
          <div className="flex gap-x-6">
            <Link
              href="https://tiktok.com"
              className="group"
              aria-label="Home Mentor on TikTok"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                   className="bi bi-tiktok" viewBox="0 0 16 16">
                <path
                  d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" />
              </svg>
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500 sm:mt-0">
            Copyright &copy; {new Date().getFullYear()} Home Mentor AI.
          </p>
        </div>
      </div>
    </footer>
  )
}
