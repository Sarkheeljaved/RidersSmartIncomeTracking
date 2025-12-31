import React, { useState, useEffect } from "react";
import "./App.css";

// TypeScript interfaces
interface RiderRecord {
  id: number;
  date: string;
  previousBudget: number;
  currentBudget: number;
  spend: number;
  privateOrder: number;
  weeklyIncome: number;
  fuel: number;
  tip: number;
  total: number;
}

interface FilterOption {
  label: string;
  days: number;
}

const App: React.FC = () => {
  // State for records
  const [records, setRecords] = useState<RiderRecord[]>([
    // { id: 1, date: "2023-10-01", previousBudget: 1990, currentBudget: 5440, spend: 150, privateOrder: 450, weeklyIncome: 2796, fuel: 200, tip: 50, total: 0 },
    // { id: 2, date: "2023-10-02", previousBudget: 5440, currentBudget: 6100, spend: 200, privateOrder: 300, weeklyIncome: 2796, fuel: 250, tip: 75, total: 0 },
    // { id: 3, date: "2023-10-03", previousBudget: 6100, currentBudget: 7200, spend: 180, privateOrder: 500, weeklyIncome: 2796, fuel: 220, tip: 60, total: 0 },
    // { id: 4, date: "2023-10-04", previousBudget: 7200, currentBudget: 6800, spend: 300, privateOrder: 400, weeklyIncome: 2796, fuel: 200, tip: 40, total: 0 },
    // { id: 5, date: "2023-10-05", previousBudget: 6800, currentBudget: 7500, spend: 220, privateOrder: 350, weeklyIncome: 2796, fuel: 180, tip: 80, total: 0 },
    // { id: 6, date: "2023-10-06", previousBudget: 7500, currentBudget: 8200, spend: 250, privateOrder: 600, weeklyIncome: 2796, fuel: 210, tip: 90, total: 0 },
    // { id: 7, date: "2023-10-07", previousBudget: 8200, currentBudget: 9000, spend: 180, privateOrder: 450, weeklyIncome: 2796, fuel: 230, tip: 70, total: 0 },
    // { id: 8, date: "2023-10-08", previousBudget: 9000, currentBudget: 8500, spend: 400, privateOrder: 300, weeklyIncome: 2796, fuel: 240, tip: 65, total: 0 },
    // { id: 9, date: "2023-10-09", previousBudget: 8500, currentBudget: 9200, spend: 210, privateOrder: 550, weeklyIncome: 2796, fuel: 190, tip: 85, total: 0 },
    // { id: 10, date: "2023-10-10", previousBudget: 9200, currentBudget: 9800, spend: 190, privateOrder: 480, weeklyIncome: 2796, fuel: 200, tip: 95, total: 0 },
  ]);

  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage] = useState<number>(7);

  // State for new record
  const [newRecord, setNewRecord] = useState<Omit<RiderRecord, "id" | "total">>(
    {
      date: new Date().toISOString().split("T")[0],
      previousBudget: 0,
      currentBudget: 0,
      spend: 0,
      privateOrder: 0,
      weeklyIncome: 0,
      fuel: 0,
      tip: 0,
    }
  );

  // State for filter
  const [filterDays, setFilterDays] = useState<number>(7);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);

  // Filter options
  const filterOptions: FilterOption[] = [
    { label: "1 Day", days: 1 },
    { label: "2 Days", days: 2 },
    { label: "4 Days", days: 4 },
    { label: "7 Days", days: 7 },
    { label: "Monthly", days: 30 },
  ];

  // Calculate total for each record
  useEffect(() => {
    const updatedRecords = records.map((record) => {
      // Calculate total: weeklyIncome + tip - spend - fuel
      const total =
        record.weeklyIncome + record.tip - record.spend - record.fuel;
      return { ...record, total };
    });
    setRecords(updatedRecords);
    const record = localStorage.getItem("riderRecords");
    record && setRecords(JSON.parse(record));
  }, []);

  // Calculate total earnings based on filter
  useEffect(() => {
    // Filter records based on selected days (simplified - using all records for now)
    const filteredRecords = [...records].slice(0, filterDays);
    const earnings = filteredRecords.reduce(
      (sum, record) => sum + record.total,
      0
    );
    setTotalEarnings(earnings);
  }, [filterDays, records]);

  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(records.length / recordsPerPage);

  // Add new record
  const handleAddRecord = () => {
    if (!newRecord.date) {
      alert("Please select a date");
      return;
    }

    // Calculate total for new record
    const total =
      newRecord.currentBudget > newRecord.previousBudget
        ? newRecord.currentBudget - newRecord.previousBudget
        : newRecord.previousBudget - newRecord.currentBudget;
    const tip =
      total -
      newRecord.weeklyIncome -
      newRecord.privateOrder -
      newRecord.spend -
      newRecord.fuel;

    // Create new record with ID
    const newRecordWithId: RiderRecord = {
      id: records.length > 0 ? Math.max(...records.map((r) => r.id)) + 1 : 1,
      ...newRecord,
      tip: tip,
      total,
    };

    // Add to records
    localStorage.setItem(
      "riderRecords",
      JSON.stringify([newRecordWithId, ...records])
    );
    setRecords([newRecordWithId, ...records]);

    // Reset form
    setNewRecord({
      date: new Date().toISOString().split("T")[0],
      previousBudget: 0,
      currentBudget: 0,
      spend: 0,
      privateOrder: 0,
      weeklyIncome: 0,
      fuel: 0,
      tip: 0,
    });
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Handle pagination click
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Calculate next page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }

    return pageNumbers;
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🍱 FoodPanda Rider Earnings</h1>
        <p className="subtitle">Track your daily earnings and expenses</p>
      </header>

      <main className="main-content">
        {/* Filter and total earnings section */}
        <section className="summary-section">
          <div className="total-earnings">
            <h2>Total Earnings</h2>
            <div className="earning-amount">
              Rs. {formatCurrency(totalEarnings)}
            </div>
            <p className="filter-label">Showing earnings for:</p>
          </div>

          <div className="filter-options">
            {filterOptions.map((option) => (
              <button
                key={option.days}
                className={`filter-btn ${
                  filterDays === option.days ? "active" : ""
                }`}
                onClick={() => setFilterDays(option.days)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* Add new record form */}
        <section className="add-record-section">
          <h2>Add Daily Record</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                value={newRecord.date}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, date: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="previousBudget">Previous Budget (Rs.)</label>
              <input
                type="number"
                id="previousBudget"
                value={newRecord.previousBudget}
                onChange={(e) =>
                  setNewRecord({
                    ...newRecord,
                    previousBudget: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="currentBudget">Current Budget (Rs.)</label>
              <input
                type="number"
                id="currentBudget"
                value={newRecord.currentBudget}
                onChange={(e) =>
                  setNewRecord({
                    ...newRecord,
                    currentBudget: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="spend">Spend (Rs.)</label>
              <input
                type="number"
                id="spend"
                value={newRecord.spend}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, spend: Number(e.target.value) })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="privateOrder">Private Order (Rs.)</label>
              <input
                type="number"
                id="privateOrder"
                value={newRecord.privateOrder}
                onChange={(e) =>
                  setNewRecord({
                    ...newRecord,
                    privateOrder: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="weeklyIncome">Weekly Income (Rs.)</label>
              <input
                type="number"
                id="weeklyIncome"
                value={newRecord.weeklyIncome}
                onChange={(e) =>
                  setNewRecord({
                    ...newRecord,
                    weeklyIncome: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="fuel">Fuel (Rs.)</label>
              <input
                type="number"
                id="fuel"
                value={newRecord.fuel}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, fuel: Number(e.target.value) })
                }
              />
            </div>

            {/* <div className="form-group">
              <label htmlFor="tip">Tip (Rs.)</label>
              <input
                type="number"
                id="tip"
                value={newRecord.tip}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, tip: Number(e.target.value) })
                }
              />
            </div> */}
          </div>

          <button className="add-btn" onClick={handleAddRecord}>
            + Add Daily Record
          </button>
        </section>

        {/* Records table */}
        <section className="records-section">
          <h2>Daily Records</h2>

          <div className="table-container">
            <table className="records-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Previous Budget</th>
                  <th>Current Budget</th>
                  <th>Spend</th>
                  <th>Private Order</th>
                  <th>Weekly Income</th>
                  <th>Fuel</th>
                  <th>Tip</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>Rs. {formatCurrency(record.previousBudget)}</td>
                    <td>Rs. {formatCurrency(record.currentBudget)}</td>
                    <td className="expense">
                      -Rs. {formatCurrency(record.spend)}
                    </td>
                    <td>Rs. {formatCurrency(record.privateOrder)}</td>
                    <td className="income">
                      Rs. {formatCurrency(record.weeklyIncome)}
                    </td>
                    <td className="expense">
                      -Rs. {formatCurrency(record.fuel)}
                    </td>
                    <td className="income">Rs. {formatCurrency(record.tip)}</td>
                    <td
                      className={`total ${
                        record.total >= 0 ? "positive" : "negative"
                      }`}
                    >
                      Rs. {formatCurrency(record.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage > 0 && currentPage === 1}
            >
              ← Previous
            </button>

            <div className="page-numbers">
              {getPageNumbers().map((number) => (
                <button
                  key={number}
                  className={`page-number ${
                    currentPage === number ? "active" : ""
                  }`}
                  onClick={() => paginate(number)}
                >
                  {number}
                </button>
              ))}
            </div>

            <button
              className="pagination-btn"
              onClick={() => paginate(currentPage + 1)}
              disabled={ records.length < 6 && currentPage === 1 || currentPage >= totalPages} 
            >
              Next →
            </button>
          </div>

          <div className="records-info">
            Showing {indexOfFirstRecord + 1} to{" "}
            {Math.min(indexOfLastRecord, records.length)} of {records.length}{" "}
            records
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          FoodPanda Rider Inventory App • Track your daily earnings and expenses
        </p>
      </footer>
    </div>
  );
};

export default App;
