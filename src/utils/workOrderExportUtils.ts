import type { WorkOrder } from '@/types/workOrder';
import { generateCSV, downloadCSV } from './csvUtils';

/**
 * Utility functions for Work Order exports
 * Ensures Work Order Number is prominently included in all exports
 */

export const generateWorkOrderCSV = (workOrders: WorkOrder[]): string => {
  const headers = [
    'Work Order Number',
    'Title', 
    'Status',
    'Priority',
    'Work Type',
    'Description',
    'Due Date',
    'Estimated Hours',
    'Estimated Cost',
    'Actual Hours', 
    'Actual Cost',
    'Created Date',
    'Completed Date'
  ];

  const rows = workOrders.map(workOrder => [
    workOrder.work_order_number,
    workOrder.title,
    workOrder.status.replace('_', ' ').toUpperCase(),
    workOrder.priority.toUpperCase(),
    workOrder.work_type.replace('_', ' ').toUpperCase(),
    workOrder.description || '',
    workOrder.due_date || '',
    workOrder.estimated_hours?.toString() || '',
    workOrder.estimated_cost?.toString() || '',
    workOrder.actual_hours?.toString() || '',
    workOrder.actual_cost?.toString() || '',
    new Date(workOrder.created_at).toLocaleDateString(),
    workOrder.completed_at ? new Date(workOrder.completed_at).toLocaleDateString() : ''
  ]);

  return generateCSV([headers, ...rows]);
};

export const exportWorkOrdersToCSV = (workOrders: WorkOrder[], filename?: string): void => {
  const csvContent = generateWorkOrderCSV(workOrders);
  const defaultFilename = `work-orders-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename || defaultFilename);
};

/**
 * Generate work order data for PDF exports
 * Places Work Order Number prominently in header section
 */
export const formatWorkOrderForPDF = (workOrder: WorkOrder) => {
  return {
    // Header section - Work Order Number prominently displayed
    header: {
      workOrderNumber: workOrder.work_order_number,
      title: workOrder.title,
      status: workOrder.status.replace('_', ' ').toUpperCase(),
      priority: workOrder.priority.toUpperCase()
    },
    // Details section
    details: {
      workType: workOrder.work_type.replace('_', ' ').toUpperCase(),
      description: workOrder.description || 'No description provided',
      dueDate: workOrder.due_date || 'Not specified',
      createdDate: new Date(workOrder.created_at).toLocaleDateString(),
      completedDate: workOrder.completed_at ? new Date(workOrder.completed_at).toLocaleDateString() : 'Not completed'
    },
    // Estimates section
    estimates: {
      estimatedHours: workOrder.estimated_hours || 0,
      estimatedCost: workOrder.estimated_cost || 0,
      actualHours: workOrder.actual_hours || 0,
      actualCost: workOrder.actual_cost || 0
    }
  };
};