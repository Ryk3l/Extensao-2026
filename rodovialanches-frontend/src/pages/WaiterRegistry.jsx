import React from 'react'
import { fetchUsers, createUser, updateUser, deleteUser } from '../api'

export default function WaiterRegistry() {
  const [waiters, setWaiters] = React.useState([])
  const [formData, setFormData] = React.useState({ name: '' })
  const [status, setStatus] = React.useState('')
  const [editingId, setEditingId] = React.useState(null)
  const [lastUpdate, setLastUpdate] = React.useState(null)

  // READ: Carrega lista de garçons
  async function loadWaiters() {
    const all = await fetchUsers()
    const waitersList = all.filter(u => u.role === 'GARCOM')
    setWaiters(waitersList)
    setLastUpdate(new Date().toLocaleTimeString())
  }

  React.useEffect(() => {
    loadWaiters()
  }, [])

  // CREATE: Cadastra novo garçom
  async function handleCreate(e) {
    e.preventDefault()
    if (!formData.name.trim()) {
      setStatus('Por favor, digite um nome')
      setTimeout(() => setStatus(''), 3000)
      return
    }

    try {
      setStatus('Cadastrando garçom...')
      const result = await createUser({ name: formData.name, role: 'GARCOM' })
      if (result.ok) {
        setFormData({ name: '' })
        setStatus('Garçom cadastrado com sucesso!')
        loadWaiters()
      } else {
        setStatus(result.message || 'Erro ao cadastrar garçom')
      }
      setTimeout(() => setStatus(''), 3000)
    } catch (error) {
      setStatus('Erro ao cadastrar garçom')
      setTimeout(() => setStatus(''), 3000)
    }
  }

  // UPDATE: Edita um garçom existente
  async function handleUpdate(e) {
    e.preventDefault()
    if (!formData.name.trim()) {
      setStatus('Por favor, digite um nome')
      setTimeout(() => setStatus(''), 3000)
      return
    }

    try {
      setStatus('Atualizando garçom...')
      const result = await updateUser(editingId, { name: formData.name })
      if (result.ok) {
        setFormData({ name: '' })
        setEditingId(null)
        setStatus('Garçom atualizado com sucesso!')
        loadWaiters()
      } else {
        setStatus(result.message || 'Erro ao atualizar garçom')
      }
      setTimeout(() => setStatus(''), 3000)
    } catch (error) {
      setStatus('Erro ao atualizar garçom')
      setTimeout(() => setStatus(''), 3000)
    }
  }

  // DELETE: Remove um garçom
  async function handleDelete(id) {
    if (confirm('Tem certeza que deseja remover este garçom?')) {
      try {
        setStatus('Removendo garçom...')
        const result = await deleteUser(id)
        if (result.ok) {
          setStatus('Garçom removido com sucesso!')
          loadWaiters()
        } else {
          setStatus(result.message || 'Erro ao remover garçom')
        }
        setTimeout(() => setStatus(''), 4000)
      } catch (error) {
        setStatus('Erro ao remover garçom')
        setTimeout(() => setStatus(''), 4000)
      }
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const startEdit = (waiter) => {
    setEditingId(waiter.id)
    setFormData({ name: waiter.name })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ name: '' })
  }

  return (
    <div className="section-grid">
      <div className="page-title-row">
        <h2>Cadastro de Garçons</h2>
        <div className="badge">Atualizado: {lastUpdate || 'carregando...'}</div>
      </div>

      {/* CREATE/UPDATE: Formulário de cadastro/edição */}
      <div className="stats-card">
        <h3>{editingId ? 'Editar Garçom' : 'Novo Garçom'}</h3>
        <form onSubmit={editingId ? handleUpdate : handleCreate}>
          <label>
            Nome do Garçom
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Digite o nome do garçom"
              style={{ marginTop: '8px', marginBottom: '12px', padding: '8px', borderRadius: '6px', border: '1px solid #dbe4ff' }}
            />
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              className="action-button"
              disabled={!formData.name.trim()}
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

      {/* READ: Lista de garçons */}
      <div>
        <h3>Garçons Cadastrados</h3>
        {waiters.length === 0 ? (
          <div className="stats-card">Nenhum garçom cadastrado.</div>
        ) : (
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {waiters.map((waiter, idx) => (
              <div key={waiter.id} className="order-card">
                <div><strong>#{idx + 1}</strong></div>
                <div><strong>Nome:</strong> {waiter.name}</div>
                <div><strong>Função:</strong> {waiter.role === 'GARCOM' ? 'Garçom' : waiter.role}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    className="action-button secondary"
                    onClick={() => startEdit(waiter)}
                    style={{ flex: 1, fontSize: '0.9rem', padding: '8px' }}
                  >
                    Editar
                  </button>
                  <button
                    className="action-button secondary"
                    onClick={() => handleDelete(waiter.id)}
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
