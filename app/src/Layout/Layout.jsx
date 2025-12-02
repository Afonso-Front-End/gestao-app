import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar'
import Header from '../components/Header/Header'
import ScrollToTopButton from '../components/ScrollToTopButton/ScrollToTopButton'
import useScrollToTop from '../hooks/useScrollToTop'
import './Layout.css'

const Layout = () => {
  // Hook para rolar para o topo quando trocar de página
  useScrollToTop()

  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <Header />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
      {/* <ScrollToTopButton /> */}
    </div>
  )
}

export default Layout
