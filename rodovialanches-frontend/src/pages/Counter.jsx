import React from 'react'
import { listOrders, updateOrderStatus, statusLabel } from '../api'

export default function Counter(){
  const [orders, setOrders] = React.useState([])
  const [lastUpdate, setLastUpdate] = React.useState(null)

  async function load(){
    const all = await listOrders()
    setOrders(all.filter(o=> o.status==='READY_FOR_PAYMENT'))
    setLastUpdate(new Date().toLocaleTimeString())
  }

  React.useEffect(()=>{ load(); const t = setInterval(load,3000); return ()=>clearInterval(t); },[])

  async function pay(id){ await updateOrderStatus(id,'PAID'); load(); }

  return (
    <div className="section-grid">
      <div className="page-title-row">
        <h2>Balcão</h2>
        <div className="badge">Atualizado: {lastUpdate || 'carregando...'}</div>
      </div>
      {orders.length === 0 ? (
        <div className="stats-card">Nenhum pedido aguardando pagamento.</div>
      ) : (
        <div className="section-grid">
          {orders.map((o, idx)=> {
            const total = o.items.reduce((s,it)=>s + it.product.price * it.quantity,0)
            return (
              <div key={o.id} className="order-card">
                <div><strong>Pedido #{idx + 1}</strong></div>
                <div>Garçom: {o.waiter?.name || 'Desconhecido'}</div>
                <div>Cliente: {o.customer?.name || 'Desconhecido'}</div>
                <div>Mesa: {o.tableNumber || 'N/A'}</div>
                <div>Status: {statusLabel(o.status)}</div>
                <ul className="order-items">
                  {o.items.map(it=> <li key={it.id}>{it.product.name} x{it.quantity}</li>)}
                </ul>
                <div>Total: R$ {total.toFixed(2)}</div>
                <button className="action-button" onClick={()=>pay(o.id)}>Marcar Pago</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
