import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx";
import { saveAs } from "file-saver";

export function generateDocx__DiplomSupplement(course, semester, group, students, specialization, predmet, teacher) {

    // if (!Array.isArray(students) || students.length === 0) {
    //     console.warn("Предупреждение: передан пустой список студентов.");
    // }


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
                                text: "Частное учреждение образования «Колледж бизнеса и права»",
                                bold: true,
                                underline: {},
                                size: 28, // 28 half-points = 14pt
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "Брестский филиал",
                                bold: true,
                                underline: {},
                                size: 28,

                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "(наименование учреждения образования (филиала, иного обособленного подразделения))",
                                size: 20,
        
                            }),
                        ],
                    }),
                    new Paragraph({}),
                    new Paragraph({}),

                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "ЭКЗАМЕНАЦИОННАЯ ВЕДОМОСТЬ ",
                                bold: true,
                                size: 32,
                     
                            }),
                        ],
                    }),

                    new Paragraph({}),

                    new Paragraph ({
                        alignment: AlignmentType.LEFT,
                        children: [
                            new TextRun({
                                text: "Учебный предмет, модуль ",

                            }),
                            new TextRun({
                                text: `      ${predmet}      `, 
                                underline: {}, 
                            }),
                        ]
                    }),

                    new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                            new TextRun({
                                text: "Курс ",
                    
                            }),
                            new TextRun({
                                text: `      ${course}      `, 
                                underline: {}, 
                            }),

                            new TextRun({
                                text: "Семестр ",
                            }),

                            new TextRun({
                                text: `      ${semester}      `, 
                                underline: {}, 
                            }),
                            new TextRun({
                                text: "Учебная группа ",
                            }),

                            new TextRun({
                                text: `      ${group}      `, 
                                underline: {}, 
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                            new TextRun({
                                text: "Специальность ",
                    
                            }),
                            new TextRun({
                                text: `      «${specialization}»      `, 
                                underline: {}, 
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                            new TextRun({
                                text: "Преподаватель(и) ",
                    
                            }),
                            new TextRun({
                                text: `      ${teacher}      `, 
                                underline: {}, 
                            }),
                        ],
                    }),

                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "(фамилия, собственное имя, отчество (если таковое имеется))",
                                size: 20,
                            }),
                        ],
                    }),

                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [headerText("№ п/п")] }),
                                    new TableCell({ children: [headerText("Фамилия, имя, отчество")] }),
                                    new TableCell({ children: [headerText("Отметка о зачёте")] }),
                                    new TableCell({ children: [headerText("Вариант задания")] }),
                                    new TableCell({ children: [headerText("Отметка")] }),
                                    new TableCell({ children: [headerText("Подпись преподавателя")] }),
                                ],
                            }),
                            ...students.map((student, index) =>
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [cellText(index + 1)] }),
                                        new TableCell({ children: [cellText(student.name)] }), 
                                        // new TableCell({ children: [cellText(student.pass ? "зачтено" : "незачёт")] }),
                                        new TableCell({ children: [cellText("зачтено")] }),
                                        new TableCell({ children: [cellText(student.variant || "-")] }),
                                        new TableCell({ children: [cellText(student.mark || "-")] }),
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
        saveAs(blob, "vedomost.docx");
    });
}

function headerText(text) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({
                text,
                bold: true,
                underline: {},
                size: 28,
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
                size: 28,
                font: "Times New Roman",
            }),
        ],
    });
}
