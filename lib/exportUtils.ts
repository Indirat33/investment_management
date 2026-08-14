import jsPDF from "jspdf";
import * as XLSX from "xlsx";

type Investment = {
  id: string;
  assetName: string;
  category: string;
  amount: number;
  purchaseDate: string;
  currentValue: number;
  profitLoss: number;
};

type Summary = {
  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  roiPercentage: number;
  totalCount: number;
};

// Export to Excel (.xlsx)
export function exportToExcel(investments: Investment[]) {
  const excelData = investments.map((inv) => {
    const roi = inv.amount > 0 ? (inv.profitLoss / inv.amount) * 100 : 0;
    return {
      "Asset Name": inv.assetName,
      Category: inv.category,
      "Purchase Date": new Date(inv.purchaseDate).toLocaleDateString(),
      "Invested Amount (Rs.)": inv.amount,
      "Current Value (Rs.)": inv.currentValue,
      "Profit / Loss (Rs.)": inv.profitLoss,
      "ROI (%)": `${roi.toFixed(2)}%`,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Investments");

  // Auto-fit column widths
  const max_width = excelData.reduce((w, r) => {
    return Object.keys(r).map((key, i) => {
      const val = String((r as any)[key]);
      return Math.max(w[i] || 12, val.length + 4, key.length + 4);
    });
  }, [] as number[]);

  worksheet["!cols"] = max_width.map((w) => ({ wch: w }));

  XLSX.writeFile(workbook, `InvestPro_Portfolio_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
}

// Export to PDF (.pdf)
export function exportToPDF(
  investments: Investment[],
  summary: Summary | null,
  userName: string = "Valued User"
) {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("InvestPro", 14, 22);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Portfolio Performance & Asset Report", 14, 32);

  // User & Date Metadata
  doc.setTextColor(51, 65, 85); // slate-700
  doc.setFontSize(10);
  doc.text(`Investor Name: ${userName}`, 14, 48);
  doc.text(`Report Date: ${currentDate}`, 14, 54);

  // Summary Metrics Box
  if (summary) {
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(14, 60, 182, 30, 3, 3, "FD");

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("TOTAL INVESTED", 20, 70);
    doc.text("PORTFOLIO VALUE", 65, 70);
    doc.text("NET PROFIT / LOSS", 115, 70);
    doc.text("OVERALL ROI", 160, 70);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`Rs. ${summary.totalInvested.toLocaleString()}`, 20, 78);
    doc.text(`Rs. ${summary.totalCurrentValue.toLocaleString()}`, 65, 78);

    const isProfit = summary.totalProfitLoss >= 0;
    doc.setTextColor(isProfit ? 16 : 225, isProfit ? 185 : 29, isProfit ? 129 : 72);
    doc.text(`${isProfit ? "+" : ""}Rs. ${summary.totalProfitLoss.toLocaleString()}`, 115, 78);
    doc.text(`${isProfit ? "+" : ""}${summary.roiPercentage.toFixed(2)}%`, 160, 78);
  }

  // Table Title
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Investment Holdings Breakdown", 14, 102);

  // Table Headers
  let y = 110;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(14, y, 182, 8, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("ASSET NAME", 18, y + 5.5);
  doc.text("CATEGORY", 65, y + 5.5);
  doc.text("INVESTED (Rs.)", 100, y + 5.5);
  doc.text("CURRENT (Rs.)", 135, y + 5.5);
  doc.text("PROFIT / LOSS", 165, y + 5.5);

  y += 8;

  // Table Rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  investments.forEach((inv, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    const isProfit = inv.profitLoss >= 0;
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 7, "F");
    }

    doc.setTextColor(15, 23, 42);
    doc.text(inv.assetName.substring(0, 24), 18, y + 5);
    doc.text(inv.category, 65, y + 5);
    doc.text(inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }), 100, y + 5);
    doc.text(inv.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 }), 135, y + 5);

    doc.setTextColor(isProfit ? 16 : 225, isProfit ? 185 : 29, isProfit ? 129 : 72);
    doc.text(`${isProfit ? "+" : ""}Rs. ${inv.profitLoss.toLocaleString()}`, 165, y + 5);

    y += 7;
  });

  // Footer page number
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount} — Generated via InvestPro Platform`, 105, 288, { align: "center" });
  }

  doc.save(`InvestPro_Portfolio_Report_${new Date().toISOString().split("T")[0]}.pdf`);
}
