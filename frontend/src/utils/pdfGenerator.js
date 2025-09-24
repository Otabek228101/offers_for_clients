import jsPDF from 'jspdf';

export const generateHotelPDF = async (hotel, proposalData = null) => {
    const pdf = new jsPDF();

    const primaryColor = [41, 128, 185];
    const secondaryColor = [52, 152, 219];
    const accentColor = [46, 204, 113];
    const textColor = [52, 73, 94];
    const lightColor = [236, 240, 241];

    let yPosition = 20;

    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, 210, 50, 'F');

    pdf.setFontSize(22);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HOTEL PROPOSAL', 105, 20, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255, 0.8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Professional Hotel Information Document', 105, 28, { align: 'center' });

    yPosition = 55;

    // Добавление фото отеля с обработкой и ресайзом через прокси
    if (hotel.image_url) {
        try {
            // Используем прокси cors-anywhere для обхода CORS
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const imgResponse = await fetch(proxyUrl + hotel.image_url, { mode: 'cors' });
            if (!imgResponse.ok) {
                throw new Error(`HTTP error! Status: ${imgResponse.status} - ${imgResponse.statusText}`);
            }
            const imgBlob = await imgResponse.blob();

            // Создаём временный элемент img для ресайза
            const img = new Image();
            const imgUrl = URL.createObjectURL(imgBlob);
            img.src = imgUrl;
            await new Promise((resolve) => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxWidth = 180;
                    const maxHeight = 100;
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(async (resizedBlob) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            pdf.addImage(reader.result, 'JPEG', 15, yPosition, 180, 100);
                            yPosition += 110;
                        };
                        reader.readAsDataURL(resizedBlob);
                        resolve();
                    }, 'image/jpeg', 0.9);
                };
                img.onerror = () => {
                    throw new Error('Image failed to load');
                };
            });
        } catch (err) {
            console.error('Failed to load or process hotel image:', err.message, 'URL:', hotel.image_url);
        }
    }

    pdf.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
    pdf.roundedRect(10, yPosition, 190, 20, 2, 2, 'F');

    pdf.setFontSize(14);
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HOTEL INFORMATION', 15, yPosition + 12);

    yPosition += 30;

    const leftColumn = 15;
    let currentY = yPosition;

    const hotelSections = [
        {
            title: 'Basic Information',
            items: [
                { label: 'Hotel Name', value: hotel.name },
                { label: 'City', value: hotel.city },
                { label: 'Group', value: hotel.group_name || 'Not specified' },
                { label: 'Star Rating', value: `${hotel.stars}/5` },
                { label: 'Website Link', value: hotel.website_link || 'Not specified' },
            ]
        },
        {
            title: 'Details & Amenities',
            items: [
                { label: 'Address', value: hotel.address },
                { label: 'Breakfast', value: hotel.breakfast ? 'Included' : 'Not included' },
                { label: 'Hotel Type', value: hotel.type || 'Standard' },
                { label: 'Location Link', value: hotel.location_link || 'Not specified' },
            ]
        }
    ];

    hotelSections.forEach((section) => {
        let sectionY = currentY;

        pdf.setFontSize(11);
        pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text(section.title, leftColumn, sectionY);
        sectionY += 6;

        pdf.setFontSize(9);
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        pdf.setFont('helvetica', 'normal');

        const sectionX = leftColumn;
        pdf.roundedRect(sectionX, sectionY + 2, 180, 10, 2, 2, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.text(section.title, sectionX + 10, sectionY + 10);
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

        let itemY = sectionY + 20;
        pdf.setFontSize(8);

        section.items.forEach((item, itemIndex) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${item.label}:`, sectionX + 12, itemY + 4);
            pdf.setFont('helvetica', 'normal');

            const valueLines = pdf.splitTextToSize(String(item.value), 150);
            pdf.text(valueLines, sectionX + 12, itemY + 8);

            itemY += Math.max(10, valueLines.length * 3.5);
        });

        currentY = itemY + 10;
    });

    yPosition = currentY + 20;

    if (proposalData) {
        pdf.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
        pdf.roundedRect(15, yPosition, 180, 25, 2, 2, 'F');

        pdf.setFontSize(11);
        pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PRICE SUMMARY', 105, yPosition + 10, { align: 'center' });

        pdf.setFontSize(9);
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        pdf.text(`Total for ${proposalData.nights} nights: €${proposalData.price}`, 105, yPosition + 18, { align: 'center' });
    }

    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);

        pdf.setFontSize(7);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });

        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        pdf.text(`Generated on: ${currentDate}`, 105, 290, { align: 'center' });

        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.text('Hotel Management System © 2024', 105, 280, { align: 'center' });
    }

    const fileName = `hotel_proposal_${hotel.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    pdf.save(fileName);
};

function formatDate(dateString) {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}