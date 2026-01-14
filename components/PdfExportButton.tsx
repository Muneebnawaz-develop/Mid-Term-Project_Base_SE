
import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult } from '../types';

const PdfExportButton: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  const downloadPdf = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(13, 110, 253);
      doc.text('MatchAI Analysis Report', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Candidate: ${result.cv_filename}`, 14, 30);
      doc.text(`Role: ${result.jd_filename}`, 14, 35);
      doc.text(`Date: ${new Date(result.created_at).toLocaleString()}`, 14, 40);

      // Summary Section
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('HR Summary', 14, 55);
      
      doc.setFontSize(11);
      doc.setTextColor(50);
      const splitSummary = doc.splitTextToSize(result.hr_summary, pageWidth - 28);
      doc.text(splitSummary, 14, 62);

      // Score Table
      doc.setTextColor(0);
      doc.setFontSize(14);
      doc.text('Performance Metrics', 14, 105);
      
      autoTable(doc, {
        startY: 110,
        head: [['Metric', 'Score', 'Impact']],
        body: [
          ['Semantic Similarity (TF-IDF)', `${result.sub_scores.tfidf}%`, '50%'],
          ['Hard Skills Match', `${result.sub_scores.skills}%`, '30%'],
          ['Experience Alignment', `${result.sub_scores.experience}%`, '10%'],
          ['Education Compliance', `${result.sub_scores.education}%`, '10%'],
          ['Total Match Score', `${result.overall_score}%`, '100%']
        ],
        theme: 'grid',
        headStyles: { fillColor: [13, 110, 253] },
        styles: { fontSize: 10 }
      });

      // Decision Section
      const finalY = (doc as any).lastAutoTable.finalY || 160;
      doc.setFontSize(14);
      // Fix: jsPDF setTextColor expects individual R, G, B arguments or a color string, not an array.
      const [r, g, b] = result.overall_score >= 70 ? [25, 135, 84] : (result.overall_score >= 40 ? [255, 193, 7] : [220, 53, 69]);
      doc.setTextColor(r, g, b);
      doc.text(`Final Decision: ${result.decision}`, 14, finalY + 20);

      // Skills Section
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('Key Skill Gaps:', 14, finalY + 35);
      doc.setFontSize(10);
      doc.setTextColor(100);
      const missing = result.missing_skills.length > 0 ? result.missing_skills.join(', ') : 'None identified';
      const splitMissing = doc.splitTextToSize(missing, pageWidth - 28);
      doc.text(splitMissing, 14, finalY + 42);

      doc.save(`Analysis_${result.cv_filename.split('.')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <button className="btn btn-primary" onClick={downloadPdf}>
      <span className="me-2">📥</span> Download PDF
    </button>
  );
};

export default PdfExportButton;
