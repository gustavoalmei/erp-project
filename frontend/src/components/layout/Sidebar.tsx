import {
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  PanelRightClose,
  PanelRightOpen,
  Settings,
  Tags,
  User,
  Users,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { settingsService } from '@/services/api'
import { Card } from '../ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { getRoleLabel, getRoleColor } from '@/utils/document'

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [systemLogo, setSystemLogo] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('ERP System')
  const { user, isMobile, logout, switchCompany } = useAuth()
  const location = useLocation()

  const loadSettings = () => {
    settingsService
      .getSettings()
      .then((s) => setCompanyName(s.companyName))
      .catch(() => {})
    settingsService
      .getLogo()
      .then(({ logoBase64 }) => setSystemLogo(logoBase64))
      .catch(() => {})
  }

  useEffect(() => {
    loadSettings()
    window.addEventListener('settings-updated', loadSettings)
    return () => window.removeEventListener('settings-updated', loadSettings)
  }, [])
  const initials = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.split(' ').pop()?.charAt(0).toUpperCase()
    : ''
  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Dashboard',
      path: '/dashboard',
      redirect: '/dashboard',
      havePermission: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR', 'VIEWER'],
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: 'Produtos',
      path: '/products',
      redirect: '/products',
      havePermission: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'],
    },
    {
      icon: <Tags className="w-5 h-5" />,
      label: 'Categorias',
      path: '/categories',
      redirect: '/categories',
      havePermission: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'],
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: 'Vendas',
      path: '/sell',
      redirect: '/sell',
      havePermission: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'],
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Clientes',
      path: '/clients',
      redirect: '/clients',
      havePermission: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR', 'VIEWER'],
    },
    {
      icon: <User className="w-5 h-5" />,
      label: 'Usuários',
      path: '/users',
      redirect: '/users',
      havePermission: ['ADMIN'],
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Configurações',
      path: '/settings',
      redirect: '/settings',
      havePermission: ['ADMIN'],
    },
  ]

  const optionsMenu = [
    {
      label: 'Profile',
      path: '/profile',
      onClick: () => {
        setIsExpanded(false)
      },
      icon: <User className="w-5 h-5" />,
    },
    {
      label: 'Billing',
      path: '/billing',
      onClick: () => {
        setIsExpanded(false)
      },
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      label: 'Trocar empresa',
      path: '',
      onClick: () => {
        setIsExpanded(false)
        switchCompany()
      },
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      label: 'Logout',
      path: '',
      onClick: () => {
        logout()
        setIsExpanded(false)
      },
      icon: <LogOut className="w-5 h-5" />,
    },
  ]

  return (
    <aside>
      <div className="sm:hidden block">
        <div className="flex justify-between items-center">
          <div
            className="
            cursor-pointer
            bg-color-surface hover:bg-color-primary-hover
            dark:bg-color-surface dark:hover:bg-color-primary-hover
            text-color-text-primary hover:text-color-text-inverse dark:text-color-text-primary
            transition-colors rounded-lg p-1.5"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <PanelRightOpen /> : <PanelRightClose />}
          </div>
          <div className="flex items-center gap-2">
            {systemLogo && (
              <img src={systemLogo} alt="Logo" className="h-8 w-auto object-contain" />
            )}
            <h1
              className="text-2xl text-color-text-primary truncate max-w-[200px]"
              title={companyName}
            >
              {companyName}
            </h1>
          </div>
          <div className="w-[36px]"></div>
        </div>

        {isExpanded ? (
          <div
            className={`
              h-full
              transition-all duration-300
              ${isMobile && isExpanded ? `fixed top-0 left-0 z-50` : ``}
              ${isExpanded ? `w-64` : `w-16`}
              bg-color-bg-secondary dark:bg-color-bg-primary
              overflow-auto
              rounded-2xl`}
          >
            <div
              className="
                p-3.5
                h-full 
                flex
                flex-col justify-between"
            >
              <div className="flex flex-col items-end">
                <div
                  className="
                      cursor-pointer
                      bg-color-surface hover:bg-color-primary-hover
                      dark:bg-color-surface dark:hover:bg-color-primary-hover
                      text-color-text-primary hover:text-color-text-inverse dark:text-color-text-primary
                      transition-colors rounded-lg p-1.5"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <PanelRightOpen /> : <PanelRightClose />}
                </div>
                <ul className="w-full flex flex-col gap-2 mt-2">
                  {menuItems.map((item, index) => {
                    const optionActive = location.pathname === item.path
                    const redirect = item.redirect || ''
                    const havePermission = item.havePermission.includes(user?.role || '')
                    if (!havePermission) return null
                    return (
                      <TooltipProvider key={index}>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger>
                            <Link
                              to={redirect}
                              onClick={() => setIsExpanded(false)}
                              className="w-full h-10"
                            >
                              <li
                                className={`
                                  w-full h-full flex items-center
                                  ${optionActive ? `bg-color-primary-active dark:bg-color-primary-active` : ''}
                                  ${optionActive ? `text-color-text-inverse dark:text-color-text-primary` : 'text-color-text-primary dark:text-color-text-primary'}
                                  hover:bg-color-primary-hover dark:hover:bg-color-primary-hover
                                  hover:text-color-text-inverse dark:hover:text-color-text-primary
                                  transition-colors rounded-lg cursor-pointer
                                  gap-2 p-2
                                `}
                              >
                                <div>{item.icon}</div>
                                <div
                                  className={`${isExpanded ? 'opacity-100 w-auto block' : 'opacity-0 w-0 hidden'}`}
                                >
                                  {item.label}
                                </div>
                              </li>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </ul>
              </div>
              <div className="w-full flex flex-col gap-2">
                <div className="w-full flex flex-col">
                  {isExpanded ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Card
                          className="w-full h-full 
                  flex items-start flex-row gap-2 
                  rounded-lg shadow-none p-2 
                  border-color-border-default 
                  bg-color-surface hover:bg-color-primary-hover 
                  text-color-text-primary hover:text-color-text-inverse 
                  dark:text-color-text-primary dark:hover:text-color-text-primary
                  transition-colors 
                  cursor-pointer"
                        >
                          <div
                            className="max-w-10 w-full h-10 
                    flex items-center justify-center 
                    rounded-full 
                    bg-color-surface 
                    text-color-text-primary
                    p-1 font-bold select-none"
                          >
                            {user?.avatar ? (
                              <img
                                src={user?.avatar}
                                alt="Avatar do usuário"
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          <div className="w-full flex flex-col truncate">
                            <p className="truncate" title={user?.name}>
                              {user?.name}
                            </p>
                            <p
                              className={`text-sm ${getRoleColor(user?.role)}`}
                              title={getRoleLabel(user?.role)}
                            >
                              {getRoleLabel(user?.role)}
                            </p>
                          </div>
                        </Card>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="
                w-[228px]
                border-color-border-default 
                bg-color-surface 
                rounded-lg 
                select-none"
                      >
                        <DropdownMenuGroup className="w-52">
                          <DropdownMenuLabel
                            className="
                    text-text 
                    dark:text-color-text-primary 
                    bg-color-surface 
                    p-2"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col truncate">
                                <span className="truncate" title={user?.name}>
                                  {user?.name}
                                </span>
                                <span className="truncate text-xs" title={user?.email}>
                                  {user?.email}
                                </span>
                              </div>
                            </div>
                          </DropdownMenuLabel>
                          {optionsMenu.map((option, index) => (
                            <Link
                              key={index}
                              onClick={() => setIsExpanded(false)}
                              to={option.path}
                              className="w-full h-10"
                            >
                              <DropdownMenuItem
                                className="text-text 
                        bg-color-surface 
                        hover:bg-color-primary 
                        text-color-text-primary 
                        hover:text-color-text-inverse 
                        dark:text-color-text-primary 
                        dark:hover:text-color-text-primary 
                        rounded-lg 
                        cursor-pointer
                        flex items-center gap-3"
                              >
                                {option.icon}
                                {option.label}
                              </DropdownMenuItem>
                            </Link>
                          ))}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div
                      className="max-w-10 w-full h-10 
              flex items-center justify-center 
              rounded-lg 
              bg-color-surface 
              hover:bg-color-primary 
              hover:text-color-text-inverse
              dark:hover:text-color-text-primary
              text-color-text-primary 
              font-bold 
              overflow-hidden
              select-none"
                    >
                      {user?.avatar ? (
                        <img
                          src={user?.avatar}
                          alt="Avatar do usuário"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
      <div className="hidden sm:block h-full">
        <div
          className={`
          h-full
          ${isMobile && isExpanded ? `fixed top-0 left-0 z-50` : ``}
          ${isExpanded ? `w-64` : `w-16`} 
          transition-all duration-300 
          bg-color-bg-secondary dark:bg-color-bg-primary 
          rounded-2xl`}
        >
          <div
            className="
            p-3.5
            h-full 
            flex
            flex-col justify-between"
          >
            <div className="flex flex-col items-end">
              <div className="w-full flex items-center justify-between mb-1">
                {isExpanded ? (
                  <div className="flex items-center gap-2 overflow-hidden pl-1">
                    {systemLogo ? (
                      <img
                        src={systemLogo}
                        alt="Logo"
                        className="h-7 w-auto object-contain shrink-0"
                      />
                    ) : null}
                    <span className="text-sm font-semibold text-color-text-primary truncate">
                      {companyName}
                    </span>
                  </div>
                ) : (
                  <div className="w-9 h-9 flex items-center justify-center">
                    {systemLogo ? (
                      <img src={systemLogo} alt="Logo" className="h-7 w-7 object-contain" />
                    ) : null}
                  </div>
                )}
                <div
                  className="
                  h-10 shrink-0
                  flex items-center
                  cursor-pointer
                  bg-color-surface hover:bg-color-primary-hover
                  dark:bg-color-surface dark:hover:bg-color-primary-hover
                  text-color-text-primary hover:text-color-text-inverse dark:text-color-text-primary
                  transition-colors rounded-lg p-1.5"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <PanelRightOpen /> : <PanelRightClose />}
                </div>
              </div>
              <ul className="w-full flex flex-col gap-2 mt-2">
                {menuItems.map((item, index) => {
                  const optionActive = location.pathname === item.path
                  const redirect = item.redirect || ''
                  const havePermission = item.havePermission.includes(user?.role || '')
                  if (!havePermission) return null
                  return (
                    <TooltipProvider key={index}>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger>
                          <Link
                            to={redirect}
                            onClick={() => setIsExpanded(false)}
                            className="w-full h-[10px]"
                          >
                            <li
                              className={`
                              w-full h-10 flex items-center
                              ${optionActive ? `bg-color-primary-active dark:bg-color-primary-active` : ''}
                              ${optionActive ? `text-color-text-inverse dark:text-color-text-primary` : 'text-color-text-primary dark:text-color-text-primary'}
                              hover:bg-color-primary-hover dark:hover:bg-color-primary-hover
                              hover:text-color-text-inverse dark:hover:text-color-text-primary
                              transition-colors rounded-lg cursor-pointer
                              gap-2 p-2
                          `}
                            >
                              <div>{item.icon}</div>
                              <div
                                className={`${isExpanded ? 'opacity-100 w-auto block' : 'opacity-0 w-0 hidden'}`}
                              >
                                {item.label}
                              </div>
                            </li>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </ul>
            </div>
            <div className="w-full flex flex-col gap-2 overflow-hidden">
              <div className="w-full flex flex-col">
                {isExpanded ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Card
                        className="w-full h-full 
                        flex items-start flex-row gap-2 
                        rounded-lg shadow-none p-2 
                        border-color-border-default 
                        bg-color-surface hover:bg-color-primary-hover 
                        text-color-text-primary hover:text-color-text-inverse 
                        dark:text-color-text-primary dark:hover:text-color-text-primary
                        transition-colors 
                        cursor-pointer"
                      >
                        <div
                          className="max-w-10 w-full h-10 
                          flex items-center justify-center 
                          rounded-full 
                          bg-color-surface 
                          text-color-text-primary
                          font-bold 
                          overflow-hidden
                          select-none"
                        >
                          {user?.avatar ? (
                            <img
                              src={user?.avatar}
                              alt="Avatar do usuário"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                        </div>
                        <div className="w-full flex flex-col truncate">
                          <p className="truncate" title={user?.name}>
                            {user?.name}
                          </p>
                          <p
                            className={`text-sm ${getRoleColor(user?.role)}`}
                            title={getRoleLabel(user?.role)}
                          >
                            {getRoleLabel(user?.role)}
                          </p>
                        </div>
                      </Card>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="
                w-[228px]
                border-color-border-default 
                bg-color-surface 
                rounded-lg 
                select-none"
                    >
                      <DropdownMenuGroup className="w-52">
                        <DropdownMenuLabel
                          className="
                    text-text 
                    dark:text-color-text-primary 
                    bg-color-surface 
                    p-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col truncate">
                              <span className="truncate" title={user?.name}>
                                {user?.name}
                              </span>
                              <span className="truncate text-xs" title={user?.email}>
                                {user?.email}
                              </span>
                            </div>
                          </div>
                        </DropdownMenuLabel>
                        {optionsMenu.map((option, index) => (
                          <Link
                            key={index}
                            to={option.path}
                            onClick={option.onClick}
                            className="w-full h-10"
                          >
                            <DropdownMenuItem
                              className="text-text 
                                bg-color-surface 
                                hover:bg-color-primary 
                                text-color-text-primary 
                                hover:text-color-text-inverse 
                                dark:text-color-text-primary 
                                dark:hover:text-color-text-primary 
                                rounded-lg 
                                cursor-pointer
                                flex items-center gap-3"
                            >
                              {option.icon}
                              {option.label}
                            </DropdownMenuItem>
                          </Link>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div
                    className="max-w-10 w-full h-10 
              flex items-center justify-center 
              rounded-lg 
              bg-color-surface 
              hover:bg-color-primary 
              hover:text-color-text-inverse
              dark:hover:text-color-text-primary
              text-color-text-primary 
              font-bold 
              overflow-hidden
              select-none"
                  >
                    {user?.avatar ? (
                      <img
                        src={user?.avatar}
                        alt="Avatar do usuário"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
