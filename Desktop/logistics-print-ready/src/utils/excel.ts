import * as XLSX from 'xlsx-js-style';
import { StopData } from '../types';

export const exportToExcel = (stops: StopData[]) => {
    const ws_data: any[][] = [];

    const styleBorder = { border: { top: {style:"thin"}, bottom: {style:"thin"}, left: {style:"thin"}, right: {style:"thin"} }, alignment: { vertical: "center", wrapText: true } };
    const styleHeader = { font: { bold: true }, fill: { fgColor: { rgb: "E2E8F0" } }, border: { top: {style:"thin"}, bottom: {style:"thin"}, left: {style:"thin"}, right: {style:"thin"} }, alignment: { horizontal: "center", vertical: "center" } };

    ws_data.push([{ v: "МАРШРУТНИЙ ЛИСТ", s: { font: { bold: true, sz: 14 } } }, { v: new Date().toLocaleString(), s: { alignment: { horizontal: "right" } } }]);
    ws_data.push([]);

    const headers = ["ЛОКАЦІЯ", "ДІЯ", "ВАНТАЖ", "КУДИ / ДЕТАЛІ", "ВІДМІТКА"];
    ws_data.push(headers.map(h => ({ v: h, s: styleHeader })));

    stops.forEach(stop => {
        stop.rawPickups.forEach(p => {
            ws_data.push([
                { v: stop.locationName.toUpperCase(), s: styleBorder },
                { v: "ЗАБРАТИ", s: styleBorder },
                { v: p.goods, s: styleBorder },
                { v: `на ${p.target}`, s: styleBorder },
                { v: "", s: styleBorder }
            ]);
        });

        stop.rawDrops.forEach(d => {
            ws_data.push([
                { v: stop.locationName.toUpperCase(), s: styleBorder },
                { v: "ВІДДАТИ", s: styleBorder },
                { v: d.goods, s: styleBorder },
                { v: "-", s: styleBorder },
                { v: "", s: styleBorder }
            ]);
        });

        if (stop.rawPickups.length === 0 && stop.rawDrops.length === 0) {
            ws_data.push([
                { v: stop.locationName.toUpperCase(), s: styleBorder },
                { v: "ПРИБУТТЯ", s: styleBorder },
                { v: "-", s: styleBorder },
                { v: "-", s: styleBorder },
                { v: "", s: styleBorder }
            ]);
        }

        for(let i=0; i<2; i++) {
            ws_data.push([
                { v: stop.locationName, s: styleBorder },
                { v: "Додатково:", s: styleBorder },
                { v: "", s: styleBorder },
                { v: "", s: styleBorder },
                { v: "", s: styleBorder }
            ]);
        }
        ws_data.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, ws_data, { origin: "A1" });
    ws['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 20 }, { wch: 10 }];
    ws['!pageSetup'] = { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToHeight: 0, fitToWidth: 1 };
    ws['!margins'] = { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Маршрут");
    XLSX.writeFile(wb, "route_list_print.xlsx");
};