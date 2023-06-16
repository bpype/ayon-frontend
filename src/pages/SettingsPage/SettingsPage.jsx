import { useMemo, useEffect, lazy } from 'react'
import { useParams, NavLink, Navigate } from 'react-router-dom'
import { Spacer } from '@ynput/ayon-react-components'
import { useSelector } from 'react-redux'
import { useGetSettingsAddonsQuery } from '/src/services/addonList'

import SettingsAddon from './SettingsAddon'

const AnatomyPresets = lazy(() => import('./AnatomyPresets/AnatomyPresets'))
const AddonInstall = lazy(() => import('./AddonInstall'))
const AddonVersions = lazy(() => import('./AddonVersions'))
const StudioSettings = lazy(() => import('./StudioSettings'))
const SiteSettings = lazy(() => import('./SiteSettings'))
const UsersSettings = lazy(() => import('./UsersSettings'))
const Roles = lazy(() => import('./Roles'))
const Attributes = lazy(() => import('./Attributes'))
const Secrets = lazy(() => import('./Secrets'))

const SettingsPage = () => {
  const { module, addonName } = useParams()
  const isUser = useSelector((state) => state.user.data.isUser)

  const {
    data: addonsData,
    //isLoading: addonsLoading,
    //isError: addonsIsError,
  } = useGetSettingsAddonsQuery({})

  useEffect(() => {
    //document.title = 'Settings'
    return () => {
      //console.log('unmounting settings page')
    }
  }, [])

  // the settings regular users can access
  const userAccess = ['site']

  const moduleComponent = useMemo(() => {
    if (addonName) {
      for (const addon of addonsData || []) {
        if (addon.name === addonName) {
          return (
            <SettingsAddon
              addonName={addonName}
              addonVersion={addon.version}
              sidebar={addon.settings.sidebar}
            />
          )
        }
      }
    }

    switch (module) {
      case 'addonInstall':
        return <AddonInstall />
      case 'addonVersions':
        return <AddonVersions />
      case 'anatomyPresets':
        return <AnatomyPresets />
      case 'studio':
        return <StudioSettings />
      case 'site':
        return <SiteSettings />
      case 'users':
        return <UsersSettings />
      case 'roles':
        return <Roles />
      case 'attributes':
        return <Attributes />
      case 'secrets':
        return <Secrets />
      default:
        return <div>Not implemented</div>
    }
  }, [module, addonName, addonsData])

  const links = useMemo(() => {
    console.log('ADDONS DATA: ', addonsData)
    let result = [
      {
        name: 'Anatomy presets',
        path: '/settings/anatomyPresets',
        module: 'anatomyPresets',
      },
      {
        name: 'Install addon',
        path: '/settings/addonInstall',
        module: 'addonInstall',
      },
      {
        name: 'Addon versions',
        path: '/settings/addonVersions',
        module: 'addonVersions',
      },
      {
        name: 'Studio settings',
        path: '/settings/studio',
        module: 'studio',
      },
      {
        name: 'Site settings',
        path: '/settings/site',
        module: 'site',
      },
      {
        name: 'Attributes',
        path: '/settings/attributes',
        module: 'attributes',
      },
      {
        name: 'Users',
        path: '/settings/users',
        module: 'users',
      },
      {
        name: 'Roles',
        path: '/settings/roles',
        module: 'roles',
      },
      {
        name: 'Secrets',
        path: '/settings/secrets',
        module: 'secrets',
      },
    ]

    if (!addonsData) return result

    for (const addon of addonsData) {
      result.push({
        name: addon.title,
        path: `/settings/addon/${addon.name}`,
        module: addon.name,
      })
    }

    return result
  }, [addonsData])

  const navLinks = links.map((link, idx) => {
    if (isUser && !userAccess.includes(link.module)) return null
    return (
      <NavLink key={idx} to={link.path}>
        {link.name}
      </NavLink>
    )
  })

  // if user and module not in userAccess, redirect to site settings
  if (isUser && !userAccess.includes(module)) {
    return <Navigate to={`/settings/${userAccess[0]}`} />
  }

  return (
    <>
      <nav className="secondary">
        {navLinks}
        <Spacer />
      </nav>
      {moduleComponent}
    </>
  )
}

export default SettingsPage
