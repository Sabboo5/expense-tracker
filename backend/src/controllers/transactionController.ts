import { Response } from 'express';
import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/apiResponse';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest, TransactionFilters, PaginatedResponse } from '../types';
import { ITransaction } from '../models/Transaction';

export const createTransaction = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const transaction = await Transaction.create({
      ...req.body,
      user: req.user!.id,
    });

    sendCreated(res, transaction, 'Transaction created successfully');
  }
);

export const getTransactions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      type, category, startDate, endDate, search,
      minAmount, maxAmount, page = 1, limit = 10,
      sortBy = 'date', sortOrder = 'desc',
    } = req.query as unknown as TransactionFilters;

    const userId = new mongoose.Types.ObjectId(req.user!.id);
    const filter: mongoose.FilterQuery<ITransaction> = { user: userId };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }
    if (minAmount !== undefined || maxAmount !== undefined) {
      filter.amount = {};
      if (minAmount !== undefined) filter.amount.$gte = Number(minAmount);
      if (maxAmount !== undefined) filter.amount.$lte = Number(maxAmount);
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const validSortFields = ['date', 'amount', 'createdAt', 'category'];
    const sortField = validSortFields.includes(String(sortBy)) ? String(sortBy) : 'date';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);
    const result: PaginatedResponse<typeof transactions[0]> = {
      items: transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };

    sendSuccess(res, result, 'Transactions fetched successfully');
  }
);

export const getTransaction = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user!.id,
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    sendSuccess(res, transaction, 'Transaction fetched successfully');
  }
);

export const updateTransaction = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user!.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    sendSuccess(res, transaction, 'Transaction updated successfully');
  }
);

export const deleteTransaction = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user!.id,
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    sendSuccess(res, null, 'Transaction deleted successfully');
  }
);

export const getAnalytics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user!.id);
    const { year, month } = req.query;

    const now = new Date();
    const targetYear = year ? parseInt(String(year)) : now.getFullYear();

    // Total summary
    const summary = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalIncome = summary.find((s) => s._id === 'income')?.total || 0;
    const totalExpense = summary.find((s) => s._id === 'expense')?.total || 0;

    // Monthly trends for the year
    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: {
            $gte: new Date(`${targetYear}-01-01`),
            $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.month',
          income: {
            $sum: { $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing months
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const filledMonthly = monthNames.map((name, i) => {
      const found = monthlyTrends.find((m) => m._id === i + 1);
      return {
        month: name,
        monthNum: i + 1,
        income: found?.income || 0,
        expense: found?.expense || 0,
        net: (found?.income || 0) - (found?.expense || 0),
      };
    });

    // Category breakdown (expense)
    const expenseByCategory = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    // Category breakdown (income)
    const incomeByCategory = await Transaction.aggregate([
      { $match: { user: userId, type: 'income' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Recent transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    sendSuccess(res, {
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        totalTransactions: (summary.find((s) => s._id === 'income')?.count || 0) +
          (summary.find((s) => s._id === 'expense')?.count || 0),
      },
      monthlyTrends: filledMonthly,
      expenseByCategory: expenseByCategory.map((c) => ({
        category: c._id,
        total: c.total,
        count: c.count,
        percentage: totalExpense ? ((c.total / totalExpense) * 100).toFixed(1) : '0',
      })),
      incomeByCategory: incomeByCategory.map((c) => ({
        category: c._id,
        total: c.total,
        count: c.count,
        percentage: totalIncome ? ((c.total / totalIncome) * 100).toFixed(1) : '0',
      })),
      recentTransactions,
    }, 'Analytics fetched successfully');
  }
);
