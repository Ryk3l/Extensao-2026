const API = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const ORDER_STATUS_LABELS = {
  NEW: 'Novo',
  PENDING_PREPARATION: 'Aguardando preparo',
  PREPARING: 'Em preparo',
  READY_FOR_PAYMENT: 'Pronto para pagamento',
  PAID: 'Pago',
  CANCELLED: 'Cancelado',
}

export function statusLabel(status){
  return ORDER_STATUS_LABELS[status] || status
}

export async function fetchProducts(){
  const res = await fetch(`${API}/api/products`)
  return res.json()
}

export async function fetchUsers(){
  const res = await fetch(`${API}/api/users`)
  return res.json()
}

export async function createOrder(order){
  const res = await fetch(`${API}/api/orders`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(order)
  })
  return res.json()
}

export async function createUser({ name, role, phone }){
  const endpoint = role === 'GARCOM' ? 'waiters' : 'customers'
  const body = role === 'CLIENTE' ? { name, phone } : { name }
  const res = await fetch(`${API}/api/users/${endpoint}`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(body)
  })
  if (res.ok) return { ok: true, user: await res.json() }
  const message = await res.text().catch(()=>'')
  return { ok: false, message: message || 'Erro ao cadastrar usuário.' }
}

export async function updateUser(id, { name, phone }){
  const body = {}
  if (name !== undefined) body.name = name
  if (phone !== undefined) body.phone = phone
  const res = await fetch(`${API}/api/users/${id}`,{
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(body)
  })
  if (res.ok) return { ok: true, user: await res.json() }
  const message = await res.text().catch(()=>'')
  return { ok: false, message: message || 'Erro ao atualizar usuário.' }
}

export async function deleteUser(id){
  const res = await fetch(`${API}/api/users/${id}`,{
    method:'DELETE',
    headers:{'Content-Type':'application/json'}
  })
  if (res.status === 204 || res.ok) return { ok: true }
  const message = await res.text().catch(()=>'')
  return { ok: false, message: message || 'Erro ao remover usuário.' }
}

export async function listOrders(){
  const res = await fetch(`${API}/api/orders`)
  return res.json()
}

export async function updateOrderStatus(id, status){
  const res = await fetch(`${API}/api/orders/${id}/status?status=${status}`,{method:'PUT'})
  return res.json()
}

export async function deleteOrder(id){
  const res = await fetch(`${API}/api/orders/${id}`,{method:'DELETE'})
  if (res.status === 204 || res.ok) return { ok: true }
  const message = await res.text().catch(()=>'')
  return { ok: false, message: message || 'Erro ao remover pedido.' }
}

export async function updateProductStock(id, delta){
  const res = await fetch(`${API}/api/products/${id}/stock?delta=${delta}`,{method:'PUT'})
  if (res.ok) return { ok: true, product: await res.json() }
  const message = await res.text().catch(()=>'')
  return { ok: false, message: message || 'Erro ao atualizar estoque.' }
}

export async function setProductQuantity(id, quantity){
  const res = await fetch(`${API}/api/products/${id}/quantity?quantity=${quantity}`,{method:'PUT'})
  if (res.ok) return { ok: true, product: await res.json() }
  const message = await res.text().catch(()=>'')
  return { ok: false, message: message || 'Erro ao atualizar estoque.' }
}

export async function createProduct({ name, price, quantity }){
  const res = await fetch(`${API}/api/products`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ name, price, quantity })
  })
  if (res.ok) return { ok: true, product: await res.json() }
  const message = await res.text().catch(()=>'')
  return { ok: false, message: message || 'Erro ao cadastrar produto.' }
}

export async function updateProduct(id, { name, price }){
  const body = {}
  if (name !== undefined) body.name = name
  if (price !== undefined) body.price = price
  const res = await fetch(`${API}/api/products/${id}`,{
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(body)
  })
  if (res.ok) return { ok: true, product: await res.json() }
  const message = await res.text().catch(()=>'')
  return { ok: false, message: message || 'Erro ao atualizar produto.' }
}

export async function deleteProduct(id){
  const res = await fetch(`${API}/api/products/${id}`,{method:'DELETE'})
  if (res.status === 204 || res.ok) return { ok: true }
  const message = await res.text().catch(()=>'')
  return { ok: false, message: message || 'Erro ao remover produto.' }
}
