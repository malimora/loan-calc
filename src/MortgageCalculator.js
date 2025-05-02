import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MortgageCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(5160519);
  const [interestRate, setInterestRate] = useState(6.8);
  const [loanTerm, setLoanTerm] = useState(20);
  const [extraPayment, setExtraPayment] = useState(0);
  const [yearlyLumpSum, setYearlyLumpSum] = useState(0);
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [payoffTime, setPayoffTime] = useState(0);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    calculateLoan();
  }, [loanAmount, interestRate, loanTerm, extraPayment, yearlyLumpSum]);

  const calculateLoan = () => {
    // Convert annual values to monthly
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTerm * 12;
    
    // Calculate base monthly payment (PMT formula)
    const baseMonthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                          (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    setMonthlyPayment(baseMonthlyPayment);
    
    // Generate amortization schedule
    let balance = loanAmount;
    let totalPaid = 0;
    let totalInterestPaid = 0;
    let month = 1;
    const schedule = [];
    let yearlyData = {
      year: 1,
      beginningBalance: balance,
      totalPayment: 0,
      totalInterest: 0,
      totalPrincipal: 0,
      endingBalance: 0
    };
    
    while (balance > 0 && month <= totalMonths * 2) { // Set a reasonable upper limit to prevent infinite loops
      // Calculate interest for this period
      const interestPayment = balance * monthlyRate;
      
      // Calculate regular principal for this period
      let principalPayment = baseMonthlyPayment - interestPayment;
      
      // Add extra payment if applicable
      principalPayment += extraPayment;
      
      // Add yearly lump sum in December
      if (month % 12 === 0 && yearlyLumpSum > 0) {
        principalPayment += yearlyLumpSum;
      }
      
      // Make sure we don't overpay
      if (principalPayment > balance) {
        principalPayment = balance;
      }
      
      // Update balance
      balance -= principalPayment;
      
      // Update totals
      totalPaid += (principalPayment + interestPayment);
      totalInterestPaid += interestPayment;
      
      // Update yearly data
      yearlyData.totalPayment += (principalPayment + interestPayment);
      yearlyData.totalInterest += interestPayment;
      yearlyData.totalPrincipal += principalPayment;
      
      // If end of year or loan is paid off, add to schedule
      if (month % 12 === 0 || balance <= 0) {
        yearlyData.endingBalance = balance;
        schedule.push({...yearlyData});
        
        // Start new year
        if (balance > 0) {
          yearlyData = {
            year: yearlyData.year + 1,
            beginningBalance: balance,
            totalPayment: 0,
            totalInterest: 0,
            totalPrincipal: 0,
            endingBalance: 0
          };
        }
      }
      
      // Break if balance is zero or negative
      if (balance <= 0) {
        break;
      }
      
      month++;
    }
    
    setAmortizationSchedule(schedule);
    setTotalInterest(totalInterestPaid);
    setTotalPayments(totalPaid);
    setPayoffTime(month / 12);
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Prepare data for charts
  const prepareChartData = () => {
    return amortizationSchedule.map(item => ({
      name: `Year ${item.year}`,
      principal: item.totalPrincipal,
      interest: item.totalInterest,
      balance: item.endingBalance
    }));
  };

  const preparePieData = () => {
    return [
      { name: 'Principal', value: loanAmount },
      { name: 'Interest', value: totalInterest }
    ];
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Housing Loan Calculator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Loan Inputs</h2>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Loan Amount (PHP)</label>
            <input 
              type="number" 
              value={loanAmount} 
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
            <input 
              type="number" 
              value={interestRate} 
              onChange={(e) => setInterestRate(Number(e.target.value))}
              step="0.1"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Loan Term (years)</label>
            <input 
              type="number" 
              value={loanTerm} 
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <h2 className="text-lg font-semibold mt-4 mb-3">Extra Payment Options</h2>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Extra Monthly Payment (PHP)</label>
            <input 
              type="number" 
              value={extraPayment} 
              onChange={(e) => setExtraPayment(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Yearly Lump Sum (PHP)</label>
            <input 
              type="number" 
              value={yearlyLumpSum} 
              onChange={(e) => setYearlyLumpSum(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Loan Summary</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Monthly Payment:</p>
              <p className="text-xl font-bold">{formatCurrency(monthlyPayment + extraPayment)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Total Interest:</p>
              <p className="text-xl font-bold">{formatCurrency(totalInterest)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Total Payments:</p>
              <p className="text-xl font-bold">{formatCurrency(totalPayments)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Payoff Time:</p>
              <p className="text-xl font-bold">{payoffTime.toFixed(1)} years</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Interest Savings:</p>
              <p className="text-xl font-bold">{formatCurrency(loanAmount * (interestRate/100) * loanTerm - totalInterest)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Time Saved:</p>
              <p className="text-xl font-bold">{(loanTerm - payoffTime).toFixed(1)} years</p>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Payment Breakdown</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={preparePieData()}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {preparePieData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Balance and Payment Visualization</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={prepareChartData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatCurrency(value).replace('PHP', '')} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="balance" stroke="#8884d8" name="Remaining Balance" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Principal vs Interest by Year</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={prepareChartData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatCurrency(value).replace('PHP', '')} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="principal" stackId="a" fill="#00C49F" name="Principal" />
            <Bar dataKey="interest" stackId="a" fill="#FF8042" name="Interest" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-3">Amortization Schedule</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Year</th>
                <th className="py-2 px-4 border">Beginning Balance</th>
                <th className="py-2 px-4 border">Total Payment</th>
                <th className="py-2 px-4 border">Principal</th>
                <th className="py-2 px-4 border">Interest</th>
                <th className="py-2 px-4 border">Ending Balance</th>
              </tr>
            </thead>
            <tbody>
              {amortizationSchedule.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="py-2 px-4 border">{row.year}</td>
                  <td className="py-2 px-4 border">{formatCurrency(row.beginningBalance)}</td>
                  <td className="py-2 px-4 border">{formatCurrency(row.totalPayment)}</td>
                  <td className="py-2 px-4 border">{formatCurrency(row.totalPrincipal)}</td>
                  <td className="py-2 px-4 border">{formatCurrency(row.totalInterest)}</td>
                  <td className="py-2 px-4 border">{formatCurrency(row.endingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h2 className="text-lg font-semibold mb-2">Calculation Formulas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium">Monthly Payment</h3>
            <p className="text-sm">PMT = P × [r(1+r)^n] ÷ [(1+r)^n - 1]</p>
            <p className="text-sm mt-1">Where:</p>
            <ul className="text-sm list-disc ml-5">
              <li>PMT = monthly payment</li>
              <li>P = principal (loan amount)</li>
              <li>r = monthly interest rate (annual rate ÷ 12 ÷ 100)</li>
              <li>n = total number of payments (years × 12)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium">Monthly Interest</h3>
            <p className="text-sm">Interest = Outstanding Balance × Monthly Rate</p>
          </div>
          
          <div>
            <h3 className="font-medium">Monthly Principal</h3>
            <p className="text-sm">Principal = Monthly Payment - Interest</p>
          </div>
          
          <div>
            <h3 className="font-medium">Remaining Balance</h3>
            <p className="text-sm">New Balance = Previous Balance - Principal Payment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;