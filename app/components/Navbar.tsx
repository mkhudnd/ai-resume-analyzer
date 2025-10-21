import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
  const { auth } = usePuterStore();

  return (
    <nav className="navbar">
        <Link to='/'>
        <p className="text-2xl font-bold text-gradient">Ispani</p>
        </Link>
        <div className="flex items-center gap-4">
          <Link to='/upload' className="primary-button w-fit">
            Upload CV
          </Link>
          {auth.isAuthenticated && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{auth.user?.username}</span>
              <Link to='/auth' className="text-sm text-blue-600 hover:underline">
                Switch Account
              </Link>
            </div>
          )}
        </div>
    </nav>
  )
}

export default Navbar