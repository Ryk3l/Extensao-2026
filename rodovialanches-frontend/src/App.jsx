import React from 'react'
import Waiter from './pages/Waiter'
import Kitchen from './pages/Kitchen'
import Counter from './pages/Counter'
import Manager from './pages/Manager'
import WaiterRegistry from './pages/WaiterRegistry'
import CustomerRegistry from './pages/CustomerRegistry'
import './styles.css'

export default function App(){
  const [page, setPage] = React.useState('waiter')
  return (
    <div className="app-shell">
      <div className="page-title-row">
        <h1>Rodovia Lanches</h1>
        <div className="badge">Página: {page === 'waiter' ? 'Garçom' : page === 'kitchen' ? 'Cozinha' : page === 'counter' ? 'Balcão' : page === 'manager' ? 'Gerente' : page === 'waiter-registry' ? 'Cadastro de Garçons' : page === 'customer-registry' ? 'Cadastro de Clientes' : ''}</div>
      </div>
      <div className="top-nav">
        <button className={page==='waiter' ? 'active' : ''} onClick={()=>setPage('waiter')}>Garçom</button>
        <button className={page==='kitchen' ? 'active' : ''} onClick={()=>setPage('kitchen')}>Cozinha</button>
        <button className={page==='counter' ? 'active' : ''} onClick={()=>setPage('counter')}>Balcão</button>
        <button className={page==='manager' ? 'active' : ''} onClick={()=>setPage('manager')}>Gerente</button>
        <button className={page==='waiter-registry' ? 'active' : ''} onClick={()=>setPage('waiter-registry')}>Cadastro Garçom</button>
        <button className={page==='customer-registry' ? 'active' : ''} onClick={()=>setPage('customer-registry')}>Cadastro Cliente</button>
      </div>
      <div className="page-card">
        {page==='waiter' && <Waiter />}
        {page==='kitchen' && <Kitchen />}
        {page==='counter' && <Counter />}
        {page==='manager' && <Manager />}
        {page==='waiter-registry' && <WaiterRegistry />}
        {page==='customer-registry' && <CustomerRegistry />}
      </div>
    </div>
  )
}
