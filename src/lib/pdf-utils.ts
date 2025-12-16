import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalysisResult {
  formattedFinalResults: string[];
  mariagePairs: string[];
  analysisSets: Array<{
    id: string;
    inputIndices: number[];
    matchingResult: {
      category: string;
      subCategory: string;
      days: Record<string, number[]>;
    };
  }>;
  inputLabels: string[];
  location: string;
  date: Date;
  inputNumbers: string[];
}

export async function generateAnalysisPDF({
  formattedFinalResults,
  mariagePairs,
  analysisSets,
  inputLabels,
  location,
  date,
  inputNumbers
}: AnalysisResult): Promise<jsPDF> {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Add title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PI-Number Analysis Report', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Add metadata
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Location: ${location}`, margin, yPos);
  doc.text(`Date: ${date.toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 8;

  // Add input numbers section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Input Numbers', margin, yPos);
  yPos += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const inputData = inputNumbers.map((num, index) => `${inputLabels[index]}: ${num || '--'}`);
  doc.text(inputData.join('   '), margin, yPos);
  yPos += 12;

  // Add analysis sets section
  if (analysisSets.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Number Mappings Found', margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    analysisSets.forEach((set, index) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
     I see the PDF utilities file was cut off. Let me complete it and fix the missing function:

<dyad-write path="src/lib/pdf-utils.ts" description="Complete PDF utilities with all necessary functions">
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalysisResult {
  formattedFinalResults: string[];
  mariagePairs: string[];
  analysisSets: Array<{
    id: string;
    inputIndices: number[];
    matchingResult: {
      category: string;
      subCategory: string;
      days: Record<string, number[]>;
    };
  }>;
  inputLabels: string[];
  location: string;
  date: Date;
  inputNumbers: string[];
}

export async function generateAnalysisPDF({
  formattedFinalResults,
  mariagePairs,
  analysisSets,
  inputLabels,
  location,
  date,
  inputNumbers
}: AnalysisResult): Promise<jsPDF> {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Add title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PI-Number Analysis Report', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Add metadata
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Location: ${location}`, margin, yPos);
  doc.text(`Date: ${date.toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 8;

  // Add input numbers section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Input Numbers', margin, yPos);
  yPos += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const inputData = inputNumbers.map((num, index) => `${inputLabels[index]}: ${num || '--'}`);
  doc.text(inputData.join('   '), margin, yPos);
  yPos += 12;

  // Add analysis sets section
  if (analysisSets.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Number Mappings Found', margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    analysisSets.forEach((set, index) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }

      const inputLabelsForSet = set.inputIndices.map(index => inputLabels[index]);
      const dayEntries = Object.entries(set.matchingResult.days);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Set ${index + 1}: ${set.matchingResult.category} - ${set.matchingResult.subCategory}`, margin, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Triggered by: ${inputLabelsForSet.join(', ')}`, margin + 5, yPos);
      yPos += 5;
      
      dayEntries.forEach(([frenchDay, numbers]) => {
        const englishDay = getEnglishDayName(frenchDay);
        doc.text(`${englishDay}: ${numbers.join(', ')}`, margin + 10, yPos);
        yPos += 5;
      });
      
      yPos += 3;
    });
    
    yPos += 5;
  }

  // Add historical hits section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Historical Hits (Last 5 Weeks)', margin, yPos);
  yPos += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  if (formattedFinalResults.length > 0) {
    const hitsText = formattedFinalResults.join(', ');
    const splitHits = doc.splitTextToSize(hitsText, pageWidth - 2 * margin);
    doc.text(splitHits, margin, yPos);
    yPos += splitHits.length * 6 + 5;
  } else {
    doc.text('No historical matches found across the last 5 weeks.', margin, yPos);
    yPos += 8;
  }

  // Add mariage pairs section
  if (mariagePairs.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Mariage Pairs (Shared Digit)', margin, yPos);
    yPos += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const pairsText = mariagePairs.join('   ');
    const splitPairs = doc.splitTextToSize(pairsText, pageWidth - 2 * margin);
    doc.text(splitPairs, margin, yPos);
    yPos += splitPairs.length * 6 + 5;
  }

  // Add footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Generated by PI-Number Analysis System', pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text(new Date().toLocaleString(), pageWidth / 2, pageHeight - 5, { align: 'center' });

  return doc;
}

export async function downloadAnalysisPDF(result: AnalysisResult, filename?: string) {
  try {
    const doc = await generateAnalysisPDF(result);
    const defaultFilename = `pi-number-analysis-${result.location.toLowerCase()}-${result.date.toISOString().split('T')[0]}.pdf`;
    doc.save(filename || defaultFilename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}

export async function captureElementAsPDF(elementId: string, filename?: string) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate dimensions to fit the image on the page
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight) * 0.95;
    const imgX = (pageWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    const defaultFilename = `pi-number-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename || defaultFilename);
    return true;
  } catch (error) {
    console.error('Error capturing element as PDF:', error);
    return false;
  }
}

function getEnglishDayName(frenchDay: string): string {
  const dayMap: Record<string, string> = {
    lundi: "Monday",
    mardi: "Tuesday",
    mercredi: "Wednesday",
    jeudi: "Thursday",
    vendredi: "Friday",
    samedi: "Saturday",
    dimanche: "Sunday"
  };
  
  return dayMap[frenchDay.toLowerCase()] || frenchDay;
}