import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import cx from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import FFLogo from '../public/farbenfroh.svg'

const NavBar = (): JSX.Element => {
  const items = [{ name: 'faerber', href: '/' }]
  const router = useRouter()

  return (
    <Disclosure as="nav" className="bg-mantle shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 justify-between">
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <FFLogo className="block h-8 w-auto fill-pink" />
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {items.map((item) => {
                    const active = router.pathname === item.href
                    return (
                      <Link
                        href={item.href}
                        key={item.name}
                        className={cx(
                          'inline-flex items-center border-b-2 px-1 pt-1',
                          {
                            'border-pink text-text': active,
                            'border-transparent text-gray-300 hover:border-gray-100 hover:text-gray-100':
                              !active,
                          }
                        )}
                      >
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-4 pt-2">
              {items.map((item) => {
                const active = router.pathname === item.href
                return (
                  <Disclosure.Button
                    as="a"
                    href={item.href}
                    key={item.name}
                    className={cx(
                      'block border-l-4 py-2 pl-3 pr-4 font-medium',
                      {
                        'border-pink bg-base/20 text-text': active,
                        'border-transparent text-gray-300 hover:border-pink hover:bg-base/10 hover:text-gray-100':
                          !active,
                      }
                    )}
                  >
                    {item.name}
                  </Disclosure.Button>
                )
              })}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

export default NavBar
