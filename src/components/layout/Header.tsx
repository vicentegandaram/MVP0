import { Menu, Bell, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { nutritionist, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <button className="rounded-lg p-2 hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="flex items-center gap-3 ml-2">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-gray-900">
              {nutritionist?.name || 'Nutricionista'}
            </p>
            <p className="text-xs text-gray-500">Profesional</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-sm font-medium text-emerald-700">
              {nutritionist?.name?.charAt(0) || 'N'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 hover:bg-red-50 text-gray-500 hover:text-red-600"
            title="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}