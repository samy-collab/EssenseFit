export function AdminPage() {
  return (
    <section className="space-y-6">
      <div className="card bg-[linear-gradient(135deg,#3e2a23_0%,#6a493e_60%,#c58f68_120%)] text-white">
        <p className="text-sm uppercase tracking-[0.2em] text-white/70">Painel Admin</p>
        <h2 className="mt-4 font-display text-5xl">Controle da operacao Essence Fit</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="card"><p className="text-sm text-clay">Produtos ativos</p><p className="mt-4 font-display text-5xl">API</p></div>
        <div className="card"><p className="text-sm text-clay">Pedidos</p><p className="mt-4 font-display text-5xl">ADMIN</p></div>
        <div className="card"><p className="text-sm text-clay">Check-ins</p><p className="mt-4 font-display text-5xl">CLIENTES</p></div>
        <div className="card"><p className="text-sm text-clay">Cupons</p><p className="mt-4 font-display text-5xl">REGRAS</p></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card">
          <h3 className="font-display text-3xl text-espresso">Acoes rapidas</h3>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="button-primary" type="button">Novo produto</button>
            <button className="button-secondary" type="button">Novo cupom</button>
            <button className="button-secondary" type="button">Ver pedidos</button>
          </div>
        </div>
        <div className="card">
          <h3 className="font-display text-3xl text-espresso">Regras do painel</h3>
          <ul className="mt-5 space-y-3 text-espresso/75">
            <li>Apenas administradoras podem cadastrar, editar e remover produtos.</li>
            <li>Pedidos podem ser acompanhados e aprovados pelo painel.</li>
            <li>Check-ins e cupons ficam visiveis para monitoramento de engajamento.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
