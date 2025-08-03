<?php

namespace App\Services;

use Illuminate\Http\Request;
use App\Models\LoanApplication;
use App\Models\MicroLoanApplication;
use App\Models\LeaseApplication;
use App\Models\Payment;
use App\Models\Member;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Get portfolio report data
     */
    public function getPortfolioReportData(Request $request)
    {
        $query = $this->getBaseLoanQuery($request);
        
        $loans = $query->get();
        
        $total_loans = $loans->count();
        $total_amount = $loans->sum('loan_amount');
        $total_interest = $loans->avg('interest_rate') ?? 0;
        $total_outstanding = $loans->sum('outstanding_balance') ?? 0;
        $total_rental = $loans->sum('rental_value') ?? 0;
        
        // Calculate other metrics
        $capital_due = $loans->sum('capital_due') ?? 0;
        $capital_paid = $loans->sum('capital_paid') ?? 0;
        $interest_due = $loans->sum('interest_due') ?? 0;
        $interest_paid = $loans->sum('interest_paid') ?? 0;
        $total_due = $capital_due + $interest_due;
        $arrears = $loans->where('status', 'overdue')->sum('outstanding_balance') ?? 0;
        $total_paid = $capital_paid + $interest_paid;
        
        return [
            'loans' => $loans,
            'total_loans' => $total_loans,
            'total_amount' => $total_amount,
            'total_interest' => $total_interest,
            'total_outstanding' => $total_outstanding,
            'total_rental' => $total_rental,
            'capital_due' => $capital_due,
            'capital_paid' => $capital_paid,
            'interest_due' => $interest_due,
            'interest_paid' => $interest_paid,
            'total_due' => $total_due,
            'arrears' => $arrears,
            'total_paid' => $total_paid,
        ];
    }

    /**
     * Get loan details data
     */
    public function getLoanDetailsData($loanId)
    {
        // Try to find loan in different tables
        $loan = LoanApplication::where('loan_id', $loanId)
            ->orWhere('id', $loanId)
            ->first();
            
        if (!$loan) {
            $loan = MicroLoanApplication::where('loan_id', $loanId)
                ->orWhere('id', $loanId)
                ->first();
        }
        
        if (!$loan) {
            $loan = LeaseApplication::where('loan_id', $loanId)
                ->orWhere('id', $loanId)
                ->first();
        }
        
        if (!$loan) {
            return null;
        }
        
        // Get member info
        $member = Member::find($loan->member_id);
        
        // Get installments
        $installments = $loan->repaymentSchedule ?? collect([]);
        
        // Get payments
        $payments = Payment::where('loan_id', $loan->id)->get();
        
        // Calculate summary
        $agreed_amount = $loan->loan_amount ?? 0;
        $total_paid = $payments->sum('amount') ?? 0;
        $total_outstanding = $agreed_amount - $total_paid;
        $arrears = $installments->where('status', 'overdue')->sum('total_due') ?? 0;
        $total_penalty = $installments->sum('penalty') ?? 0;
        
        $capital_outstanding = $installments->sum('capital_due') ?? 0;
        $capital_paid = $payments->sum('capital_paid') ?? 0;
        $interest_due = $installments->sum('interest_due') ?? 0;
        $interest_paid = $payments->sum('interest_paid') ?? 0;
        $total_due = $capital_outstanding + $interest_due;
        
        // Prepare loan data
        $loanData = [
            'loan_id' => $loan->loan_id ?? $loan->id,
            'member_name' => $member->full_name ?? $member->name ?? 'N/A',
            'member_nic' => $member->nic ?? 'N/A',
            'branch_name' => $loan->branch_name ?? 'N/A',
            'product_name' => $loan->product_name ?? 'N/A',
            'loan_amount' => $loan->loan_amount ?? 0,
            'interest_rate' => $loan->interest_rate ?? 0,
            'installments' => $loan->installments ?? 0,
            'status' => $loan->status ?? 'N/A',
            'rental_value' => $loan->rental_value ?? 0,
            'repayment_method' => $loan->repayment_method ?? 'N/A',
            'credit_officer' => $loan->credit_officer ?? 'N/A',
            'phone' => $member->phone ?? 'N/A',
            'address' => $member->address ?? 'N/A',
            'full_name' => $member->full_name ?? $member->name ?? 'N/A',
            'nic' => $member->nic ?? 'N/A',
        ];
        
        return [
            'loanData' => $loanData,
            'installments' => $installments,
            'payments' => $payments,
            'loan_type' => $this->getLoanType($loan),
            'agreed_amount' => $agreed_amount,
            'total_paid' => $total_paid,
            'total_outstanding' => $total_outstanding,
            'arrears' => $arrears,
            'total_penalty' => $total_penalty,
            'capital_outstanding' => $capital_outstanding,
            'capital_paid' => $capital_paid,
            'interest_due' => $interest_due,
            'interest_paid' => $interest_paid,
            'total_due' => $total_due,
        ];
    }

    /**
     * Get arrears report data
     */
    public function getArrearsReportData(Request $request)
    {
        $query = $this->getBaseLoanQuery($request);
        
        // Add arrears filter
        $query->where(function($q) {
            $q->where('status', 'overdue')
              ->orWhere('days_overdue', '>', 0);
        });
        
        $rows = $query->get();
        
        $total_loans = $rows->count();
        $total_outstanding = $rows->sum('outstanding_balance') ?? 0;
        $avg_overdue = $rows->avg('days_overdue') ?? 0;
        
        return [
            'rows' => $rows,
            'total_loans' => $total_loans,
            'total_outstanding' => $total_outstanding,
            'avg_overdue' => $avg_overdue,
        ];
    }

    /**
     * Get dashboard stats data
     */
    public function getDashboardStatsData(Request $request)
    {
        $dateFrom = $request->input('date_from', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', Carbon::now()->format('Y-m-d'));
        
        $loans = $this->getBaseLoanQuery($request)
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->count();
            
        $payments = Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
            ->sum('amount') ?? 0;
            
        $members = Member::whereBetween('created_at', [$dateFrom, $dateTo])
            ->count();
        
        return [
            'loans' => $loans,
            'payments' => $payments,
            'members' => $members,
        ];
    }

    /**
     * Get CBO statistics data
     */
    public function getCboStatisticsData($startDate, $endDate, $branchId)
    {
        // Implement CBO statistics logic
        return [
            'total_cbos' => 0,
            'active_cbos' => 0,
            'total_loans' => 0,
            'total_amount' => 0,
        ];
    }

    /**
     * Get financial statistics data
     */
    public function getFinancialStatisticsData($startDate, $endDate)
    {
        // Implement financial statistics logic
        return [
            'total_revenue' => 0,
            'total_expenses' => 0,
            'net_profit' => 0,
            'total_assets' => 0,
        ];
    }

    /**
     * Get base loan query with filters
     */
    private function getBaseLoanQuery(Request $request)
    {
        $query = DB::table('loan_applications')
            ->leftJoin('members', 'loan_applications.member_id', '=', 'members.id')
            ->select([
                'loan_applications.*',
                'members.full_name as member_name',
                'members.nic as member_nic',
                'members.phone',
                'members.address',
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
        
        if ($request->filled('date_from')) {
            $query->where('loan_applications.created_at', '>=', $request->date_from);
        }
        
        if ($request->filled('date_to')) {
            $query->where('loan_applications.created_at', '<=', $request->date_to);
        }
        
        if ($request->filled('credit_officer_name')) {
            $query->where('loan_applications.credit_officer', 'like', '%' . $request->credit_officer_name . '%');
        }
        
        return $query;
    }

    /**
     * Get loan type from loan model
     */
    private function getLoanType($loan)
    {
        if ($loan instanceof LoanApplication) {
            return 'BL';
        } elseif ($loan instanceof MicroLoanApplication) {
            return 'ML';
        } elseif ($loan instanceof LeaseApplication) {
            return 'LL';
        }
        return 'Unknown';
    }
} 