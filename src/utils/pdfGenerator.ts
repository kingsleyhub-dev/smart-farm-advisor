import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalysisData {
  crop_type: string;
  location: string;
  farm_size: number;
  soil_ph: number;
  n_level: string;
  p_level: string;
  k_level: string;
  created_at: string;
}

interface RecommendationData {
  seed_advice: string;
  fertilizer_advice: string;
  irrigation_advice: string;
}

export const generatePDF = async (
  analysis: AnalysisData,
  recommendation: RecommendationData
): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;

  // Header with logo area
  pdf.setFillColor(47, 133, 90); // Primary green
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Smart Farm Input Advisor', margin, 20);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Agricultural Advisory Report', margin, 30);
  
  yPosition = 50;

  // Reset text color
  pdf.setTextColor(0, 0, 0);

  // Date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  const date = new Date(analysis.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  pdf.text(`Generated: ${date}`, margin, yPosition);
  yPosition += 15;

  // Section: Farm Details
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(47, 133, 90);
  pdf.text('Farm Details', margin, yPosition);
  yPosition += 8;

  // Draw a line
  pdf.setDrawColor(47, 133, 90);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Farm details content
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  const farmDetails = [
    `Crop Type: ${analysis.crop_type}`,
    `Location: ${analysis.location}`,
    `Farm Size: ${analysis.farm_size} acres`,
    `Soil pH Level: ${analysis.soil_ph}`,
    `Nitrogen (N): ${analysis.n_level}`,
    `Phosphorus (P): ${analysis.p_level}`,
    `Potassium (K): ${analysis.k_level}`
  ];

  farmDetails.forEach(detail => {
    pdf.text(detail, margin, yPosition);
    yPosition += 7;
  });
  yPosition += 5;

  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = margin;
  }

  // Section: Seed Recommendation
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(47, 133, 90);
  pdf.text('Seed Recommendation', margin, yPosition);
  yPosition += 8;

  pdf.setDrawColor(47, 133, 90);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  const seedLines = pdf.splitTextToSize(recommendation.seed_advice, contentWidth);
  seedLines.forEach((line: string) => {
    if (yPosition > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    pdf.text(line, margin, yPosition);
    yPosition += 6;
  });
  yPosition += 8;

  // Section: Fertilizer Advice
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = margin;
  }

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(47, 133, 90);
  pdf.text('Fertilizer Advice', margin, yPosition);
  yPosition += 8;

  pdf.setDrawColor(47, 133, 90);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  const fertilizerLines = pdf.splitTextToSize(recommendation.fertilizer_advice, contentWidth);
  fertilizerLines.forEach((line: string) => {
    if (yPosition > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    pdf.text(line, margin, yPosition);
    yPosition += 6;
  });
  yPosition += 8;

  // Section: Irrigation Schedule
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = margin;
  }

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(47, 133, 90);
  pdf.text('Irrigation Schedule', margin, yPosition);
  yPosition += 8;

  pdf.setDrawColor(47, 133, 90);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  const irrigationLines = pdf.splitTextToSize(recommendation.irrigation_advice, contentWidth);
  irrigationLines.forEach((line: string) => {
    if (yPosition > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    pdf.text(line, margin, yPosition);
    yPosition += 6;
  });

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.setFont('helvetica', 'italic');
    pdf.text(
      `Smart Farm Input Advisor - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `Farm_Analysis_${analysis.crop_type}_${date.replace(/\s/g, '_')}.pdf`;
  pdf.save(fileName);
};
