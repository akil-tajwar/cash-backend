
import { Request, Response } from 'express';
import { transactionReport } from '../services/reports.service';

export const getTransactionReportController = async (req: Request, res: Response) => {
  try {
    const { date, accountMainId } = req.query;

    if (!date || !accountMainId) {
      res.status(400).json({
        success: false,
        message: 'Date and account ID are required'
      });
    }

    const report = await transactionReport(
      date as string,
      Number(accountMainId)
    );

    res.status(200).json(report);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating transaction report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
