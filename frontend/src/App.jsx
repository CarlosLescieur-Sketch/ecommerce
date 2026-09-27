import { useState } from 'react';
import LoginForm from './modules/auth/components/LoginForm';
import RegisterForm from './modules/auth/components/RegisterForm';
import ProductList from './modules/catalog/components/ProductList';
import ProductForm from './modules/catalog/components/ProductForm';
import OrderList from './modules/orders/components/OrderList';
import OrderForm from './modules/orders/components/OrderForm';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>Ecommerce</h1>
        <span className="app-header__usuario">
          {usuario.nombre} <span className="badge badge--rol">{usuario.rol}</span>
        </span>
      </header>

      <main className="app-main">
        {esAdmin && <ProductForm onCreado={() => setRefreshKey((k) => k + 1)} />}

        <ProductList refreshKey={refreshKey} esAdmin={esAdmin} onCambio={() => setRefreshKey((k) => k + 1)} />

        {!esAdmin && (
          <>
            <OrderForm usuarioId={usuario.id} onPedidoCreado={() => setRefreshKey((k) => k + 1)} />
            <OrderList usuarioId={usuario.id} refreshKey={refreshKey} />
          </>
        )}

        {esAdmin && <OrderList refreshKey={refreshKey} verTodos />}
      </main>
    </div>
  );
}