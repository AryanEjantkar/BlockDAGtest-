import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-6 space-y-4">
      <h1 className="text-xl font-bold">AI Wallet</h1>
      <nav className="flex flex-col space-y-2">
        <Link to="/" className="hover:text-green-400">Dashboard</Link>
        <Link to="/transactions" className="hover:text-green-400">Transactions</Link>
        <Link to="/add" className="hover:text-green-400">Add Transaction</Link>
        <Link to="/insights" className="hover:text-green-400">Insights</Link>
      </nav>
    </div>
  );
}
