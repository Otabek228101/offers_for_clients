import jsPDF from 'jspdf';

export const generateHotelPDF = (hotel, proposalData = null) => {
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
            ]
        },
        {
            title: 'Details & Amenities',
            items: [
                { label: 'Address', value: hotel.address },
                { label: 'Breakfast', value: hotel.breakfast ? 'Included' : 'Not included' },
                { label: 'Hotel Type', value: hotel.type || 'Standard' },
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

        section.items.forEach((item, itemIndex) => {
            if (sectionY > 260) {
                pdf.addPage();
                sectionY = 20;
            }

            pdf.setFont('helvetica', 'bold');
            pdf.text(`${item.label}:`, leftColumn, sectionY);
            pdf.setFont('helvetica', 'normal');

            const lines = pdf.splitTextToSize(String(item.value), 160);
            pdf.text(lines, leftColumn + 30, sectionY);

            sectionY += Math.max(8, lines.length * 5);

            if (itemIndex < section.items.length - 1) {
                pdf.setDrawColor(200, 200, 200);
                pdf.line(leftColumn, sectionY - 2, leftColumn + 160, sectionY - 2);
                sectionY += 4;
            }
        });

        currentY = sectionY + 10;
    });

    yPosition = currentY;

    if (hotel.website_link || hotel.location_link) {
        pdf.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
        pdf.roundedRect(10, yPosition, 190, 25, 2, 2, 'F');

        pdf.setFontSize(11);
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text('IMPORTANT LINKS', 15, yPosition + 12);

        yPosition += 30;

        let linkY = yPosition;

        if (hotel.website_link) {
            pdf.setFontSize(9);
            pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Booking Website:', 15, linkY);

            pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            pdf.setFont('helvetica', 'normal');

            const truncatedWebsite = hotel.website_link.length > 40
                ? hotel.website_link.substring(0, 40) + '...'
                : hotel.website_link;

            try {
                pdf.textWithLink(truncatedWebsite, 50, linkY, { url: hotel.website_link });
            } catch (e) {
                pdf.text(truncatedWebsite, 50, linkY);
            }
            linkY += 6;

            pdf.setTextColor(150, 150, 150);
            pdf.setFontSize(7);
            pdf.text('Click to open booking page', 50, linkY);
            linkY += 12;
        }

        if (hotel.location_link) {
            pdf.setFontSize(9);
            pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Location Map:', 15, linkY);

            pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            pdf.setFont('helvetica', 'normal');

            const truncatedLocation = hotel.location_link.length > 40
                ? hotel.location_link.substring(0, 40) + '...'
                : hotel.location_link;

            try {
                pdf.textWithLink(truncatedLocation, 50, linkY, { url: hotel.location_link });
            } catch (e) {
                pdf.text(truncatedLocation, 50, linkY);
            }
            linkY += 6;

            pdf.setTextColor(150, 150, 150);
            pdf.setFontSize(7);
            pdf.text('Click to view on map', 50, linkY);
            linkY += 12;
        }

        yPosition = linkY + 8;
    }

    if (proposalData && proposalData.clientName) {
        pdf.addPage();
        yPosition = 20;

        pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        pdf.rect(0, 0, 210, 35, 'F');

        pdf.setFontSize(18);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PROPOSAL DETAILS', 105, 20, { align: 'center' });

        yPosition = 45;

        const proposalSections = [
            {
                title: 'Client Information',
                items: [
                    { label: 'Client Name', value: proposalData.clientName },
                    { label: 'Number of Guests', value: proposalData.guests },
                    { label: 'Number of Rooms', value: proposalData.numberOfRooms },
                    { label: 'Room Type', value: proposalData.roomType },
                ]
            },
            {
                title: 'Stay Details',
                items: [
                    { label: 'Check-in Date', value: formatDate(proposalData.checkIn) },
                    { label: 'Check-out Date', value: formatDate(proposalData.checkOut) },
                    { label: 'Number of Nights', value: proposalData.nights },
                    { label: 'Total Price', value: `€${proposalData.price}` },
                ]
            },
            {
                title: 'Additional Services',
                items: [
                    { label: 'Breakfast Included', value: proposalData.breakfast ? 'Yes' : 'No' },
                    { label: 'Free Cancellation', value: proposalData.freeCancel ? 'Yes' : 'No' },
                ]
            }
        ];

        proposalSections.forEach((section, index) => {
            const sectionX = 15;
            const sectionY = yPosition + (index * 70);

            pdf.setFillColor(249, 249, 249);
            pdf.roundedRect(sectionX, sectionY, 180, 60, 5, 5, 'F');
            pdf.setDrawColor(200, 200, 200);
            pdf.roundedRect(sectionX, sectionY, 180, 60, 5, 5, 'S');

            pdf.setFontSize(10);
            pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.setFont('helvetica', 'bold');
            pdf.text(section.title, sectionX + 10, sectionY + 12);

            let itemY = sectionY + 20;
            pdf.setFontSize(8);
            pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

            section.items.forEach((item, itemIndex) => {
                pdf.setFont('helvetica', 'bold');
                pdf.text(`${item.label}:`, sectionX + 12, itemY + 4);
                pdf.setFont('helvetica', 'normal');

                const valueLines = pdf.splitTextToSize(String(item.value), 150);
                pdf.text(valueLines, sectionX + 12, itemY + 8);

                itemY += Math.max(10, valueLines.length * 3.5);
            });
        });

        yPosition += 220;

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
