import React, { useState, useEffect } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'

function App() {

  const [currentPage, setCurrentPage] = useState('login')

  // Simple routing based on URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'login'
      setCurrentPage(hash)
    }

    // Set initial page
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'signup':
        return <Signup />
      case 'home':
        return <Home />
      case 'login':
      default:
        return <Login />
    }
  }

  return (
    <div className="App">
      {renderPage()}
    </div>
  )
}

export default App