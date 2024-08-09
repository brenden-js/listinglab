"use client"
import {usePathname} from "next/navigation";
import Link from "next/link";
import {HomeIcon, LightningBoltIcon, MagicWandIcon} from "@radix-ui/react-icons";
import {useHouseUpdateContext} from "@/app/dashboard/contexts/house-updates-context";
import { motion } from 'framer-motion';

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}


const ConnectionStatusBadge = ({ isConnected }: { isConnected: boolean }) => {
  const badgeColor = isConnected ? 'bg-green-500' : 'bg-red-500';

  const pulseVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <motion.div
        className={`w-3 h-3 rounded-full ${badgeColor}`}
        variants={pulseVariants}
        animate="pulse"
      />
      <span className="text-sm font-medium">
        {isConnected ? 'Online' : 'Offline'}
      </span>
    </div>
  );
};


export const SideNavigation = () => {

  const path = usePathname()

  const {isConnected} = useHouseUpdateContext()

  const navigation = [
    {name: 'Generate', href: '/dashboard', icon: MagicWandIcon, current: path === '/dashboard'},
    {name: 'Subscriptions', href: '/dashboard/subscriptions', icon: LightningBoltIcon, current: path === '/dashboard/subscriptions'},
    {name: 'Houses', href: '/dashboard/houses', icon: HomeIcon, current: path === '/dashboard/houses'}
  ]

  return (
    <div className="mt-5 flex-1" aria-label="Sidebar">
      <div className="px-2 py-2">
          <ConnectionStatusBadge isConnected={isConnected}/>
      </div>
      <div className="space-y-1 px-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={classNames(
              item.current
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            )}
          >
            <item.icon
              className={classNames(
                item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                'mr-3 h-6 w-6'
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  )
}