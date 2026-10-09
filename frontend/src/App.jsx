import { useState } from 'react';
import LoginForm from './modules/auth/components/LoginForm';
import RegisterForm from './modules/auth/components/RegisterForm';
import ProductList from './modules/catalog/components/ProductList';
import ProductForm from './modules/catalog/components/ProductForm';
import OrderList from './modules/orders/components/OrderList';
import OrderForm from './modules/orders/components/OrderForm';
import Dashboard from './modules/analytics/components/Dashboard';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [vista, setVista] = useState('gestion'); // 'gestion' | 'dashboard' (solo admin)

  if (!usuario) {
    return (
      <div className="auth-layout">
        <div className="auth-panel">
          <LoginForm onLoginExitoso={setUsuario} />
        </div>
        <div className="auth-panel">
          <RegisterForm onRegistroExitoso={setUsuario} />
        </div>
      </div>
    );
  }

  const esAdmin = usuario.rol === 'administrador';
  const refrescar = () => setRefreshKey((k) => k + 1);

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>Ecommerce</h1>
        <span className="app-header__usuario">
          {usuario.nombre} <span className="badge badge--rol">{usuario.rol}</span>
          <button type="button" className="btn btn--secondary btn--small" onClick={() => setUsuario(null)}>
            Salir
          </button>
        </span>
      </header>

      {/* Pestañas: el dashboard existe únicamente para el administrador */}
      {esAdmin && (
        <nav className="tabs">
          <button
            type="button"
            className={`tab ${vista === 'gestion' ? 'tab--activa' : ''}`}
            onClick={() => setVista('gestion')}
          >
            Gestión
          </button>
          <button
            type="button"
            className={`tab ${vista === 'dashboard' ? 'tab--activa' : ''}`}
            onClick={() => setVista('dashboard')}
          >
            Dashboard
          </button>
        </nav>
      )}

      <main className="app-main">
        {esAdmin && vista === 'dashboard' ? (
          <Dashboard usuarioId={usuario.id} />
        ) : (
          <>
            {esAdmin && <ProductForm onCreado={refrescar} />}

            <ProductList refreshKey={refreshKey} esAdmin={esAdmin} onCambio={refrescar} />

            {!esAdmin && (
              <>
                <OrderForm usuarioId={usuario.id} onPedidoCreado={refrescar} />
                <OrderList usuarioId={usuario.id} refreshKey={refreshKey} esAdmin={esAdmin} onCambio={refrescar} />
              </>
            )}

            {esAdmin && <OrderList refreshKey={refreshKey} verTodos esAdmin={esAdmin} onCambio={refrescar} />}
          </>
        )}
      </main>
    </div>
  );
}
