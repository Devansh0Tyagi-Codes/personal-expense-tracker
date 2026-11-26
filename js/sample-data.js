window.EXPENSE_TRACKER_DEFAULTS = {
  monthlyBudget: 35000,
  categories: {
    Expense: [
      "Housing & Rent",
      "Food & Dining",
      "Transportation",
      "Utilities & Bills",
      "Shopping",
      "Entertainment",
      "Healthcare",
      "Education"
    ],
    Income: [
      "Salary",
      "Freelance",
      "Investment",
      "Other Income"
    ]
  },
  transactions: [
    // June 2026
    { id: "TX-1001", date: "2026-06-01", type: "Income", category: "Salary", description: "Monthly Salary Credit", amount: 45000 },
    { id: "TX-1002", date: "2026-06-02", type: "Expense", category: "Housing & Rent", description: "Apartment Monthly Rent", amount: 12000 },
    { id: "TX-1003", date: "2026-06-05", type: "Expense", category: "Utilities & Bills", description: "Electricity, Water & Fiber Internet", amount: 3100 },
    { id: "TX-1004", date: "2026-06-08", type: "Expense", category: "Food & Dining", description: "Monthly Groceries & Fresh Produce", amount: 5400 },
    { id: "TX-1005", date: "2026-06-11", type: "Expense", category: "Transportation", description: "Metro Pass & Fuel Refill", amount: 2200 },
    { id: "TX-1006", date: "2026-06-14", type: "Income", category: "Freelance", description: "Data Cleaning Analytics Project", amount: 7500 },
    { id: "TX-1007", date: "2026-06-17", type: "Expense", category: "Education", description: "SQL & Python Reference Books", amount: 2500 },
    { id: "TX-1008", date: "2026-06-21", type: "Expense", category: "Shopping", description: "Summer Apparel & Essentials", amount: 3800 },
    { id: "TX-1009", date: "2026-06-24", type: "Expense", category: "Healthcare", description: "Pharmacy & Dental Checkup", amount: 900 },
    { id: "TX-1010", date: "2026-06-28", type: "Expense", category: "Entertainment", description: "Cinema Tickets & Weekend Dining", amount: 1600 },

    // July 2026
    { id: "TX-1011", date: "2026-07-01", type: "Income", category: "Salary", description: "Monthly Salary Credit", amount: 45000 },
    { id: "TX-1012", date: "2026-07-02", type: "Expense", category: "Housing & Rent", description: "Apartment Monthly Rent", amount: 12000 },
    { id: "TX-1013", date: "2026-07-05", type: "Expense", category: "Utilities & Bills", description: "Electricity, Gas & Mobile Plan", amount: 3400 },
    { id: "TX-1014", date: "2026-07-09", type: "Expense", category: "Food & Dining", description: "Groceries & Lunch Meals", amount: 5850 },
    { id: "TX-1015", date: "2026-07-12", type: "Expense", category: "Transportation", description: "Cab Rides & Commute Card", amount: 2450 },
    { id: "TX-1016", date: "2026-07-15", type: "Income", category: "Investment", description: "Mutual Fund Quarterly Dividend", amount: 3200 },
    { id: "TX-1017", date: "2026-07-18", type: "Expense", category: "Education", description: "Power BI Workshop Registration", amount: 1800 },
    { id: "TX-1018", date: "2026-07-22", type: "Expense", category: "Shopping", description: "Home Desk Accessories", amount: 4200 },
    { id: "TX-1019", date: "2026-07-25", type: "Expense", category: "Healthcare", description: "Annual Blood Panel & Vitamins", amount: 1450 },
    { id: "TX-1020", date: "2026-07-29", type: "Expense", category: "Entertainment", description: "Streaming Subscriptions & Bowling", amount: 1900 },

    // August 2026 (Over budget)
    { id: "TX-1021", date: "2026-08-01", type: "Income", category: "Salary", description: "Monthly Salary Credit", amount: 45000 },
    { id: "TX-1022", date: "2026-08-02", type: "Expense", category: "Housing & Rent", description: "Apartment Monthly Rent", amount: 12000 },
    { id: "TX-1023", date: "2026-08-06", type: "Expense", category: "Utilities & Bills", description: "Electricity, Internet & Maintenance", amount: 3250 },
    { id: "TX-1024", date: "2026-08-09", type: "Expense", category: "Food & Dining", description: "Supermarket & Family Dinner", amount: 6100 },
    { id: "TX-1025", date: "2026-08-12", type: "Expense", category: "Transportation", description: "Intercity Train & Local Transit", amount: 2600 },
    { id: "TX-1026", date: "2026-08-15", type: "Income", category: "Freelance", description: "Dashboard Reporting Consulting", amount: 9500 },
    { id: "TX-1027", date: "2026-08-19", type: "Expense", category: "Education", description: "College Semester Lab & Certification", amount: 3600 },
    { id: "TX-1028", date: "2026-08-22", type: "Expense", category: "Shopping", description: "Running Shoes & Backpack", amount: 5500 },
    { id: "TX-1029", date: "2026-08-26", type: "Expense", category: "Healthcare", description: "Eye Examination & Prescriptions", amount: 1200 },
    { id: "TX-1030", date: "2026-08-30", type: "Expense", category: "Entertainment", description: "Concert Pass & Outing", amount: 2200 },

    // September 2026
    { id: "TX-1031", date: "2026-09-01", type: "Income", category: "Salary", description: "Monthly Salary Credit (Revised)", amount: 48000 },
    { id: "TX-1032", date: "2026-09-02", type: "Expense", category: "Housing & Rent", description: "Apartment Monthly Rent", amount: 12000 },
    { id: "TX-1033", date: "2026-09-05", type: "Expense", category: "Utilities & Bills", description: "Electricity, Water & Broadband", amount: 2950 },
    { id: "TX-1034", date: "2026-09-08", type: "Expense", category: "Food & Dining", description: "Monthly Groceries & Cafe", amount: 5200 },
    { id: "TX-1035", date: "2026-09-12", type: "Expense", category: "Transportation", description: "Metro Card & Bike Servicing", amount: 2100 },
    { id: "TX-1036", date: "2026-09-16", type: "Income", category: "Other Income", description: "Cashback & Tax Refund Credit", amount: 2500 },
    { id: "TX-1037", date: "2026-09-19", type: "Expense", category: "Education", description: "Data Structures Online Course", amount: 2200 },
    { id: "TX-1038", date: "2026-09-22", type: "Expense", category: "Shopping", description: "Kitchen Utensils & Supplies", amount: 2900 },
    { id: "TX-1039", date: "2026-09-25", type: "Expense", category: "Healthcare", description: "General Clinic Visit", amount: 850 },
    { id: "TX-1040", date: "2026-09-28", type: "Expense", category: "Entertainment", description: "Movie Night & Books", amount: 1400 },

    // October 2026 (Over budget)
    { id: "TX-1041", date: "2026-10-01", type: "Income", category: "Salary", description: "Monthly Salary Credit", amount: 48000 },
    { id: "TX-1042", date: "2026-10-02", type: "Expense", category: "Housing & Rent", description: "Apartment Monthly Rent", amount: 12000 },
    { id: "TX-1043", date: "2026-10-05", type: "Expense", category: "Utilities & Bills", description: "Electricity, Gas & Mobile", amount: 3300 },
    { id: "TX-1044", date: "2026-10-09", type: "Expense", category: "Food & Dining", description: "Festive Groceries & Dining Out", amount: 6300 },
    { id: "TX-1045", date: "2026-10-13", type: "Expense", category: "Transportation", description: "Holiday Travel & Fuel", amount: 2800 },
    { id: "TX-1046", date: "2026-10-16", type: "Income", category: "Freelance", description: "SQL Database Optimization Gig", amount: 11000 },
    { id: "TX-1047", date: "2026-10-19", type: "Expense", category: "Education", description: "Cloud Computing Exam Prep", amount: 2000 },
    { id: "TX-1048", date: "2026-10-23", type: "Expense", category: "Shopping", description: "Festive Gifts & Clothing", amount: 6200 },
    { id: "TX-1049", date: "2026-10-26", type: "Expense", category: "Healthcare", description: "Wellness Medicines", amount: 1100 },
    { id: "TX-1050", date: "2026-10-30", type: "Expense", category: "Entertainment", description: "Event Tickets & Dinner", amount: 2500 },

    // November 2026 (Over budget)
    { id: "TX-1051", date: "2026-11-01", type: "Income", category: "Salary", description: "Monthly Salary Credit", amount: 48000 },
    { id: "TX-1052", date: "2026-11-02", type: "Expense", category: "Housing & Rent", description: "Apartment Monthly Rent", amount: 12000 },
    { id: "TX-1053", date: "2026-11-05", type: "Expense", category: "Utilities & Bills", description: "Winter Heater Electricity & Fiber", amount: 3550 },
    { id: "TX-1054", date: "2026-11-08", type: "Expense", category: "Food & Dining", description: "Monthly Groceries & Meal Prep", amount: 6450 },
    { id: "TX-1055", date: "2026-11-11", type: "Expense", category: "Transportation", description: "Fuel & Airport Cab Ride", amount: 2750 },
    { id: "TX-1056", date: "2026-11-14", type: "Income", category: "Freelance", description: "Python ETL Script Deliverable", amount: 8500 },
    { id: "TX-1057", date: "2026-11-17", type: "Expense", category: "Education", description: "Analytics Project Binding & Cloud", amount: 2900 },
    { id: "TX-1058", date: "2026-11-20", type: "Expense", category: "Shopping", description: "Winter Jacket & Headphones", amount: 5800 },
    { id: "TX-1059", date: "2026-11-23", type: "Expense", category: "Healthcare", description: "Physiotherapy & Pharmacy", amount: 1850 },
    { id: "TX-1060", date: "2026-11-25", type: "Expense", category: "Entertainment", description: "Weekend Movie & Museum Pass", amount: 2400 }
  ]
};
