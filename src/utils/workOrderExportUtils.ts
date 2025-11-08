import type { WorkOrder } from '@/types/workOrder';
import { generateCSV, downloadCSV } from './csvUtils';
import { jsPDF } from 'jspdf';

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

/**
 * Export a single work order to PDF with detailed formatting
 */
export const exportWorkOrderToPDF = (workOrder: WorkOrder, companyName: string = 'CMMS'): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Company Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(16);
  doc.text('Work Order Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Work Order Number (Prominent)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Work Order #: ${workOrder.work_order_number}`, 20, yPosition);
  yPosition += 10;

  // Title
  doc.setFontSize(12);
  doc.text(`Title: ${workOrder.title}`, 20, yPosition);
  yPosition += 10;

  // Status and Priority
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Status: ${workOrder.status.replace('_', ' ').toUpperCase()}`, 20, yPosition);
  doc.text(`Priority: ${workOrder.priority.toUpperCase()}`, 120, yPosition);
  yPosition += 8;

  doc.text(`Work Type: ${workOrder.work_type.replace('_', ' ').toUpperCase()}`, 20, yPosition);
  yPosition += 10;

  // Separator line
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  // Description Section
  doc.setFont('helvetica', 'bold');
  doc.text('Description:', 20, yPosition);
  yPosition += 6;
  
  doc.setFont('helvetica', 'normal');
  const description = workOrder.description || 'No description provided';
  const splitDescription = doc.splitTextToSize(description, pageWidth - 40);
  doc.text(splitDescription, 20, yPosition);
  yPosition += (splitDescription.length * 5) + 10;

  // Dates Section
  doc.setFont('helvetica', 'bold');
  doc.text('Important Dates:', 20, yPosition);
  yPosition += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Created: ${new Date(workOrder.created_at).toLocaleDateString()}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Due Date: ${workOrder.due_date || 'Not specified'}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Completed: ${workOrder.completed_at ? new Date(workOrder.completed_at).toLocaleDateString() : 'Not completed'}`, 20, yPosition);
  yPosition += 10;

  // Separator line
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  // Estimates Section
  doc.setFont('helvetica', 'bold');
  doc.text('Time & Cost Estimates:', 20, yPosition);
  yPosition += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Estimated Hours: ${workOrder.estimated_hours || 0}`, 20, yPosition);
  doc.text(`Actual Hours: ${workOrder.actual_hours || 0}`, 120, yPosition);
  yPosition += 6;
  doc.text(`Estimated Cost: $${workOrder.estimated_cost || 0}`, 20, yPosition);
  doc.text(`Actual Cost: $${workOrder.actual_cost || 0}`, 120, yPosition);
  yPosition += 10;

  // Asset Information (if available)
  if (workOrder.asset) {
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Asset Information:', 20, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Asset: ${workOrder.asset.name}`, 20, yPosition);
    yPosition += 10;
  }

  // Assignment Information
  if (workOrder.assigned_user || workOrder.assigned_to_contractor) {
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Assignment:', 20, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    if (workOrder.assigned_user) {
      doc.text(`Assigned To: ${workOrder.assigned_user.name}`, 20, yPosition);
    } else if (workOrder.assigned_to_contractor) {
      doc.text('Assigned to Contractor', 20, yPosition);
    }
    yPosition += 10;
  }

  // Footer
  yPosition = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });

  // Save the PDF
  const filename = `work-order-${workOrder.work_order_number}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

/**
 * Export multiple work orders to PDF with summary table
 */
export const exportWorkOrdersToPDF = (workOrders: WorkOrder[], companyName: string = 'CMMS'): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Company Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(16);
  doc.text('Work Orders Summary Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Work Orders: ${workOrders.length}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Table Headers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('WO #', 15, yPosition);
  doc.text('Title', 40, yPosition);
  doc.text('Status', 100, yPosition);
  doc.text('Priority', 130, yPosition);
  doc.text('Due Date', 160, yPosition);
  yPosition += 2;

  // Header line
  doc.setLineWidth(0.5);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 6;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  workOrders.forEach((wo, index) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
      
      // Repeat headers on new page
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('WO #', 15, yPosition);
      doc.text('Title', 40, yPosition);
      doc.text('Status', 100, yPosition);
      doc.text('Priority', 130, yPosition);
      doc.text('Due Date', 160, yPosition);
      yPosition += 2;
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
    }

    doc.text(wo.work_order_number, 15, yPosition);
    const titleText = wo.title.length > 25 ? wo.title.substring(0, 22) + '...' : wo.title;
    doc.text(titleText, 40, yPosition);
    doc.text(wo.status.replace('_', ' ').toUpperCase(), 100, yPosition);
    doc.text(wo.priority.toUpperCase(), 130, yPosition);
    doc.text(wo.due_date || 'N/A', 160, yPosition);
    yPosition += 6;
  });

  // Footer
  yPosition = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });

  // Save the PDF
  const filename = `work-orders-summary-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};