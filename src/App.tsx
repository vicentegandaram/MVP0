import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store'
import { Layout } from './components/layout/Layout'
import { DBConnectionChecker } from './components/common/DBConnectionChecker'
import { Toaster } from './components/common/Toaster'
import { ConfirmDialog } from './components/common/ConfirmDialog'
import { DashboardPage } from './pages/Dashboard'
import { PatientsPage } from './pages/Patients'
import { PatientNewPage } from './pages/PatientNew'
import { AppointmentsPage } from './pages/Appointments'
import { PlansPage } from './pages/Plans'
import { PlanDetailPage } from './pages/PlanDetail'
import { PlanViewPage } from './pages/PlanView'
import { PatientDetailPage } from './pages/PatientDetail'
import { PatientMealTrackerPage } from './pages/PatientMealTracker'
import { ShoppingListPage } from './pages/ShoppingList'
import { LoginPage } from './pages/Login'
import { RegisterPage } from './pages/Register'
import { LandingPage } from './pages/Landing'
import { PatientPortalPage } from './pages/PatientPortal'
import { TerminosPage } from './pages/legal/Terminos'
import { PrivacidadPage } from './pages/legal/Privacidad'
import { useEffect } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, checkAuth } = useAuthStore()
  
  useEffect(() => {
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return <>{children}</>
}

// Public route wrapper (redirect to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  if (user) {
    return <DashboardPage />
  }

  return <>{children}</>
}

const router = createBrowserRouter([
  {
    path: '/landing',
    element: <LandingPage />,
  },
  {
    path: '/p/:token',
    element: <PatientPortalPage />,
  },
  {
    path: '/terminos',
    element: <TerminosPage />,
  },
  {
    path: '/privacidad',
    element: <PrivacidadPage />,
  },
  {
    path: '/login',
    element: <PublicRoute><LoginPage /></PublicRoute>,
  },
  {
    path: '/register',
    element: <PublicRoute><RegisterPage /></PublicRoute>,
  },
  {
    path: '/',
    element: (
      <DBConnectionChecker>
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      </DBConnectionChecker>
    ),
    children: [
      {
        index: true,
        element: <AppointmentsPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'patients',
        element: <PatientsPage />,
      },
      {
        path: 'patients/new',
        element: <PatientNewPage />,
      },
      {
        path: 'patients/:patientId',
        element: <PatientDetailPage />,
      },
      {
        path: 'patients/:patientId/edit',
        element: <PatientNewPage />,
      },
      {
        path: 'patients/:patientId/meals',
        element: <PatientMealTrackerPage />,
      },
      {
        path: 'plans',
        element: <PlansPage />,
      },
      {
        path: 'plans/:patientId',
        element: <PlanDetailPage />,
      },
      {
        path: 'plans/:patientId/view',
        element: <PlanViewPage />,
      },
      {
        path: 'plans/:patientId/shopping',
        element: <ShoppingListPage />,
      },
    ],
    errorElement: (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">404</h1>
          <p className="text-gray-600 mb-4">Página no encontrada</p>
          <a href="/" className="text-emerald-600 hover:text-emerald-700">
            Volver al inicio
          </a>
        </div>
      </div>
    ),
  },
])

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      <ConfirmDialog />
    </QueryClientProvider>
  )
}