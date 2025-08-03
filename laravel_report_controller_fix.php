<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportApiController extends Controller
{
    /**
     * Get Arrears Report - Simplified version without ReportService
     */
    public function getArrearsReport(Request $request)
    {
        try {
            $per_page = $request->input('per_page', 20);
            $page = $request->input('page', 1);
            
            // Simple query to get overdue loans
            $query = DB::table('loan_applications')
                ->leftJoin('members', 'loan_applications.member_id', '=', 'members.id')
                ->select([
                    'loan_applications.loan_id',
                    'loan_applications.loan_amount',
                    'loan_applications.status',
                    'loan_applications.branch_name',
                    'loan_applications.product_name',
                    'loan_applications.credit_officer',
                    'members.full_name as member_name',
                    'members.nic as member_nic',
                    DB::raw('CURRENT_DATE as due_date'),
                    DB::raw('0 as total_due'),
                    DB::raw('0 as days_overdue'),
                    DB::raw('"BL" as loan_type'),
                ])
                ->where('loan_applications.status', '!=', 'settled');
            
            // Apply filters
            if ($request->filled('branch_id')) {
                $query->where('loan_applications.branch_id', $request->branch_id);
            }
            
            if ($request->filled('loan_type')) {
                $query->where('loan_applications.loan_type', $request->loan_type);
            }
            
            if ($request->filled('credit_officer')) {
                $query->where('loan_applications.credit_officer', 'like', '%' . $request->credit_officer . '%');
            }
            
            // Get total count
            $total = $query->count();
            
            // Apply pagination
            $offset = ($page - 1) * $per_page;
            $rows = $query->offset($offset)->limit($per_page)->get();
            
            // Calculate summary
            $total_loans = $total;
            $total_outstanding = $rows->sum('loan_amount') ?? 0;
            $avg_overdue = 0; // Placeholder
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'arrears' => [
                        'data' => $rows,
                        'current_page' => $page,
                        'last_page' => ceil($total / $per_page),
                        'per_page' => $per_page,
                        'total' => $total,
                    ],
                    'summary' => [
                        'total_arrears' => $total_loans,
                        'total_amount_due' => $total_outstanding,
                        'average_days_overdue' => $avg_overdue
                    ],
                    'filters' => [
                        'branch_id' => $request->input('branch_id'),
                        'loan_type' => $request->input('loan_type'),
                        'repayment_method' => $request->input('repayment_method'),
                        'credit_officer' => $request->input('credit_officer'),
                        'days_overdue' => $request->input('days_overdue', 30),
                        'date_as_of' => $request->input('date_as_of', now()->format('Y-m-d'))
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error fetching arrears report: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Get Portfolio Report - Simplified version
     */
    public function getPortfolioReport(Request $request)
    {
        try {
            $per_page = $request->get('per_page', 20);
            $page = $request->get('page', 1);
            
            $query = DB::table('loan_applications')
                ->leftJoin('members', 'loan_applications.member_id', '=', 'members.id')
                ->select([
                    'loan_applications.loan_id',
                    'loan_applications.loan_amount',
                    'loan_applications.interest_rate',
                    'loan_applications.installments',
                    'loan_applications.status',
                    'loan_applications.branch_name',
                    'loan_applications.product_name',
                    'loan_applications.repayment_method',
                    'loan_applications.rental_value',
                    'loan_applications.created_at as application_date',
                    'members.full_name as member_name',
                    'members.nic as member_nic',
                    DB::raw('0 as payments_made'),
                    DB::raw('loan_applications.loan_amount as outstanding_balance'),
                ]);
            
            // Apply filters
            if ($request->filled('branch_id')) {
                $query->where('loan_applications.branch_id', $request->branch_id);
            }
            
            if ($request->filled('loan_type')) {
                $query->where('loan_applications.loan_type', $request->loan_type);
            }
            
            if ($request->filled('status')) {
                $query->where('loan_applications.status', $request->status);
            }
            
            // Get total count
            $total = $query->count();
            
            // Apply pagination
            $offset = ($page - 1) * $per_page;
            $loans = $query->offset($offset)->limit($per_page)->get();
            
            // Calculate summary
            $total_loans = $total;
            $total_amount = $loans->sum('loan_amount');
            $average_interest_rate = $loans->avg('interest_rate') ?? 0;
            $total_outstanding = $loans->sum('outstanding_balance');
            $total_rental_value = $loans->sum('rental_value');
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'loans' => [
                        'data' => $loans,
                        'current_page' => $page,
                        'last_page' => ceil($total / $per_page),
                        'per_page' => $per_page,
                        'total' => $total,
                    ],
                    'summary' => [
                        'total_loans' => $total_loans,
                        'total_amount' => $total_amount,
                        'average_interest_rate' => $average_interest_rate,
                        'total_outstanding' => $total_outstanding,
                        'total_rental_value' => $total_rental_value,
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error fetching portfolio report: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Get Loan Details - Simplified version
     */
    public function getLoanDetails($loanId)
    {
        try {
            $loan = DB::table('loan_applications')
                ->leftJoin('members', 'loan_applications.member_id', '=', 'members.id')
                ->where('loan_applications.loan_id', $loanId)
                ->orWhere('loan_applications.id', $loanId)
                ->first();
            
            if (!$loan) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Loan application not found'
                ], 404);
            }
            
            // Prepare loan data
            $loanData = [
                'loan_id' => $loan->loan_id,
                'member_name' => $loan->member_name ?? 'N/A',
                'member_nic' => $loan->member_nic ?? 'N/A',
                'branch_name' => $loan->branch_name ?? 'N/A',
                'product_name' => $loan->product_name ?? 'N/A',
                'loan_amount' => $loan->loan_amount ?? 0,
                'interest_rate' => $loan->interest_rate ?? 0,
                'installments' => $loan->installments ?? 0,
                'status' => $loan->status ?? 'N/A',
                'rental_value' => $loan->rental_value ?? 0,
                'repayment_method' => $loan->repayment_method ?? 'N/A',
                'credit_officer' => $loan->credit_officer ?? 'N/A',
                'phone' => $loan->phone ?? 'N/A',
                'address' => $loan->address ?? 'N/A',
                'full_name' => $loan->member_name ?? 'N/A',
                'nic' => $loan->member_nic ?? 'N/A',
            ];
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'loan' => $loanData,
                    'installments' => [],
                    'payments' => [],
                    'summary' => [
                        'agreed_amount' => $loan->loan_amount ?? 0,
                        'total_paid' => 0,
                        'total_outstanding' => $loan->loan_amount ?? 0,
                        'arrears' => 0,
                        'total_penalty' => 0,
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error fetching loan details: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
} 