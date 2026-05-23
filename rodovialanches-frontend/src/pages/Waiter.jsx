import React from 'react'
import { fetchProducts, fetchUsers, createOrder, createUser, listOrders } from '../api'

export default function Waiter(){
  const [products, setProducts] = React.useState([])
  const [users, setUsers] = React.useState([])
  const [items, setItems] = React.useState([])
  const [readyOrders, setReadyOrders] = React.useState([])
  const [selectedWaiter, setSelectedWaiter] = React.useState('')
  const [selectedCustomer, setSelectedCustomer] = React.useState('')
  const [selectedTable, setSelectedTable] = React.useState('1')
  const [newCustomerName, setNewCustomerName] = React.useState('')
  const [newCustomerPhone, setNewCustomerPhone] = React.useState('')
  const [status, setStatus] = React.useState('')
  const [lastReadyUpdate, setLastReadyUpdate] = React.useState(null)

  async function loadReadyOrders(){
    const all = await listOrders()
    setReadyOrders(all.filter(o => o.status === 'READY_FOR_PAYMENT'))
    setLastReadyUpdate(new Date().toLocaleTimeString())
  }

  async function loadUsers(){
    const users = await fetchUsers()
    setUsers(users)
    if (users.length > 0 && !selectedWaiter) {
      const first = users.find(u => u.role === 'GARCOM')
      if (first) setSelectedWaiter(first.id)
    }
    if (users.length > 0 && !selectedCustomer) {
      const firstCustomer = users.find(u => u.role === 'CLIENTE')
      if (firstCustomer) setSelectedCustomer(firstCustomer.id)
    }
  }

  React.useEffect(()=>{
    fetchProducts().then(setProducts)
    loadUsers()
    loadReadyOrders()
    const readyTimer = setInterval(loadReadyOrders, 3000)
    return ()=>clearInterval(readyTimer)
  }, [])

  async function createCustomer(e){
    e.preventDefault()
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
      setStatus('Informe nome e telefone do cliente.')
      setTimeout(()=>setStatus(''), 3000)
      return
    }
    try {
      setStatus('Cadastrar cliente...')
      const result = await createUser({ name: newCustomerName, phone: newCustomerPhone, role: 'CLIENTE' })
      if (result.ok) {
        setNewCustomerName('')
        setNewCustomerPhone('')
        await loadUsers()
        if (result.user?.id) setSelectedCustomer(result.user.id)
        setStatus('Cliente cadastrado com sucesso!')
      } else {
        setStatus(result.message || 'Erro ao cadastrar cliente')
      }
      setTimeout(()=>setStatus(''), 3000)
    } catch (err) {
      setStatus('Erro ao cadastrar cliente')
      setTimeout(()=>setStatus(''), 3000)
    }
  }

  function addItem(product){
    const exist = items.find(i=>i.product.id===product.id)
    const currentQuantity = exist ? exist.quantity : 0
    if (currentQuantity + 1 > product.quantity) {
      setStatus(`Não há estoque suficiente para ${product.name}`)
      setTimeout(()=>setStatus(''), 3000)
      return
    }
    if(exist){
      setItems(items.map(i=>i.product.id===product.id?{...i,quantity:i.quantity+1}:i))
    } else {
      setItems([...items,{product,quantity:1}])
    }
  }

  function removeItem(productId){
    setItems(items.filter(i=>i.product.id!==productId))
  }

  function changeQuantity(productId, delta){
    setItems(items.map(i=>i.product.id===productId?{...i,quantity:Math.max(1,i.quantity+delta)}:i))
  }

  async function submit(){
    if (!selectedWaiter) {
      setStatus('Cadastre/selecione um garçom antes de enviar o pedido.')
      setTimeout(()=>setStatus(''), 3000)
      return
    }
    if (!selectedCustomer) {
      setStatus('Cadastre/selecione um cliente antes de enviar o pedido.')
      setTimeout(()=>setStatus(''), 3000)
      return
    }
    setStatus('Enviando pedido...')
    const order = {
      waiter: { id: selectedWaiter },
      customer: { id: selectedCustomer },
      tableNumber: Number(selectedTable),
      items: items.map(i=>({product: {id: i.product.id}, quantity: i.quantity}))
    }
    await createOrder(order)
    setItems([])
    setStatus('Pedido enviado com sucesso!')
    setTimeout(()=>setStatus(''), 3000)
  }

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return (
    <div className="section-grid">
      <div className="page-title-row">
        <h2>Garçom</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="badge">Total: R$ {total.toFixed(2)}</div>
          <div className="badge">Atualizado: {lastReadyUpdate || '-'}</div>
        </div>
      </div>
      <div className="stats-card">
        <label style={{ display: 'block', marginBottom: '12px' }}>
          Garçom
          <select
            value={selectedWaiter}
            onChange={e=>setSelectedWaiter(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px', borderRadius: '6px', border: '1px solid #dbe4ff' }}
          >
            <option value="">-- selecione --</option>
            {users.filter(u=>u.role==='GARCOM').map(u=> <option value={u.id} key={u.id}>{u.name}</option>)}
          </select>
        </label>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Cliente
          <select
            value={selectedCustomer}
            onChange={e=>setSelectedCustomer(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px', borderRadius: '6px', border: '1px solid #dbe4ff' }}
          >
            <option value="">-- selecione --</option>
            {users.filter(u=>u.role==='CLIENTE').map(u=> (
              <option value={u.id} key={u.id}>{u.name}{u.phone ? ` - ${u.phone}` : ''}</option>
            ))}
          </select>
        </label>
        {users.filter(u=>u.role==='GARCOM').length === 0 && (
          <div style={{ color: '#d32f2f', marginTop: '8px' }}>
            Nenhum garçom cadastrado. Cadastre um garçom antes de criar pedidos.
          </div>
        )}
        <div>{status}</div>
      </div>
      <div className="stats-card">
        <h3>Cadastrar Cliente</h3>
        <form onSubmit={createCustomer}>
          <label>
            Nome do cliente
            <input
              type="text"
              value={newCustomerName}
              onChange={e=>setNewCustomerName(e.target.value)}
              placeholder="Digite o nome do cliente"
              style={{ display: 'block', width: '100%', marginTop: '8px', padding: '10px', borderRadius: '8px', border: '1px solid #dbe4ff' }}
            />
          </label>
          <label style={{ display: 'block', marginTop: '8px' }}>
            Telefone
            <input
              type="tel"
              value={newCustomerPhone}
              onChange={e=>setNewCustomerPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              style={{ display: 'block', width: '100%', marginTop: '8px', padding: '10px', borderRadius: '8px', border: '1px solid #dbe4ff' }}
            />
          </label>
          <button type="submit" className="action-button" style={{ marginTop: '12px' }} disabled={!newCustomerName.trim() || !newCustomerPhone.trim()}>
            Cadastrar cliente
          </button>
        </form>
      </div>
      <div className="tables-section">
        <h3>Mesas</h3>
        <div className="tables-grid">
          {Array.from({length:8}, (_, i) => i + 1).map(num => (
            <button
              key={num}
              type="button"
              className={"table-box" + (selectedTable === String(num) ? ' selected-table' : '')}
              onClick={() => setSelectedTable(String(num))}
            >
              Mesa {num}
            </button>
          ))}
        </div>
      </div>
      <div className="section-grid">
        <div className="page-title-row">
          <h3>Pedidos prontos</h3>
        </div>
        {readyOrders.length === 0 ? (
          <div className="stats-card">Nenhum pedido pronto para pagamento.</div>
        ) : (
          readyOrders.map((o, idx) => {
            const total = o.items.reduce((sum, it) => sum + it.product.price * it.quantity, 0)
            return (
              <div key={o.id} className="order-card">
                <div><strong>Pedido #{idx + 1}</strong> - Mesa {o.tableNumber || 'N/A'}</div>
                <div>Garçom: {o.waiter?.name || 'Garçom'}</div>
                <div>Total: R$ {total.toFixed(2)}</div>
                <ul className="order-items">
                  {o.items.map(it=> <li key={it.id}>{it.product.name} x{it.quantity}</li>)}
                </ul>
              </div>
            )
          })
        )}
      </div>
      <div>
        <h3>Produtos</h3>
        <div className="products-grid">
          {products.map(p=> (
            <div key={p.id} className="product-card">
              <div><strong>{p.name}</strong></div>
              <div>R$ {p.price.toFixed(2)}</div>
              <div>Estoque: {p.quantity}</div>
              <button onClick={()=>addItem(p)} disabled={p.quantity <= 0}>Adicionar</button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3>Itens do pedido</h3>
        <ul className="order-items">
          {items.map(i=> (
            <li key={i.product.id}>
              <div>{i.product.name} x{i.quantity}</div>
              <div>
                <button className="secondary" onClick={()=>changeQuantity(i.product.id, -1)}>-</button>
                <button className="secondary" onClick={()=>changeQuantity(i.product.id, 1)}>+</button>
                <button className="secondary" onClick={()=>removeItem(i.product.id)}>Remover</button>
              </div>
            </li>
          ))}
          {items.length===0 && <li>Nenhum item adicionado.</li>}
        </ul>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button className="action-button" onClick={submit} disabled={items.length===0 || !selectedWaiter || !selectedCustomer}>Enviar Pedido</button>
          <button className="action-button secondary" onClick={()=>setItems([])} disabled={items.length===0}>Limpar pedido</button>
        </div>
      </div>
    </div>
  )
}
