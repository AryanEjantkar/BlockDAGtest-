export default function Transactions() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
      <ul className="space-y-2">
        <li className="p-4 bg-gray-100 rounded">+ ₹5000 - Freelance Payment</li>
        <li className="p-4 bg-gray-100 rounded">- ₹1200 - Groceries</li>
        <li className="p-4 bg-gray-100 rounded">- ₹800 - Utilities</li>
      </ul>
    </div>
  );
}
