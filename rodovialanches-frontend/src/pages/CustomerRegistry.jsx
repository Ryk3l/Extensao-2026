import React from 'react'
import { fetchUsers, createUser, updateUser, deleteUser } from '../api'

export default function CustomerRegistry() {
  const [customers, setCustomers] = React.useState([])
  const [formData, setFormData] = React.useState({ name: '', phone: '' })
  const [status, setStatus] = React.useState('')
  const [editingId, setEditingId] = React.useState(null)
  const [lastUpdate, setLastUpdate] = React.useState(null)

  // READ: Carrega lista de clientes
  async function loadCustomers() {
    const all = await fetchUsers()
    const customersList = all.filter(u => u.role === 'CLIENTE')
    setCustomers(customersList)
    setLastUpdate(new Date().toLocaleTimeString())
  }

  React.useEffect(() => {
    loadCustomers()
  }, [])

  // CREATE: Cadastra novo cliente
  async function handleCreate(e) {
    e.preventDefault()
    if (!formData.name.trim() || !formData.phone.trim()) {
      setStatus('Por favor, informe nome e telefone')
      setTimeout(() => setStatus(''), 3000)
      return
    }

    try {
      setStatus('Cadastrando cliente...')
      const result = await createUser({ name: formData.name, phone: formData.phone, role: 'CLIENTE' })
      if (result.ok) {
        setFormData({ name: '', phone: '' })
        setStatus('Cliente cadastrado com sucesso!')
        loadCustomers()
      } else {
        setStatus(result.message || 'Erro ao cadastrar cliente')
      }
      setTimeout(() => setStatus(''), 3500)
    } catch (error) {
      setStatus('Erro ao cadastrar cliente')
      setTimeout(() => setStatus(''), 3000)
    }
  }

  // UPDATE: Edita um cliente existente
  async function handleUpdate(e) {
    e.preventDefault()
    if (!formData.name.trim() || !formData.phone.trim()) {
      setStatus('Por favor, informe nome e telefone')
      setTimeout(() => setStatus(''), 3000)
      return
    }

    try {
      setStatus('Atualizando cliente...')
      const result = await updateUser(editingId, { name: formData.name, phone: formData.phone })
      if (result.ok) {
        setFormData({ name: '', phone: '' })
        setEditingId(null)
        setStatus('Cliente atualizado com sucesso!')
        loadCustomers()
      } else {
        setStatus(result.message || 'Erro ao atualizar cliente')
      }
      setTimeout(() => setStatus(''), 3500)
    } catch (error) {
      setStatus('Erro ao atualizar cliente')
      setTimeout(() => setStatus(''), 3000)
    }
  }

  // DELETE: Remove um cliente
  async function handleDelete(id) {
    if (confirm('Tem certeza que deseja remover este cliente?')) {
      try {
        setStatus('Removendo cliente...')
        const result = await deleteUser(id)
        if (result.ok) {
          setStatus('Cliente removido com sucesso!')
          loadCustomers()
        } else {
          setStatus(result.message || 'Erro ao remover cliente')
        }
        setTimeout(() => setStatus(''), 4000)
      } catch (error) {
        setStatus('Erro ao remover cliente')
        setTimeout(() => setStatus(''), 4000)
      }
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const startEdit = (customer) => {
    setEditingId(customer.id)
    setFormData({ name: customer.name, phone: customer.phone || '' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ name: '', phone: '' })
  }

  return (
    <div className="section-grid">
      <div className="page-title-row">
        <h2>Cadastro de Clientes</h2>
        <div className="badge">Atualizado: {lastUpdate || 'carregando...'}</div>
      </div>

      {/* CREATE/UPDATE: Formulário de cadastro/edição */}
      <div className="stats-card">
        <h3>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
        <form onSubmit={editingId ? handleUpdate : handleCreate}>
          <label>
            Nome do Cliente
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Digite o nome do cliente"
              style={{ display: 'block', width: '100%', marginTop: '8px', marginBottom: '12px', padding: '8px', borderRadius: '6px', border: '1px solid #dbe4ff' }}
            />
          </label>
          <label>
            Telefone
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(00) 00000-0000"
              style={{ display: 'block', width: '100%', marginTop: '8px', marginBottom: '12px', padding: '8px', borderRadius: '6px', border: '1px solid #dbe4ff' }}
            />
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              className="action-button"
              disabled={!formData.name.trim() || !formData.phone.trim()}
            >
              {editingId ? 'Atualizar' : 'Cadastrar'}
            </button>
            {editingId && (
              <button
                type="button"
                className="action-button secondary"
                onClick={cancelEdit}
              >
                Cancelar
              </button>
            )}
          </div>
          {status && <div style={{ marginTop: '12px', color: status.includes('Erro') ? '#d32f2f' : '#388e3c' }}>{status}</div>}
        </form>
      </div>

      {/* READ: Lista de clientes */}
      <div>
        <h3>Clientes Cadastrados</h3>
        {customers.length === 0 ? (
          <div className="stats-card">Nenhum cliente cadastrado.</div>
        ) : (
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {customers.map((customer, idx) => (
              <div key={customer.id} className="order-card">
                <div><strong>#{idx + 1}</strong></div>
                <div><strong>Nome:</strong> {customer.name}</div>
                <div><strong>Telefone:</strong> {customer.phone || '-'}</div>
                <div><strong>Função:</strong> {customer.role === 'CLIENTE' ? 'Cliente' : customer.role}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    className="action-button secondary"
                    onClick={() => startEdit(customer)}
                    style={{ flex: 1, fontSize: '0.9rem', padding: '8px' }}
                  >
                    Editar
                  </button>
                  <button
                    className="action-button secondary"
                    onClick={() => handleDelete(customer.id)}
                    style={{ flex: 1, fontSize: '0.9rem', padding: '8px', background: '#d32f2f' }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
