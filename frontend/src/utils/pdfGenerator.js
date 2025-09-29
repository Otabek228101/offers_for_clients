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

export const generateHotelPDF = async (hotel, proposalData = null) => {
  const pdf = new jsPDF();
  const primary = [41, 128, 185];
  const secondary = [52, 152, 219];
  const text = [52, 73, 94];
  const light = [236, 240, 241];

  let y = 40;

  pdf.setFillColor(primary[0], primary[1], primary[2]);
  pdf.rect(0, 0, 210, 30, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('HOTEL PROPOSAL', 15, 18);

  pdf.setFillColor(light[0], light[1], light[2]);
  pdf.roundedRect(10, y, 190, 20, 2, 2, 'F');
  pdf.setFontSize(14);
  pdf.setTextColor(primary[0], primary[1], primary[2]);
  pdf.setFont('helvetica', 'bold');
  pdf.text('HOTEL INFORMATION', 15, y + 12);
  y += 30;

  const left = 15;
  const right = 110;
  const lh = 8;

  const addField = (label, value, x, yy) => {
    pdf.setFontSize(10);
    pdf.setTextColor(text[0], text[1], text[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${label}:`, x, yy);
    pdf.setFont('helvetica', 'normal');
    pdf.text((value || '-').toString(), x + 35, yy);
  };

  addField('Name', hotel.name, left, y);
  addField('City', hotel.city, right, y);
  y += lh;

  addField('Address', hotel.address, left, y);
  addField('Stars', hotel.stars ? String(hotel.stars) : '-', right, y);
  y += lh;

  addField('Group', hotel.group_name, left, y);
  addField('Type', hotel.type, right, y);
  y += lh;

  addField('Website', hotel.website_link, left, y);
  addField('Location', hotel.location_link, right, y);
  y += lh;

  addField('Breakfast', hotel.breakfast ? 'Yes' : 'No', left, y);
  y += 20;

  const drawSection = (title, rows) => {
    let sectionY = y;
    const height = rows.length * 10 + 20;
    if (sectionY + height > 280) {
      pdf.addPage();
      sectionY = 20;
    }
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(10, sectionY, 190, height, 2, 2, 'FD');
    pdf.setFontSize(11);
    pdf.setTextColor(secondary[0], secondary[1], secondary[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 15, sectionY + 10);
    pdf.setFontSize(10);
    pdf.setTextColor(text[0], text[1], text[2]);
    pdf.setFont('helvetica', 'normal');
    let yy = sectionY + 18;
    rows.forEach(([k, v]) => {
      pdf.text(`${k}:`, 15, yy);
      pdf.text((v || '-').toString(), 60, yy);
      yy += 8;
    });
    y = sectionY + height + 5;
  };

  if (proposalData) {
    drawSection('PROPOSAL', [
      ['Client', proposalData.clientName || '-'],
      ['Guests', String(proposalData.guests || '-')],
      ['Check-in', proposalData.checkIn || '-'],
      ['Check-out', proposalData.checkOut || '-'],
      ['Breakfast', proposalData.breakfast ? 'Yes' : 'No'],
      ['Free cancel', proposalData.freeCancel ? 'Yes' : 'No'],
      ['Rooms', (proposalData.rooms || []).map(r => r.count).join(', ') || '-'],
      ['Price', proposalData.price != null ? `${proposalData.price}` : '-'],
    ]);
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

  try {
    const r = await fetch(`http://localhost:8080/api/hotels/${hotel.id}/images/base64?limit=9`);
    if (r.ok) {
      const { images } = await r.json();
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
    }
  } catch (e) {}

  pdf.save(`${hotel.name || 'hotel'}-proposal.pdf`);
};
