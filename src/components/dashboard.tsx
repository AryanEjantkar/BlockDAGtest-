export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Welcome Back!</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">Balance: ₹50,000</div>
        <div className="p-4 bg-white rounded-lg shadow">Expenses: ₹20,000</div>
        <div className="p-4 bg-white rounded-lg shadow">Savings: ₹30,000</div>
      </div>
    </div>
  );
}
