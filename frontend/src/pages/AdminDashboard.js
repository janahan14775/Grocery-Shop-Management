import { useEffect, useState } from "react";

import API from "../services/api";

function AdminDashboard() {

  const [stats, setStats] = useState({

    totalSales: 0,

    totalOrders: 0,

    totalProducts: 0

  });

  // FETCH DASHBOARD STATS
  useEffect(() => {

    fetchDashboardStats();

  }, []);

  const fetchDashboardStats = async () => {

    try {

      const res = await API.get(
        "/dashboard/stats"
      );

      setStats(res.data);

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className='container mt-5'>

      <h1 className='mb-4'>
        Admin Dashboard
      </h1>

      <div className='row'>

        {/* TOTAL SALES */}
        <div className='col-md-4 mb-4'>

          <div className='card shadow border-0 p-4 text-center'>

            <h3>Total Sales</h3>

            <h2>
              ₹ {stats.totalSales}
            </h2>

          </div>

        </div>

        {/* TOTAL ORDERS */}
        <div className='col-md-4 mb-4'>

          <div className='card shadow border-0 p-4 text-center'>

            <h3>Total Orders</h3>

            <h2>
              {stats.totalOrders}
            </h2>

          </div>

        </div>

        {/* TOTAL PRODUCTS */}
        <div className='col-md-4 mb-4'>

          <div className='card shadow border-0 p-4 text-center'>

            <h3>Total Products</h3>

            <h2>
              {stats.totalProducts}
            </h2>

          </div>

        </div>

      </div>

    </div>

  );
}

export default AdminDashboard;