# Mobile App API Documentation

## Base URL
```
http://192.168.1.179:8000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## 1. Authentication Endpoints

### Login
**POST** `/login`
```json
{
    "email": "admin@example.com",
    "password": "password"
}
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "user": {
            "id": 1,
            "name": "Admin User",
            "email": "admin@example.com",
            "role": "admin"
        },
        "token": "1|abc123..."
    }
}
```

### Logout
**POST** `/logout`
*Requires authentication*

**Response:**
```json
{
    "status": "success",
    "message": "Logged out successfully"
}
```

---

## 2. Dashboard Endpoints

### Dashboard Overview
**GET** `/dashboard/overview`
*Requires authentication*

**Query Parameters:**
- `branch_id` (optional): Filter by branch
- `date_from` (optional): Start date (Y-m-d)
- `date_to` (optional): End date (Y-m-d)

**Response:**
```json
{
    "status": "success",
    "data": {
        "today_stats": {
            "payments_count": 15,
            "payments_amount": 25000.00,
            "average_payment": 1666.67
        },
        "month_stats": {
            "payments_count": 450,
            "payments_amount": 750000.00,
            "average_payment": 1666.67
        },
        "loans": {
            "business_loans": 25,
            "business_loan_amount": 5000000.00,
            "lease_loans": 10,
            "lease_loan_amount": 2000000.00,
            "micro_loans": 100,
            "micro_loan_amount": 1500000.00,
            "total_loans": 135,
            "total_amount": 8500000.00
        },
        "members": {
            "total_members": 500,
            "active_members": 480,
            "inactive_members": 20
        },
        "recent_activities": {
            "recent_payments": [...],
            "recent_loans": [...]
        }
    }
}
```

### Branch Statistics
**GET** `/dashboard/branch-stats`
*Requires authentication*

**Response:**
```json
{
    "status": "success",
    "data": {
        "branches": [
            {
                "branch_id": 1,
                "branch_name": "Main Branch",
                "members": {
                    "total": 250,
                    "active": 240,
                    "inactive": 10
                },
                "loans": {
                    "business_loans": 15,
                    "micro_loans": 50,
                    "lease_loans": 5,
                    "total_loans": 70
                },
                "payments": {
                    "this_month_count": 225,
                    "this_month_amount": 375000.00
                },
                "cbos": {
                    "total": 10,
                    "active": 10
                }
            }
        ]
    }
}
```

---

## 3. Branch Endpoints

### Get All Branches
**GET** `/branches`
*Requires authentication*

**Response:**
```json
{
    "status": "success",
    "data": {
        "branches": [
            {
                "id": 1,
                "branch_name": "Main Branch",
                "status": "active",
                "created_at": "2024-01-01T00:00:00.000000Z"
            }
        ]
    }
}
```

### Get Branch Details
**GET** `/branches/{branchId}`
*Requires authentication*

**Response:**
```json
{
    "status": "success",
    "data": {
        "branch": {
            "id": 1,
            "branch_name": "Main Branch",
            "status": "active"
        },
        "statistics": {
            "members": {
                "total": 250,
                "active": 240,
                "inactive": 10
            },
            "loans": {
                "business_loans": 15,
                "micro_loans": 50,
                "lease_loans": 5,
                "total_loans": 70
            },
            "payments": {
                "this_month_count": 225,
                "this_month_amount": 375000.00
            },
            "cbos": {
                "total": 10,
                "active": 10
            }
        }
    }
}
```

---

## 4. CBO Endpoints

### Get All CBOs
**GET** `/cbos`
*Requires authentication*

**Query Parameters:**
- `branch_id` (optional): Filter by branch

**Response:**
```json
{
    "status": "success",
    "data": {
        "cbos": [
            {
                "cbo_id": 1,
                "cbo_name": "CBO Group 1",
                "branch_name": "Main Branch",
                "status": "active",
                "created_at": "2024-01-01T00:00:00.000000Z"
            }
        ]
    }
}
```

### Get CBO Details
**GET** `/cbos/{cboId}`
*Requires authentication*

**Response:**
```json
{
    "status": "success",
    "data": {
        "cbo": {
            "cbo_id": 1,
            "cbo_name": "CBO Group 1",
            "branch_name": "Main Branch",
            "status": "active"
        },
        "statistics": {
            "members": {
                "total": 25,
                "active": 24,
                "inactive": 1
            },
            "loans": {
                "total": 15,
                "active": 12,
                "total_amount": 300000.00,
                "average_loan": 20000.00
            },
            "payments": {
                "this_month_count": 45,
                "this_month_amount": 75000.00
            },
            "groups": {
                "total": 3
            }
        }
    }
}
```

### Get CBO Members
**GET** `/cbos/{cboId}/members`
*Requires authentication*

**Query Parameters:**
- `per_page` (optional): Items per page (default: 20)

**Response:**
```json
{
    "status": "success",
    "data": {
        "members": [
            {
                "member_id": 1,
                "member_name": "John Doe",
                "member_nic": "123456789V",
                "member_phone": "0771234567",
                "position": "President",
                "group_number": 1,
                "status": "active",
                "joined_date": "2024-01-01T00:00:00.000000Z"
            }
        ],
        "pagination": {
            "current_page": 1,
            "last_page": 2,
            "per_page": 20,
            "total": 25
        }
    }
}
```

---

## 5. Report Endpoints

### Portfolio Report
**GET** `/reports/portfolio`
*Requires authentication*

**Query Parameters:**
- `branch_id` (optional): Filter by branch
- `loan_type` (optional): BL, ML, LL
- `status` (optional): Filter by status
- `date_from` (optional): Start date
- `date_to` (optional): End date
- `repayment_method` (optional): Filter by repayment method
- `per_page` (optional): Items per page (default: 20)

**Response:**
```json
{
    "status": "success",
    "data": {
        "loans": {
            "data": [
                {
                    "loan_id": "BL001",
                    "application_date": "2024-01-01T00:00:00.000000Z",
                    "member_name": "John Doe",
                    "member_nic": "123456789V",
                    "branch_name": "Main Branch",
                    "product_name": "Business Loan",
                    "loan_amount": 50000.00,
                    "interest_rate": 12.00,
                    "installments": 12,
                    "rental_value": 5000.00,
                    "status": "Disbursed",
                    "repayment_method": "monthly",
                    "payments_made": 3,
                    "outstanding_balance": 35000.00
                }
            ],
            "current_page": 1,
            "last_page": 5,
            "per_page": 20,
            "total": 100
        },
        "summary": {
            "total_loans": 100,
            "total_amount": 5000000.00,
            "average_interest_rate": 12.50,
            "total_outstanding": 3500000.00,
            "total_rental_value": 500000.00
        }
    }
}
```

### Loan Details
**GET** `/reports/loan-details/{loanId}`
*Requires authentication*

**Response:**
```json
{
    "status": "success",
    "data": {
        "loan": {
            "loan_id": "BL001",
            "member_name": "John Doe",
            "member_nic": "123456789V",
            "branch_name": "Main Branch",
            "product_name": "Business Loan",
            "loan_amount": 50000.00,
            "interest_rate": 12.00,
            "installments": 12,
            "status": "Disbursed"
        },
        "installments": [
            {
                "installment_number": 1,
                "installment_date": "2024-02-01",
                "total_due": 5000.00,
                "paid_amount": 5000.00,
                "status": "paid",
                "penalty": 0.00
            }
        ],
        "payments": [
            {
                "id": 1,
                "amount": 5000.00,
                "payment_date": "2024-02-01",
                "payment_method": "cash"
            }
        ],
        "summary": {
            "agreed_amount": 60000.00,
            "total_paid": 15000.00,
            "total_outstanding": 45000.00,
            "arrears": 0.00,
            "total_penalty": 0.00
        }
    }
}
```

### Arrears Report
**GET** `/reports/arrears`
*Requires authentication*

**Query Parameters:**
- `branch_id` (optional): Filter by branch
- `loan_type` (optional): Filter by loan type
- `repayment_method` (optional): Filter by repayment method
- `credit_officer` (optional): Filter by credit officer
- `days_overdue` (optional): Minimum days overdue (default: 30)
- `date_as_of` (optional): As of date (default: today)
- `per_page` (optional): Items per page (default: 20)

**Response:**
```json
{
    "status": "success",
    "data": {
        "arrears": {
            "data": [
                {
                    "loan_id": "BL001",
                    "member_name": "John Doe",
                    "member_nic": "123456789V",
                    "credit_officer_name": "Credit Officer 1",
                    "branch_name": "Main Branch",
                    "product_name": "Business Loan",
                    "loan_amount": 50000.00,
                    "due_date": "2024-01-01",
                    "total_due": 5000.00,
                    "days_overdue": 45,
                    "loan_type": "business_loan"
                }
            ],
            "current_page": 1,
            "last_page": 3,
            "per_page": 20,
            "total": 50
        },
        "summary": {
            "total_arrears": 50,
            "total_amount_due": 250000.00,
            "average_days_overdue": 60
        }
    }
}
```

---

## 6. Loan Endpoints

### Search Loan
**POST** `/loans/search`
*Requires authentication*

**Request Body:**
```json
{
    "search_term": "BL001"
}
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "loan": {
            "loan_id": "BL001",
            "member_name": "John Doe",
            "member_nic": "123456789V",
            "loan_amount": 50000.00,
            "status": "Disbursed"
        },
        "member": {
            "id": 1,
            "full_name": "John Doe",
            "nic": "123456789V",
            "phone": "0771234567"
        }
    }
}
```

### Get Loan Details
**GET** `/loans/details/{loanId}`
*Requires authentication*

**Response:**
```json
{
    "status": "success",
    "data": {
        "loan": {
            "loan_id": "BL001",
            "member_name": "John Doe",
            "member_nic": "123456789V",
            "loan_amount": 50000.00,
            "interest_rate": 12.00,
            "status": "Disbursed"
        },
        "member": {
            "id": 1,
            "full_name": "John Doe",
            "nic": "123456789V",
            "phone": "0771234567"
        }
    }
}
```

### Get Loan List
**GET** `/loans/list`
*Requires authentication*

**Query Parameters:**
- `loan_type` (optional): business_loan, micro_loan, lease_loan
- `status` (optional): Filter by status
- `branch_id` (optional): Filter by branch
- `per_page` (optional): Items per page (default: 20)

**Response:**
```json
{
    "status": "success",
    "data": {
        "loans": [
            {
                "loan_id": "BL001",
                "member_name": "John Doe",
                "member_nic": "123456789V",
                "loan_amount": 50000.00,
                "status": "Disbursed",
                "loan_type": "business_loan"
            }
        ],
        "pagination": {
            "current_page": 1,
            "last_page": 5,
            "per_page": 20,
            "total": 100
        }
    }
}
```

---

## 7. Member Endpoints

### Search Members
**POST** `/members/search`
*Requires authentication*

**Request Body:**
```json
{
    "search_term": "123456789V"
}
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "members": {
            "data": [
                {
                    "id": 1,
                    "full_name": "John Doe",
                    "nic": "123456789V",
                    "phone": "0771234567",
                    "status": "active"
                }
            ],
            "current_page": 1,
            "last_page": 1,
            "per_page": 20,
            "total": 1
        }
    }
}
```

### Get Member Loans
**GET** `/members/{memberIdOrNic}/loans`
*Requires authentication*

**Response:**
```json
{
    "status": "success",
    "data": {
        "member": {
            "id": 1,
            "full_name": "John Doe",
            "nic": "123456789V"
        },
        "business_loans": [
            {
                "loan_id": "BL001",
                "loan_amount": 50000.00,
                "status": "Disbursed",
                "total_due": 5000.00,
                "loan_type": "business_loan"
            }
        ],
        "micro_loans": [],
        "lease_loans": [],
        "total_loans": 1,
        "total_due": 5000.00
    }
}
```

### Get Member Payment History
**GET** `/members/{memberIdOrNic}/payments`
*Requires authentication*

**Query Parameters:**
- `per_page` (optional): Items per page (default: 20)

**Response:**
```json
{
    "status": "success",
    "data": {
        "member": {
            "id": 1,
            "full_name": "John Doe",
            "nic": "123456789V"
        },
        "payments": {
            "data": [
                {
                    "id": 1,
                    "amount": 5000.00,
                    "payment_date": "2024-02-01",
                    "payment_method": "cash",
                    "loan_id": "BL001"
                }
            ],
            "current_page": 1,
            "last_page": 1,
            "per_page": 20,
            "total": 1
        },
        "statistics": {
            "total_payments": 1,
            "total_amount_paid": 5000.00,
            "this_month_payments": 1,
            "this_month_amount": 5000.00
        }
    }
}
```

---

## 8. Payment Endpoints

### Search Loan for Payment
**POST** `/payments/search-loan`
*Requires authentication*

**Request Body:**
```json
{
    "search_term": "BL001"
}
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "loan": {
            "loan_id": "BL001",
            "member_name": "John Doe",
            "member_nic": "123456789V",
            "loan_amount": 50000.00,
            "status": "Disbursed"
        },
        "loan_type": "business_loan",
        "total_due": 5000.00,
        "member": {
            "id": 1,
            "full_name": "John Doe",
            "nic": "123456789V"
        }
    }
}
```

### Process Payment
**POST** `/payments/process`
*Requires authentication*

**Request Body:**
```json
{
    "loan_id": "BL001",
    "loan_type": "business_loan",
    "paid_amount": 5000.00,
    "payment_date": "2024-02-01",
    "payment_method": "cash",
    "reference_number": "REF001",
    "notes": "Payment received",
    "latitude": 6.9271,
    "longitude": 79.8612
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Payment processed successfully",
    "data": {
        "payment": {
            "id": 1,
            "amount": 5000.00,
            "payment_date": "2024-02-01",
            "payment_method": "cash"
        },
        "receipt_url": "http://192.168.1.179:8000/api/mobile/payment/receipt/1"
    }
}
```

### Get Payment Receipt
**GET** `/payments/receipt/{paymentId}`
*Requires authentication*

**Response:**
```json
{
    "status": "success",
    "data": {
        "payment_id": 1,
        "member_name": "John Doe",
        "member_nic": "123456789V",
        "loan_id": "BL001",
        "loan_type": "business_loan",
        "amount": 5000.00,
        "interest_paid": 3000.00,
        "capital_paid": 2000.00,
        "payment_date": "2024-02-01",
        "payment_method": "cash",
        "reference_number": "REF001",
        "processed_by": "Admin User",
        "receipt_number": "RCP-000001"
    }
}
```

---

## Error Responses

### Validation Error
```json
{
    "status": "error",
    "message": "The provided credentials are incorrect.",
    "errors": {
        "email": ["The email field is required."],
        "password": ["The password field is required."]
    }
}
```

### Not Found Error
```json
{
    "status": "error",
    "message": "Loan not found"
}
```

### Authentication Error
```json
{
    "status": "error",
    "message": "Unauthenticated."
}
```

---

## Mobile App Integration Examples

### React Native/Expo Example

```javascript
// API Configuration
const API_BASE_URL = 'http://192.168.1.179:8000/api';

// Login
const login = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (data.status === 'success') {
            // Store token
            await AsyncStorage.setItem('token', data.data.token);
            return data.data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Search Loan
const searchLoan = async (searchTerm) => {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/loans/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ search_term: searchTerm })
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Search error:', error);
        throw error;
    }
};

// Process Payment
const processPayment = async (paymentData) => {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/payments/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentData)
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Payment error:', error);
        throw error;
    }
};
```

---

## Testing the API

### Using Postman or curl

1. **Login:**
```bash
curl -X POST http://192.168.1.179:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

2. **Search Loan (with token):**
```bash
curl -X POST http://192.168.1.179:8000/api/loans/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"search_term":"BL001"}'
```

3. **Get Dashboard Overview:**
```bash
curl -X GET "http://192.168.1.179:8000/api/dashboard/overview?branch_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

1. **IP Address**: Make sure to use your PC's local IP address (`192.168.1.179`) instead of `localhost` or `127.0.0.1`
2. **CORS**: The API includes CORS middleware for cross-origin requests
3. **Authentication**: All protected endpoints require a valid Bearer token
4. **Pagination**: List endpoints support pagination with `per_page` parameter
5. **Error Handling**: Always check the `status` field in responses
6. **Date Format**: Use `Y-m-d` format for dates (e.g., "2024-02-01")
7. **Case Insensitive**: Search operations are case-insensitive for better user experience 