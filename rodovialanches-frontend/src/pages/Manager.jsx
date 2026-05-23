import React from 'react'
import { listOrders, fetchProducts, deleteOrder, deleteProduct, setProductQuantity, createProduct, updateProduct, statusLabel } from '../api'

export default function Manager(){
  const [orders, setOrders] = React.useState([])
  const [products, setProducts] = React.useState([])
  const [lastUpdate, setLastUpdate] = React.useState(null)
  const [status, setStatus] = React.useState('')
  const [newProduct, setNewProduct] = React.useState({ name: '', price: '', quantity: '' })
  const [editingProductId, setEditingProductId] = React.useState(null)
  const [editingName, setEditingName] = React.useState('')
  const [editingPrice, setEditingPrice] = React.useState('')
  const [editingQuantity, setEditingQuantity] = React.useState('')

  async function load(){
    const [all, products] = await Promise.all([listOrders(), fetchProducts()])
    setOrders([...all].sort((a, b) => a.id - b.id))
    setProducts([...products].sort((a, b) => a.id - b.id))
    setLastUpdate(new Date().toLocaleTimeString())
  }

  React.useEffect(()=>{ load(); const t = setInterval(load,3000); return ()=>clearInterval(t); },[])

  async function handleDelete(id, position){
    if (!confirm(`Excluir definitivamente o pedido #${position}?`)) return
    const result = await deleteOrder(id)
    if (result.ok) {
      setStatus(`Pedido #${position} removido.`)
      load()
    } else {
      setStatus(result.message || 'Erro ao remover pedido')
    }
    setTimeout(()=>setStatus(''), 4000)
  }

  async function handleDeleteProduct(productId, productName){
    if (!confirm(`Excluir definitivamente o produto "${productName}"?`)) return
    const result = await deleteProduct(productId)
    if (result.ok) {
      setStatus(`Produto "${productName}" removido.`)
      load()
    } else {
      setStatus(result.message || 'Erro ao remover produto')
    }
    setTimeout(()=>setStatus(''), 4000)
  }

  function startEditProduct(product){
    setEditingProductId(product.id)
    setEditingName(product.name)
    setEditingPrice(String(product.price ?? ''))
    setEditingQuantity(String(product.quantity ?? 0))
  }

  function cancelEditProduct(){
    setEditingProductId(null)
    setEditingName('')
    setEditingPrice('')
    setEditingQuantity('')
  }

  async function saveEditProduct(productId){
    const name = editingName.trim()
    const price = Number(editingPrice)
    const quantity = Number(editingQuantity)
    if (!name) {
      setStatus('Nome não pode ficar vazio.')
      setTimeout(()=>setStatus(''), 3000)
      return
    }
    if (editingPrice === '' || Number.isNaN(price) || price < 0) {
      setStatus('Preço inválido.')
      setTimeout(()=>setStatus(''), 3000)
      return
    }
    if (editingQuantity === '' || Number.isNaN(quantity) || quantity < 0) {
      setStatus('Quantidade inválida.')
      setTimeout(()=>setStatus(''), 3000)
      return
    }
    const updateResult = await updateProduct(productId, { name, price })
    if (!updateResult.ok) {
      setStatus(updateResult.message || 'Erro ao atualizar produto')
      setTimeout(()=>setStatus(''), 3000)
      return
    }
    const qtyResult = await setProductQuantity(productId, quantity)
    if (!qtyResult.ok) {
      setStatus(qtyResult.message || 'Erro ao atualizar estoque')
      setTimeout(()=>setStatus(''), 3000)
      return
    }
    cancelEditProduct()
    load()
  }

  async function handleCreateProduct(e){
    e.preventDefault()
    const name = newProduct.name.trim()
    const price = Number(newProduct.price)
    const quantity = newProduct.quantity === '' ? 0 : Number(newProduct.quantity)
    if (!name) {
      setStatus('Nome do produto é obrigatório.')
      setTimeout(()=>setStatus(''), 3000)
      return
    }
    if (Number.isNaN(price) || price < 0) {
      setStatus('Preço inválido.')
      setTimeout(()=>setStatus(''), 3000)
      return
    }
    if (Number.isNaN(quantity) || quantity < 0) {
      setStatus('Quantidade inválida.')
      setTimeout(()=>setStatus(''), 3000)
      return
    }
    const result = await createProduct({ name, price, quantity })
    if (result.ok) {
      setStatus(`Produto "${name}" cadastrado.`)
      setNewProduct({ name: '', price: '', quantity: '' })
      load()
    } else {
      setStatus(result.message || 'Erro ao cadastrar produto')
    }
    setTimeout(()=>setStatus(''), 3000)
  }

  const summary = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="section-grid">
      <div className="page-title-row">
        <h2>Gerente</h2>
        <div className="badge">Atualizado: {lastUpdate || '-'}</div>
      </div>
      <div className="stats-card">
        <div>Total de pedidos: {orders.length}</div>
        <div>Pedidos por status:</div>
        <ul>
          {Object.entries(summary).map(([statusKey, count]) => (
            <li key={statusKey}>{statusLabel(statusKey)}: {count}</li>
          ))}
        </ul>
        {status && <div style={{ marginTop: '8px', color: status.includes('Erro') ? '#d32f2f' : '#388e3c' }}>{status}</div>}
      </div>
      <div>
        <h3>Pedidos</h3>
        {orders.length === 0 ? (
          <div>Nenhum pedido registrado.</div>
        ) : (
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {orders.map((o, idx) => {
              const total = (o.items || []).reduce((sum, it) => sum + it.product.price * it.quantity, 0)
              return (
                <div key={o.id} className="order-card">
                  <div><strong>Pedido #{idx + 1}</strong></div>
                  <div>Status: {statusLabel(o.status)}</div>
                  <div>Mesa: {o.tableNumber ?? 'N/A'}</div>
                  <div>Garçom: {o.waiter?.name || '-'}</div>
                  <div>Cliente: {o.customer?.name || '-'}</div>
                  <div>Total: R$ {total.toFixed(2)}</div>
                  <ul className="order-items">
                    {(o.items || []).map(it => <li key={it.id}>{it.product.name} x{it.quantity}</li>)}
                  </ul>
                  <button
                    className="action-button"
                    onClick={() => handleDelete(o.id, idx + 1)}
                    style={{ background: '#d32f2f', marginTop: '8px' }}
                  >
                    Excluir pedido
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div>
        <h3>Cadastrar novo produto</h3>
        <form onSubmit={handleCreateProduct} className="stats-card" style={{ display: 'grid', gap: '8px', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', alignItems: 'end' }}>
          <label>
            Nome
            <input
              type="text"
              value={newProduct.name}
              onChange={e=>setNewProduct({...newProduct, name: e.target.value})}
              placeholder="Ex: X-Bacon"
              style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px', borderRadius: '6px', border: '1px solid #dbe4ff' }}
            />
          </label>
          <label>
            Preço (R$)
            <input
              type="number"
              step="0.01"
              min="0"
              value={newProduct.price}
              onChange={e=>setNewProduct({...newProduct, price: e.target.value})}
              placeholder="0,00"
              style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px', borderRadius: '6px', border: '1px solid #dbe4ff' }}
            />
          </label>
          <label>
            Estoque inicial
            <input
              type="number"
              min="0"
              value={newProduct.quantity}
              onChange={e=>setNewProduct({...newProduct, quantity: e.target.value})}
              placeholder="0"
              style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px', borderRadius: '6px', border: '1px solid #dbe4ff' }}
            />
          </label>
          <button type="submit" className="action-button" style={{ height: 'fit-content' }}>
            Cadastrar produto
          </button>
        </form>
      </div>
      <div>
        <h3>Estoque dos produtos</h3>
        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {products.map(p=> (
            <div key={p.id} className="product-card">
              {editingProductId === p.id ? (
                <div style={{ display: 'grid', gap: '6px', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.85rem' }}>
                    Nome
                    <input
                      type="text"
                      value={editingName}
                      onChange={e=>setEditingName(e.target.value)}
                      onKeyDown={e=>{
                        if (e.key === 'Enter') { e.preventDefault(); saveEditProduct(p.id) }
                        if (e.key === 'Escape') { e.preventDefault(); cancelEditProduct() }
                      }}
                      autoFocus
                      style={{ display: 'block', width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #dbe4ff', marginTop: '2px' }}
                    />
                  </label>
                  <label style={{ fontSize: '0.85rem' }}>
                    Preço (R$)
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingPrice}
                      onChange={e=>setEditingPrice(e.target.value)}
                      onKeyDown={e=>{
                        if (e.key === 'Enter') { e.preventDefault(); saveEditProduct(p.id) }
                        if (e.key === 'Escape') { e.preventDefault(); cancelEditProduct() }
                      }}
                      style={{ display: 'block', width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #dbe4ff', marginTop: '2px' }}
                    />
                  </label>
                  <label style={{ fontSize: '0.85rem' }}>
                    Estoque
                    <input
                      type="number"
                      min="0"
                      value={editingQuantity}
                      onChange={e=>setEditingQuantity(e.target.value)}
                      onKeyDown={e=>{
                        if (e.key === 'Enter') { e.preventDefault(); saveEditProduct(p.id) }
                        if (e.key === 'Escape') { e.preventDefault(); cancelEditProduct() }
                      }}
                      style={{ display: 'block', width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #dbe4ff', marginTop: '2px' }}
                    />
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="secondary" onClick={()=>saveEditProduct(p.id)} style={{ flex: 1 }}>Salvar</button>
                    <button className="secondary" onClick={cancelEditProduct} style={{ flex: 1 }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                    <strong>{p.name}</strong>
                    <button className="secondary" onClick={()=>startEditProduct(p)} style={{ padding: '4px 8px', fontSize: '0.85rem' }}>Editar</button>
                  </div>
                  <div>Preço: R$ {p.price.toFixed(2)}</div>
                  <div>Quantidade em estoque: {p.quantity}</div>
                </>
              )}
              <button
                onClick={() => handleDeleteProduct(p.id, p.name)}
                style={{ marginTop: '12px', background: '#d32f2f', width: '100%' }}
              >
                Excluir produto
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
