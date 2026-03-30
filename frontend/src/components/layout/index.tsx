import { Sidebar } from './Sidebar'

export function Layout({ element }: { element: React.ReactNode }) {
  return (
    <div className="flex h-[100svh] w-screen bg-color-bg-primary dark:bg-color-bg-secondary scrollbar-custom overflow-hidden">
      <div className={`flex flex-1 min-h-0 m-2 gap-4 overflow-hidden flex-col sm:flex-row `}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-auto">{element}</main>
      </div>
    </div>
  )
}
