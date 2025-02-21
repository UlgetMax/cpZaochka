import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx";
import { saveAs } from "file-saver";

export function generateDocx__DiplomSupplement(group, students, specialization, predmet, teacher) {


    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: {
                        font: "Times New Roman",
                        size: 24,
                    },
                },
            },
        },
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "Частное учреждение образования",
                                bold: true,
                                underline: {},
                                size: 32, 
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "«Колледж бизнеса и права» Брестсикй филиал",
                                bold: true,
                                underline: {},
                                size: 32,

                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "(наименование учебного заведения)",
                                size: 24,
        
                            }),
                        ],
                    }),
                    new Paragraph({}),
                    new Paragraph({}),

                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "В Е Д О М О С Т Ь",
                                bold: true,
                                size: 56,
                     
                            }),
                        ],
                    }),

                    new Paragraph({}),

                    new Paragraph ({
                        alignment: AlignmentType.LEFT,
                        children: [
                            new TextRun({
                                text: `отметок успеваемости учащихся группы № ${group}`,
                                size: 28,

                            }),
                            new TextRun({
                                text: `(для занесения в приложение к диплому)`, 
                                size: 28,
                            }),
                        ]
                    }),

                    new Paragraph({}),

                    new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                            new TextRun({
                                text: "Специальность ",
                    
                            }),
                            new TextRun({
                                text: `      ${specialization}      `, 
                                underline: {}, 
                            }),

                            new TextRun({
                                text: "",
                            }),

                            
                            
                        ],
                    }),

                    
                    new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                            new TextRun({
                                text: "Наименование учебной дисциплины ",
                            }),

                            new TextRun({
                                text: `      ${predmet}      `, 
                                underline: {}, 
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                            new TextRun({
                                text: "Преподаватель ",
                            }),

                            new TextRun({
                                text: `      ${teacher}      `, 
                                underline: {}, 
                            }),
                        ],
                    }),

                    new Paragraph({}),

                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [headerText("№ п/п")] }),
                                    new TableCell({ children: [headerText("Ф. И. О. учащегося")] }),
                                    new TableCell({ children: [headerText("Отметказа каждый семестр")] }),
                                    new TableCell({ children: [headerText("Отметка к диплому")] }),
                                    new TableCell({ children: [headerText("Подпись преподавателя")] }),
                                ],
                            }),
                            ...students.map((student, index) =>
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [cellText(index + 1)] }),
                                        new TableCell({ children: [cellText(student.name)] }), 
                                        new TableCell({ children: [cellText("оценка за каждый семестр")] }), //Здесь должно быть по 2 оценки такого формата 4 (четыре) 6 (шесть)
                                        new TableCell({ children: [cellText("отметка к диплому")] }), // здесь одна оценка формат 4 (четыре)
                                        new TableCell({ children: [cellText("")] }),
                                    ],
                                })
                            ),
                        ],
                    }),
                ],
            },
        ],
    });

    Packer.toBlob(doc).then((blob) => {
        saveAs(blob, "diplomSupplement.docx");
    });
}

function headerText(text) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({
                text,
                size: 24,
                font: "Times New Roman",
            }),
        ],
    });
}

function cellText(text) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({
                text: text.toString(),
                size: 24,
                font: "Times New Roman",
            }),
        ],
    });
}
