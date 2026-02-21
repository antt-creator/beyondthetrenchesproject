import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Clock, ExternalLink, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  date: string;
  name: string;
  country: string;
  phone: string;
  address: string;
  qty: number;
  paymentType: string;
  status: string;
  receiptUrl: string | null;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      // ၁။ Login ဝင်ထားခြင်း ရှိ၊ မရှိ စစ်ဆေးခြင်း
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Login မရှိရင် Login page သို့ ပို့မည်
        window.location.href = '/login';
      } else {
        setUser(user);
        fetchOrders();
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Checking authorization...</div>;
  if (!user) return null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">Order Management</h2>
          <p className="text-sm text-gray-500">Logged in as: {user.email}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchOrders} className="text-sm text-indigo-600 hover:underline">Refresh</button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Date</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Customer</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Qty</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Payment</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Receipt</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-600">
                    {order.date ? format(new Date(order.date), 'MMM d, HH:mm') : 'N/A'}
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-gray-900">{order.name}</div>
                    <div className="text-xs text-gray-500">{order.phone}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{order.qty}</td>
                  <td className="p-4 text-sm text-gray-600">{order.paymentType}</td>
                  <td className="p-4">
                    {order.receiptUrl ? (
                      <a href={order.receiptUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 inline-flex items-center text-xs font-medium">
                        View <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status === 'Confirmed' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}