import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx";
import { saveAs } from "file-saver";

export function generateDocx(course, semester, group, students, specialization, predmet, teacher) {

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
                properties: {
                    page: {
                        margin: {
                            top: 1134,    // Верхнее поле: 2 см
                            bottom: 1134, // Нижнее поле: 2 см
                            left: 1701,   // Левое поле: 3 см
                            right: 850,   // Правое поле: 1.5 см
                        },
                    },
                },
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
                                underline: {}, 
                                text: `      ${teacher}`, 
                            }),
                            new TextRun({
                                underline: {}, 
                                text: "      ", 
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

                    new Paragraph({}),

                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [headerText("№ п/п")] }),
                                    new TableCell({ children: [headerText("Фамилия, собственное имя, отчество (если таковое имеется) обучающегося")] }),
                                    new TableCell({ children: [headerText("Отметка о зачёте домашних контрольных работ")] }),
                                    new TableCell({ children: [headerText("Вариант задания")] }),
                                    new TableCell({ children: [headerText("Отметка")] }),
                                    new TableCell({ children: [headerText("Подпись преподавателя(ей)")] }),
                                ],
                            }),

                            new TableRow({
                                children: [
                                    new TableCell({ children: [headerText("1")] }),
                                    new TableCell({ children: [headerText("2")] }),
                                    new TableCell({ children: [headerText("3")] }),
                                    new TableCell({ children: [headerText("4")] }),
                                    new TableCell({ children: [headerText("5")] }),
                                    new TableCell({ children: [headerText("6")] }),
                                ],
                            }),
                            ...students.map((student, index) =>
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [cellText(`${index + 1}.`)] }),
                                        new TableCell({ children: [cellText(student.name)] }), 
                                        // new TableCell({ children: [cellText(student.pass ? "зачтено" : "незачёт")] }),
                                        new TableCell({ children: [cellText("зачтено")] }),
                                        new TableCell({ children: [cellText("")] }),
                                        new TableCell({ children: [cellText("")] }),
                                        new TableCell({ children: [cellText("")] }),
                                    ],
                                })
                            ),
                        ],
                    }),
                    new Paragraph({}),
                    new Paragraph({}),

                    new Paragraph({
                        alignment: AlignmentType.left,
                        children: [
                            new TextRun({
                                text: "14.06.2025",
                                size: 24,
                            }),
                        ],
                    }),

                    new Paragraph({}),


                    new Paragraph({
                        alignment: AlignmentType.JUSTIFIED, 
                        indent: { firstLine: 709 }, 
                        children: [
                            new TextRun({
                                text: "Указанные в графах № 3,4 контрольные работы в количестве",
                                size: 24,
                            }),
                            new TextRun({
                                underline: {},
                                text: "         ",
                            }),
                            new TextRun({
                                text: " шт.",
                            }),
                        ],
                    }),
                    
                    new Paragraph({
                        alignment: AlignmentType.JUSTIFIED, 
                        children: [
                            new TextRun({
                                text: "сдал преподаватель __________________ \t\t______________________________,",
                                size: 24,
                            }),
                        ],
                    }),

                    new Paragraph({
                        alignment: AlignmentType.JUSTIFIED, 
                        indent: { 
                            left: 2126.25, 
                            firstLine: 709 
                        },
                        children: [
                            new TextRun({
                                text: "(подпись) \t\t\t\t\t (Ф.И.О.)",
                                size: 20,
                            }),
                        ],
                    }),


                    new Paragraph({
                        alignment: AlignmentType.JUSTIFIED, 
                        children: [
                            new TextRun({
                                text: "принял ________________      _______________ \t\t ______________________________",
                                size: 24,
                            }),
                        ],
                    }),

                    new Paragraph({
                        alignment: AlignmentType.JUSTIFIED, 
                        indent: { 
                            left: 510.3, 
                            firstLine: 709 
                        },
                        children: [
                            new TextRun({
                                text: "(должность)\t\t(подпись)\t\t\t\t (Ф.И.О.)",
                                size: 20,
                            }),
                        ],
                    }),

                    new Paragraph({}),
                    new Paragraph({}),

                    new Paragraph({
                        alignment: AlignmentType.left, 
                        children: [
                            new TextRun({
                                text: "Примечание: После проверки обязательной контрольной работы преподаватель сдает заполненную ведомость и контрольные работы (обязательные, домашние) в заочное отделение.",
                                size: 24,
                            }),
                        ],
                    }),

                    new Paragraph({
                        alignment: AlignmentType.left, 
                        children: [
                            new TextRun({
                                text: "_____________________________________________________________________________",
                                size: 24,
                            }),
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
                bold: false,
                size: 22,
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
