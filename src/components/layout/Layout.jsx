import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="bg-bg min-h-screen text-text">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}
