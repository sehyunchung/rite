import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_layout')({
  component: AdminLayout,
  beforeLoad: ({ context: _context, location: _location }) => {
    // Future: Add authentication check here
    // if (!context.auth.isAuthenticated) {
    //   throw redirect({
    //     to: '/login',
    //     search: {
    //       redirect: location.href,
    //     },
    //   })
    // }
  },
})

function AdminLayout() {
  return (
    <div className="admin-layout">
      {/* Future: Add admin navigation sidebar here */}
      <Outlet />
    </div>
  )
}