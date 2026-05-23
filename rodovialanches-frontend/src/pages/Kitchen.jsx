import React from 'react'
import { listOrders, updateOrderStatus, statusLabel } from '../api'

export default function Kitchen(){
  const [orders, setOrders] = React.useState([])
  const [lastUpdate, setLastUpdate] = React.useState(null)

  async function load(){
    const all = await listOrders()
    setOrders(all.filter(o=> o.status==='PENDING_PREPARATION' || o.status==='PREPARING'))
    setLastUpdate(new Date().toLocaleTimeString())
  }

  React.useEffect(()=>{ load(); const t = setInterval(load,3000); return ()=>clearInterval(t); },[])

  async function markReady(id){ await updateOrderStatus(id,'READY_FOR_PAYMENT'); load(); }

  return (
    <div className="section-grid">
      <div className="page-title-row">
        <h2>Cozinha</h2>
        <div className="badge">Atualizado: {lastUpdate || 'carregando...'}</div>
      </div>
      {orders.length === 0 ? (
        <div className="stats-card">Nenhum pedido aguardando preparação.</div>
      ) : (
        <div className="section-grid">
          {orders.map((o, idx)=> (
            <div key={o.id} className="order-card">
              <div><strong>Pedido #{idx + 1}</strong> - {o.waiter?.name || 'Garçom'}{o.tableNumber ? ` - Mesa ${o.tableNumber}` : ''}</div>
              <div className="badge">{statusLabel(o.status)}</div>
              <ul className="order-items">
                {o.items.map(it=> <li key={it.id}>{it.product.name} x{it.quantity}</li>)}
              </ul>
              <div>
                <button className="action-button" onClick={()=>markReady(o.id)}>Marcar Pronto</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
