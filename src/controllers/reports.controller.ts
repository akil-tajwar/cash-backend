
import { NextFunction, Request, Response } from 'express';
import { cashFlowLoanReport, getBalanceSummaryByint, getBalanceSummaryByType, getCashFlowSummaryReport } from '../services/reports.service';
import { BadRequestError } from '../services/utils/errors.utils';
import e from 'cors';

export const getCashFlowLoanReportController = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;

    if (!date) {
      res.status(400).json({ success: false, message: 'Date is required' });
    }

    const report = await cashFlowLoanReport(date as string);

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating loan report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getCashFlowSummaryReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const { reportDate } = req.params;

    if (!reportDate) {
      throw BadRequestError("reportDate parameter is required");
    }

    const transactions = await getCashFlowSummaryReport(reportDate);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json({ message: "Failed to fetch transactions report" });
  }
};

export const getInterestRateReportController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reportDate } = req.query;
    console.log(req.query)
  if (
  typeof reportDate !== 'string' ||
  isNaN(new Date(reportDate).getTime())
) {
  throw new Error("Invalid or missing reportDate");
}

    const parsedDate = new Date(reportDate);
    const transactions = await getBalanceSummaryByType(new Date(reportDate));
    res.status(200).json(transactions);
  } catch (error) {
    next(error)
  }
};

export const getInterestRateFlatReportController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reportDate } = req.query;
    console.log(req.query)
  if (
  typeof reportDate !== 'string' ||
  isNaN(new Date(reportDate).getTime())
) {
  throw new Error("Invalid or missing reportDate");
}

    const parsedDate = new Date(reportDate);
    const transactions = await getBalanceSummaryByint(new Date(reportDate));
    res.status(200).json(transactions);
  } catch (error) {
    next(error)
  }
};



