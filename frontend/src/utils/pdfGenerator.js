import jsPDF from 'jspdf';

const loadImageSize = (dataUrl) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.src = dataUrl;
  });

const convertWebpToJpeg = (dataUrl) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth || img.width || 0;
      c.height = img.naturalHeight || img.height || 0;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const out = c.toDataURL('image/jpeg', 0.9);
      resolve(out);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });

const normalizeForPdf = async (dataUrl) => {
  const m = /^data:([^;]+);/i.exec(dataUrl);
  const mime = m ? m[1].toLowerCase() : 'image/jpeg';
  if (mime === 'image/webp') {
    const jpeg = await convertWebpToJpeg(dataUrl);
    return { dataUrl: jpeg, format: 'JPEG' };
  }
  if (mime === 'image/png') return { dataUrl, format: 'PNG' };
  return { dataUrl, format: 'JPEG' };
};

const shortenUrl = (u) => {
  try {
    const url = new URL(u);
    const host = url.hostname.replace(/^www\./i, '');
    let path = url.pathname || '';
    if (path.endsWith('/')) path = path.slice(0, -1);
    let s = host + path;
    if (s.length > 38) s = s.slice(0, 38) + '…';
    return s || host;
  } catch {
    let s = String(u || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    if (s.length > 38) s = s.slice(0, 38) + '…';
    return s;
  }
};

const drawFieldPair = (pdf, y, leftX, rightX, labelW, lineH, leftLabel, leftValue, rightLabel, rightValue) => {
  const marginR = 15;
  const leftValX = leftX + labelW;
  const rightValX = rightX + labelW;
  const leftValW = rightX - leftValX - 5;
  const rightValW = 210 - marginR - rightValX;

  const leftLines = pdf.splitTextToSize(String(leftValue ?? '-'), Math.max(10, leftValW));
  const rightLines = pdf.splitTextToSize(String(rightValue ?? '-'), Math.max(10, rightValW));
  const rows = Math.max(leftLines.length, rightLines.length);
  const blockH = rows * lineH;

  if (y + blockH > 280) {
    pdf.addPage();
    y = 20;
  }

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${leftLabel}:`, leftX, y);
  pdf.text(`${rightLabel}:`, rightX, y);

  pdf.setFont('helvetica', 'normal');
  for (let i = 0; i < leftLines.length; i++) {
    pdf.text(leftLines[i], leftValX, y + i * lineH);
  }
  for (let i = 0; i < rightLines.length; i++) {
    pdf.text(rightLines[i], rightValX, y + i * lineH);
  }

  return y + blockH;
};

const drawHotelPage = async (pdf, hotel) => {
  const primary = [41, 128, 185];
  const text = [52, 73, 94];
  const light = [236, 240, 241];

  pdf.setLineHeightFactor(1.2);

  let y = 40;

  pdf.setFillColor(primary[0], primary[1], primary[2]);
  pdf.rect(0, 0, 210, 30, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('HOTEL', 15, 18);

  pdf.setFillColor(light[0], light[1], light[2]);
  pdf.roundedRect(10, y, 190, 20, 2, 2, 'F');
  pdf.setFontSize(14);
  pdf.setTextColor(primary[0], primary[1], primary[2]);
  pdf.setFont('helvetica', 'bold');
  pdf.text('HOTEL INFORMATION', 15, y + 12);
  y += 30;

  pdf.setTextColor(text[0], text[1], text[2]);

  const leftX = 15;
  const rightX = 110;
  const labelW = 28;
  const lineH = 6.5;

  y = drawFieldPair(pdf, y, leftX, rightX, labelW, lineH, 'Name', hotel.name || '-', 'City', hotel.city || '-');
  y = drawFieldPair(pdf, y, leftX, rightX, labelW, lineH, 'Address', hotel.address || '-', 'Stars', hotel.stars ? String(hotel.stars) : '-');
  y = drawFieldPair(pdf, y, leftX, rightX, labelW, lineH, 'Group', hotel.group_name || '-', 'Type', hotel.type || '-');
  y = drawFieldPair(pdf, y, leftX, rightX, labelW, lineH, 'Website', shortenUrl(hotel.website_link || ''), 'Location', shortenUrl(hotel.location_link || ''));
  y = drawFieldPair(pdf, y, leftX, rightX, labelW, lineH, 'Breakfast', hotel.breakfast ? 'Yes' : 'No', '', '');

  let images = [];
  try {
    const r = await fetch(`http://localhost:8080/api/hotels/${hotel.id}/images/base64`);
    if (r.ok) {
      const js = await r.json();
      images = Array.isArray(js.images) ? js.images : [];
    }
  } catch {}

  if (images.length === 0) {
    return;
  }

  if (y + 30 > 280) {
    pdf.addPage();
    y = 20;
  }

  pdf.setFillColor(light[0], light[1], light[2]);
  pdf.roundedRect(10, y, 190, 20, 2, 2, 'F');
  pdf.setFontSize(14);
  pdf.setTextColor(primary[0], primary[1], primary[2]);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PHOTOS', 15, y + 12);
  y += 30;

  for (const raw of images) {
    const { dataUrl, format } = await normalizeForPdf(raw);
    const { w, h } = await loadImageSize(dataUrl);
    const maxW = 180;
    const maxH = 90;
    let drawW = maxW;
    let drawH = maxH;
    if (w > 0 && h > 0) {
      const ratio = Math.min(maxW / w, maxH / h);
      drawW = Math.max(10, Math.round(w * ratio));
      drawH = Math.max(10, Math.round(h * ratio));
    }
    if (y + drawH > 280) {
      pdf.addPage();
      y = 20;
    }
    pdf.addImage(dataUrl, format, 15, y, drawW, drawH);
    y += drawH + 8;
  }
};

export const generateHotelPDF = async (hotel, proposalData = null) => {
  const pdf = new jsPDF();
  await drawHotelPage(pdf, hotel);
  if (proposalData) {
    let y = 20;
    const secondary = [52, 152, 219];
    const text = [52, 73, 94];
    const light = [236, 240, 241];
    pdf.addPage();
    pdf.setFillColor(light[0], light[1], light[2]);
    pdf.roundedRect(10, y, 190, 20, 2, 2, 'F');
    pdf.setFontSize(14);
    pdf.setTextColor(secondary[0], secondary[1], secondary[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PROPOSAL', 15, y + 12);
    y += 28;
    const rows = [
      ['Client', proposalData.clientName || '-'],
      ['Guests', String(proposalData.guests || '-')],
      ['Check-in', proposalData.checkIn || '-'],
      ['Check-out', proposalData.checkOut || '-'],
      ['Breakfast', proposalData.breakfast ? 'Yes' : 'No'],
      ['Free cancel', proposalData.freeCancel ? 'Yes' : 'No'],
      ['Rooms', (proposalData.rooms || []).map(r => r.count).join(', ') || '-'],
      ['Price', proposalData.price != null ? `${proposalData.price}` : '-'],
    ];
    pdf.setFontSize(10);
    pdf.setTextColor(text[0], text[1], text[2]);
    pdf.setFont('helvetica', 'normal');
    const lineH = 6.5;
    rows.forEach(([k, v], i) => {
      const vs = pdf.splitTextToSize((v || '-').toString(), 120);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${k}:`, 15, y);
      pdf.setFont('helvetica', 'normal');
      vs.forEach((ln, idx) => pdf.text(ln, 60, y + idx * lineH));
      y += Math.max(1, vs.length) * lineH;
      if (y > 280 && i < rows.length - 1) {
        pdf.addPage();
        y = 20;
      }
    });
  }
  pdf.save(`${hotel.name || 'hotel'}-proposal.pdf`);
};

export const generateAllHotelsPDF = async (hotels) => {
  const pdf = new jsPDF();
  for (let i = 0; i < hotels.length; i++) {
    if (i > 0) pdf.addPage();
    await drawHotelPage(pdf, hotels[i]);
  }
  pdf.save('all-hotels.pdf');
};
