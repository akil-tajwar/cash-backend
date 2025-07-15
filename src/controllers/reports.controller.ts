
import { Request, Response } from 'express';
import { cashFlowLoanReport } from '../services/reports.service';

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

